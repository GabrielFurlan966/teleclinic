import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User, UserRole
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate
from app.core.redis import get_redis

CACHE_TTL = 60


def _invalidate_cache():
    redis = get_redis()
    keys = redis.keys("appointments:*")
    if keys:
        redis.delete(*keys)


def get_appointment(db: Session, appointment_id: int) -> Appointment:
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appt


def get_appointments(db: Session, skip: int = 0, limit: int = 20) -> list[Appointment]:
    redis = get_redis()
    cache_key = f"appointments:list:{skip}:{limit}"

    cached = redis.get(cache_key)
    if cached:
        ids = json.loads(cached)
        return db.query(Appointment).filter(Appointment.id.in_(ids)).all()

    appts = db.query(Appointment).offset(skip).limit(limit).all()
    redis.setex(cache_key, CACHE_TTL, json.dumps([a.id for a in appts]))
    return appts


def get_patient_appointments(db: Session, patient_id: int) -> list[Appointment]:
    redis = get_redis()
    cache_key = f"appointments:patient:{patient_id}"

    cached = redis.get(cache_key)
    if cached:
        ids = json.loads(cached)
        return db.query(Appointment).filter(Appointment.id.in_(ids)).all()

    appts = db.query(Appointment).filter(Appointment.patient_id == patient_id).all()
    redis.setex(cache_key, CACHE_TTL, json.dumps([a.id for a in appts]))
    return appts


def create_appointment(db: Session, appt_in: AppointmentCreate, current_doctor: User) -> Appointment:
    patient = db.query(User).filter(User.id == appt_in.patient_id).first()
    if not patient or patient.role != UserRole.patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid patient ID"
        )

    appointment = Appointment(
        patient_id=appt_in.patient_id,
        doctor_id=current_doctor.id,
        scheduled_at=appt_in.scheduled_at,
        notes=appt_in.notes,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    _invalidate_cache()
    return appointment


def update_appointment(db: Session, appointment_id: int, appt_in: AppointmentUpdate) -> Appointment:
    appt = get_appointment(db, appointment_id)
    if appt.status == AppointmentStatus.cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update a cancelled appointment"
        )
    update_data = appt_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appt, field, value)
    db.commit()
    db.refresh(appt)
    _invalidate_cache()
    return appt


def cancel_appointment(db: Session, appointment_id: int) -> Appointment:
    appt = get_appointment(db, appointment_id)
    appt.status = AppointmentStatus.cancelled
    db.commit()
    db.refresh(appt)
    _invalidate_cache()
    return appt
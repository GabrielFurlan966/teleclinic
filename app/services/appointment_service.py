from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User, UserRole
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate


def get_appointment(db: Session, appointment_id: int) -> Appointment:
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appt


def get_appointments(db: Session, skip: int = 0, limit: int = 20) -> list[Appointment]:
    return db.query(Appointment).offset(skip).limit(limit).all()


def get_patient_appointments(db: Session, patient_id: int) -> list[Appointment]:
    return db.query(Appointment).filter(Appointment.patient_id == patient_id).all()


def create_appointment(db: Session, appt_in: AppointmentCreate, current_doctor: User) -> Appointment:
    # Validate patient exists
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
    return appt


def cancel_appointment(db: Session, appointment_id: int) -> Appointment:
    appt = get_appointment(db, appointment_id)
    appt.status = AppointmentStatus.cancelled
    db.commit()
    db.refresh(appt)
    return appt

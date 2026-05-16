from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from app.services import appointment_service
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    appt_in: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Schedule a new appointment. The logged-in user is set as the patient."""
    return appointment_service.create_appointment(db, appt_in, current_doctor=current_user)


@router.get("/", response_model=List[AppointmentResponse])
def list_appointments(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all appointments."""
    return appointment_service.get_appointments(db, skip=skip, limit=limit)


@router.get("/my", response_model=List[AppointmentResponse])
def my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get appointments for the currently authenticated patient."""
    return appointment_service.get_patient_appointments(db, current_user.id)


@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific appointment by ID."""
    return appointment_service.get_appointment(db, appointment_id)


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    appt_in: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update appointment details or status."""
    return appointment_service.update_appointment(db, appointment_id, appt_in)


@router.delete("/{appointment_id}/cancel", response_model=AppointmentResponse)
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel an appointment."""
    return appointment_service.cancel_appointment(db, appointment_id)

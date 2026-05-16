from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.appointment import AppointmentStatus
from app.schemas.user import UserResponse


class AppointmentBase(BaseModel):
    scheduled_at: datetime
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None


class AppointmentUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    id: int
    patient_id: int
    doctor_id: int
    status: AppointmentStatus
    created_at: datetime
    patient: UserResponse
    doctor: UserResponse

    class Config:
        from_attributes = True
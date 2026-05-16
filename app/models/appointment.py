from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class AppointmentStatus(str, enum.Enum):
    scheduled = "scheduled"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.scheduled)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("User", foreign_keys=[patient_id], back_populates="appointments")
    doctor = relationship("User", foreign_keys=[doctor_id])

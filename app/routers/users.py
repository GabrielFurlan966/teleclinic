from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.services import user_service
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user (patient, doctor, or admin)."""
    return user_service.create_user(db, user_in)


@router.get("/", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all users. Requires authentication."""
    return user_service.get_users(db, skip=skip, limit=limit)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user."""
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific user by ID."""
    return user_service.get_user(db, user_id)


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a user's information."""
    return user_service.update_user(db, user_id, user_in)


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a user."""
    return user_service.delete_user(db, user_id)

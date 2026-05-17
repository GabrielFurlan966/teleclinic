from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import Token
from app.services.user_service import authenticate_user
from app.core.security import create_access_token, get_current_user, oauth2_scheme
from app.core.redis import get_redis
from app.core.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(
    token: str = Depends(oauth2_scheme),
    current_user=Depends(get_current_user),
):
    """Revoke the current JWT token."""
    redis = get_redis()
    ttl = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    redis.setex(f"blacklist:{token}", ttl, "1")
    return {"message": "Successfully logged out"}
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import Token, PasswordResetRequest, PasswordReset
from app.services.auth_service import (
    get_user_by_email,
    create_user,
    authenticate_user,
    create_password_reset_token,
    reset_password,
)
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, user_data.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = create_user(db, user_data)
    return user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # OAuth2 "username" alanını biz email olarak kullanıyoruz
    user = authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


from app.services.mail_service import send_reset_password_email

@router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    token = create_password_reset_token(db, request.email)
    
    if token:
        # E-posta gönderimini başlat
        # Gerçek bir hata durumunda bile kullanıcıya güvenlik nedeniyle aynı mesajı dönmek iyidir (e-posta adresi ifşasını önlemek için)
        await send_reset_password_email(request.email, token)
        print(f"PASSWORD RESET LINK SENT TO {request.email}")
    
    return {"message": "If the email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password_route(request: PasswordReset, db: Session = Depends(get_db)):
    success = reset_password(db, request.token, request.new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )
        
    return {"message": "Password has been reset successfully."}


@router.get("/me", response_model=UserResponse)
def get_me(current_user=Depends(get_current_user)):
    return current_user
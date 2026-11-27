import bcrypt

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.models.guest import Guest

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.auth.jwt_handler import create_access_token

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_customer(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        (User.email == user.email) |
        (User.username == user.username)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email or username already registered"
        )

    existing_guest = db.query(Guest).filter(
        Guest.email == user.email
    ).first()

    if existing_guest:
        raise HTTPException(
            status_code=409,
            detail="A guest profile with this email already exists"
        )

    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    try:
        new_user = User(
            username=user.username,
            email=user.email,
            password=hashed_password,
            role="customer"
        )

        db.add(new_user)
        db.flush()

        new_guest = Guest(
            user_id=new_user.id,
            guest_name=user.username,
            phone=user.phone,
            email=user.email,
            room_number=0
        )

        db.add(new_guest)
        db.commit()
        db.refresh(new_user)

        return {
            "message": "Customer registered successfully",
            "username": new_user.username,
            "email": new_user.email,
            "role": new_user.role
        }

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Registration failed"
        )


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not bcrypt.checkpw(
        form_data.password.encode("utf-8"),
        existing_user.password.encode("utf-8")
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": existing_user.email,
            "role": existing_user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": existing_user.username,
        "email": existing_user.email,
        "role": existing_user.role
    }

import logging
import bcrypt

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from app.models.guest import Guest
from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.auth.jwt_handler import create_access_token

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_customer(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    if len(user.password.encode("utf-8")) > 72:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must not exceed 72 UTF-8 bytes"
        )

    try:
        existing_user = db.query(User).filter(
            (User.email == user.email) |
            (User.username == user.username)
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email or username already registered"
            )

        existing_guest = db.query(Guest).filter(
            Guest.email == user.email
        ).first()

        if existing_guest:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A guest profile with this email already exists"
            )

        hashed_password = bcrypt.hashpw(
            user.password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

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

    except HTTPException:
        db.rollback()
        raise

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email or username already registered"
        )

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Database error during customer registration")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    try:
        existing_user = db.query(User).filter(
            User.email == form_data.username
        ).first()

        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        try:
            password_valid = bcrypt.checkpw(
                form_data.password.encode("utf-8"),
                existing_user.password.encode("utf-8")
            )
        except (ValueError, TypeError):
            password_valid = False

        if not password_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
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

    except HTTPException:
        raise

    except SQLAlchemyError:
        logger.exception("Database error during login")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

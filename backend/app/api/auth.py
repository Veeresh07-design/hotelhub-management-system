import bcrypt
from app.auth.jwt_handler import create_access_token

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate

router = APIRouter()


@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    new_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password,
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == form_data.username).first()

    if not existing_user:
        return {"message": "User not found"}

    if not bcrypt.checkpw(
        form_data.password.encode("utf-8"),
        existing_user.password.encode("utf-8")
    ):
        return {"message": "Invalid password"}

    access_token = create_access_token(
        data={
            "sub": existing_user.email,
            "role": existing_user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
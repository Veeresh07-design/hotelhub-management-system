
from pydantic import BaseModel, EmailStr, Field


class GuestCreate(BaseModel):
    guest_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(
        pattern=r"^\+?[0-9]{10,15}$"
    )
    email: EmailStr
    room_number: int = Field(ge=0)


class GuestUpdate(BaseModel):
    guest_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(
        pattern=r"^\+?[0-9]{10,15}$"
    )
    email: EmailStr
    room_number: int = Field(ge=0)

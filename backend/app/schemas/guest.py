from pydantic import BaseModel


class GuestCreate(BaseModel):
    guest_name: str
    phone: str
    email: str
    room_number: int


class GuestUpdate(BaseModel):
    guest_name: str
    phone: str
    email: str
    room_number: int
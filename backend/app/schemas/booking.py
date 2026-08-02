from pydantic import BaseModel


class BookingCreate(BaseModel):
    guest_id: int
    room_id: int
    check_in: str
    check_out: str
    status: str


class BookingUpdate(BaseModel):
    guest_id: int
    room_id: int
    check_in: str
    check_out: str
    status: str
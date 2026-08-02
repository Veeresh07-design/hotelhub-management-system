from pydantic import BaseModel

class RoomCreate(BaseModel):
    room_number: int
    room_type: str
    floor: int
    price: float
    status: str

class RoomUpdate(BaseModel):
    room_number: int
    room_type: str
    floor: int
    price: float
    status: str
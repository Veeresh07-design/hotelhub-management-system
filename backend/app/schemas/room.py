
from pydantic import BaseModel, Field


class RoomCreate(BaseModel):
    room_number: int = Field(gt=0)
    room_type: str = Field(min_length=2, max_length=50)
    floor: int = Field(ge=0)
    price: float = Field(gt=0)
    status: str = Field(min_length=2, max_length=20)


class RoomUpdate(BaseModel):
    room_number: int = Field(gt=0)
    room_type: str = Field(min_length=2, max_length=50)
    floor: int = Field(ge=0)
    price: float = Field(gt=0)
    status: str = Field(min_length=2, max_length=20)

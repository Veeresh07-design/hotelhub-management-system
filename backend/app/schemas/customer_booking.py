
from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


class CustomerBookingCreate(BaseModel):
    room_id: int = Field(gt=0)
    check_in: date
    check_out: date
    payment_method: Literal["Pay at Hotel", "Pay Online"] = "Pay at Hotel"

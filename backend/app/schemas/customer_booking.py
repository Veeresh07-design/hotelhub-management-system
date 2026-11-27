
from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class CustomerBookingCreate(BaseModel):
    room_id: int = Field(gt=0)
    check_in: date
    check_out: date
    payment_method: Literal[
        "Pay at Hotel", "Pay Online"
    ] = "Pay at Hotel"

    @model_validator(mode="after")
    def validate_booking_dates(self):
        if self.check_out <= self.check_in:
            raise ValueError("Check-out must be after check-in")

        return self

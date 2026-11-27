
from datetime import date

from pydantic import BaseModel, Field, field_validator, model_validator


class BookingCreate(BaseModel):
    guest_id: int = Field(gt=0)
    room_id: int = Field(gt=0)
    check_in: str
    check_out: str
    status: str = Field(min_length=2, max_length=30)

    @field_validator("check_in", "check_out")
    @classmethod
    def validate_date_format(cls, value: str) -> str:
        try:
            parsed_date = date.fromisoformat(value)
        except ValueError:
            raise ValueError("Date must use YYYY-MM-DD format")

        if parsed_date.isoformat() != value:
            raise ValueError("Date must use YYYY-MM-DD format")

        return value

    @model_validator(mode="after")
    def validate_booking_dates(self):
        if date.fromisoformat(self.check_out) <= date.fromisoformat(
            self.check_in
        ):
            raise ValueError("Check-out must be after check-in")

        return self


class BookingUpdate(BaseModel):
    guest_id: int = Field(gt=0)
    room_id: int = Field(gt=0)
    check_in: str
    check_out: str
    status: str = Field(min_length=2, max_length=30)

    @field_validator("check_in", "check_out")
    @classmethod
    def validate_date_format(cls, value: str) -> str:
        try:
            parsed_date = date.fromisoformat(value)
        except ValueError:
            raise ValueError("Date must use YYYY-MM-DD format")

        if parsed_date.isoformat() != value:
            raise ValueError("Date must use YYYY-MM-DD format")

        return value

    @model_validator(mode="after")
    def validate_booking_dates(self):
        if date.fromisoformat(self.check_out) <= date.fromisoformat(
            self.check_in
        ):
            raise ValueError("Check-out must be after check-in")

        return self

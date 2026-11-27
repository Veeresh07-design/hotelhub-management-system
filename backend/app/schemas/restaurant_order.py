
from pydantic import BaseModel, Field


class RestaurantOrderCreate(BaseModel):
    booking_id: int = Field(gt=0)
    order_date: str = Field(min_length=1)

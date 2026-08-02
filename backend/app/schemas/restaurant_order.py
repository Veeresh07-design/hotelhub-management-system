from pydantic import BaseModel


class RestaurantOrderCreate(BaseModel):
    booking_id: int
    order_date: str
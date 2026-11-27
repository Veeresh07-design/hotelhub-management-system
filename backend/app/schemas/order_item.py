
from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    restaurant_order_id: int
    menu_id: int
    quantity: int = Field(gt=0)

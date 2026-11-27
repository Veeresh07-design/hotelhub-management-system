
from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    restaurant_order_id: int = Field(gt=0)
    menu_id: int = Field(gt=0)
    quantity: int = Field(gt=0)

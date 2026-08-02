from pydantic import BaseModel


class OrderItemCreate(BaseModel):
    restaurant_order_id: int
    menu_id: int
    quantity: int
from pydantic import BaseModel


class MenuCreate(BaseModel):
    item_name: str
    category: str
    price: float
    availability: str = "Available"

class MenuUpdate(BaseModel):
    item_name: str
    category: str
    price: float
    availability: str
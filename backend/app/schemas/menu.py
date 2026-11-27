
from pydantic import BaseModel, Field


class MenuCreate(BaseModel):
    item_name: str = Field(min_length=2, max_length=100)
    category: str = Field(min_length=2, max_length=50)
    price: float = Field(gt=0)
    availability: str = Field(
        default="Available",
        pattern="^(Available|Unavailable)$"
    )


class MenuUpdate(BaseModel):
    item_name: str = Field(min_length=2, max_length=100)
    category: str = Field(min_length=2, max_length=50)
    price: float = Field(gt=0)
    availability: str = Field(
        pattern="^(Available|Unavailable)$"
    )

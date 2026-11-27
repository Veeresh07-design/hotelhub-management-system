
from sqlalchemy import (
    Column, Integer, Float, ForeignKey, CheckConstraint
)

from app.models.base import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    __table_args__ = (
        CheckConstraint(
            "quantity > 0",
            name="check_order_item_quantity"
        ),
        CheckConstraint(
            "subtotal >= 0",
            name="check_order_item_subtotal"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    restaurant_order_id = Column(
        Integer,
        ForeignKey("restaurant_orders.id"),
        nullable=False
    )

    menu_id = Column(
        Integer,
        ForeignKey("menu.id"),
        nullable=False
    )

    quantity = Column(Integer, nullable=False)
    subtotal = Column(Float, nullable=False)

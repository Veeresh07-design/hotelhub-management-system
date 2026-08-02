from sqlalchemy import Column, Integer, Float, ForeignKey
from app.models.base import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_order_id = Column(Integer, ForeignKey("restaurant_orders.id"))
    menu_id = Column(Integer, ForeignKey("menu.id"))
    quantity = Column(Integer, nullable=False)
    subtotal = Column(Float, nullable=False)
from sqlalchemy import Column, Integer, String, ForeignKey
from app.models.base import Base


class RestaurantOrder(Base):
    __tablename__ = "restaurant_orders"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    order_date = Column(String, nullable=False)
    status = Column(String, default="Pending")
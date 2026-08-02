from sqlalchemy import Column, Integer, Float, String, ForeignKey
from app.models.base import Base


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))

    room_charge = Column(Float)
    restaurant_charge = Column(Float, default=0)

    total_amount = Column(Float)

    payment_status = Column(String, default="Pending")
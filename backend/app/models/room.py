
from sqlalchemy import (
    Column, Integer, String, Float, CheckConstraint
)
from sqlalchemy.orm import relationship

from app.models.base import Base


class Room(Base):
    __tablename__ = "rooms"

    __table_args__ = (
        CheckConstraint(
            "room_number > 0",
            name="check_room_number_positive"
        ),
        CheckConstraint(
            "floor >= 0",
            name="check_room_floor"
        ),
        CheckConstraint(
            "price >= 0",
            name="check_room_price"
        ),
    )

    id = Column(Integer, primary_key=True)
    room_number = Column(Integer, unique=True, nullable=False)
    room_type = Column(String(50), nullable=False)
    floor = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String(20), nullable=False)

    bookings = relationship("Booking", back_populates="room")

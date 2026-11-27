
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base


class Guest(Base):
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=True
    )

    guest_name = Column(String(100), nullable=False)
    phone = Column(String(15), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    room_number = Column(Integer, nullable=False)

    user = relationship("User", back_populates="guest")
    bookings = relationship("Booking", back_populates="guest")

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.models.base import Base


class Guest(Base):
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True)
    guest_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    room_number = Column(Integer, nullable=False)

    bookings = relationship("Booking", back_populates="guest")
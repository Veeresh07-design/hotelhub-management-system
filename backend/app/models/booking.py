from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True)
    guest_id = Column(Integer, ForeignKey("guests.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    check_in = Column(String, nullable=False)
    check_out = Column(String, nullable=False)
    status = Column(String, nullable=False)

    guest = relationship("Guest", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")
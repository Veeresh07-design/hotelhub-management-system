from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    role = Column(String, default="customer", nullable=False)

    bookings = relationship("Booking", back_populates="user")
    guest = relationship("Guest", back_populates="user", uselist=False)
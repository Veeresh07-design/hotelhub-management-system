
from sqlalchemy import Column, Integer, String, CheckConstraint
from sqlalchemy.orm import relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        CheckConstraint(
            "role IN ('admin', 'customer')",
            name="check_user_role"
        ),
    )

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)

    role = Column(String(20), default="customer", nullable=False)

    bookings = relationship("Booking", back_populates="user")
    guest = relationship("Guest", back_populates="user", uselist=False)

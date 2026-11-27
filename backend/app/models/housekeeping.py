from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.models.base import Base


class Housekeeping(Base):
    __tablename__ = "housekeeping"

    id = Column(Integer, primary_key=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    assigned_to = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Pending")
    assigned_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    room = relationship("Room")

import logging
from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.housekeeping import Housekeeping
from app.models.room import Room
from app.auth.jwt_handler import get_current_admin


router = APIRouter()
logger = logging.getLogger(__name__)


# Request models
class StaffAssignment(BaseModel):
    assigned_to: str = Field(min_length=2, max_length=100)


class HousekeepingStatusUpdate(BaseModel):
    status: Literal["In Progress", "Completed"]


# ADMIN: View all housekeeping tasks
@router.get("/housekeeping")
def get_housekeeping_tasks(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    tasks = db.query(Housekeeping).all()

    result = []

    for task in tasks:
        room = db.query(Room).filter(
            Room.id == task.room_id
        ).first()

        result.append({
            "id": task.id,
            "room_id": task.room_id,
            "room_number": room.room_number if room else None,
            "room_type": room.room_type if room else "Unknown",
            "room_status": room.status if room else "Unknown",
            "assigned_to": task.assigned_to,
            "status": task.status,
            "assigned_at": task.assigned_at,
            "completed_at": task.completed_at
        })

    return result


# ADMIN: View pending housekeeping tasks
@router.get("/housekeeping/pending")
def get_pending_tasks(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    return db.query(Housekeeping).filter(
        Housekeeping.status == "Pending"
    ).all()


# ADMIN: Assign housekeeping staff
@router.put("/housekeeping/{task_id}/assign")
def assign_staff(
    task_id: int,
    assignment: StaffAssignment,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    task = db.query(Housekeeping).filter(
        Housekeeping.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Housekeeping task not found"
        )

    if task.status == "Completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot assign a completed task"
        )

    try:
        task.assigned_to = assignment.assigned_to.strip()

        if len(task.assigned_to) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Staff name must contain at least 2 characters"
            )

        db.commit()
        db.refresh(task)

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error assigning housekeeping staff")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to assign housekeeping staff"
        )

    return {
        "message": "Staff assigned successfully",
        "task_id": task.id,
        "assigned_to": task.assigned_to
    }


# ADMIN: Update housekeeping status
@router.put("/housekeeping/{task_id}/status")
def update_housekeeping_status(
    task_id: int,
    update: HousekeepingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    task = db.query(Housekeeping).filter(
        Housekeeping.id == task_id
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Housekeeping task not found"
        )

    if task.status == "Completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task is already completed"
        )

    if update.status == "Completed" and task.status != "In Progress":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task must be In Progress before completion"
        )

    if update.status == "In Progress" and task.status != "Pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending tasks can be started"
        )

    try:
        task.status = update.status

        if update.status == "Completed":
            task.completed_at = datetime.utcnow()

            room = db.query(Room).filter(
                Room.id == task.room_id
            ).first()

            # Mark room available only if it is currently being cleaned.
            # Do not overwrite Maintenance or Out of Service status.
            if room and room.status == "Cleaning":
                room.status = "Available"

        db.commit()
        db.refresh(task)

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error updating housekeeping status")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update housekeeping status"
        )

    return {
        "message": "Housekeeping status updated successfully",
        "task_id": task.id,
        "status": task.status
    }

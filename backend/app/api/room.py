
import logging
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.room import Room
from app.models.booking import Booking
from app.schemas.room import RoomCreate, RoomUpdate
from app.auth.jwt_handler import get_current_admin


router = APIRouter()
logger = logging.getLogger(__name__)


# PUBLIC: Get available rooms based on dates
@router.get("/rooms/available")
def get_available_rooms(
    check_in: date,
    check_out: date,
    guests: int = Query(1, ge=1),
    db: Session = Depends(get_db)
):
    if check_out <= check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be after check-in date"
        )

    # Find bookings overlapping the requested dates
    overlapping_bookings = db.query(
        Booking.room_id
    ).filter(
        Booking.check_in < check_out.isoformat(),
        Booking.check_out > check_in.isoformat(),
        Booking.status.notin_([
            "Cancelled",
            "Canceled",
            "Checked Out"
        ])
    ).all()

    booked_room_ids = [row[0] for row in overlapping_bookings]

    # Find rooms available for the requested dates
    available_rooms = db.query(Room).filter(
        Room.id.notin_(booked_room_ids),
        Room.status.notin_([
            "Maintenance",
            "Cleaning",
            "Out of Service"
        ])
    ).all()

    return [
        {
            "id": room.id,
            "room_number": room.room_number,
            "room_type": room.room_type,
            "floor": room.floor,
            "price": room.price,
            "status": room.status
        }
        for room in available_rooms
    ]


# ADMIN: View all rooms
@router.get("/rooms")
def get_rooms(
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Room).all()


# ADMIN: Add room
@router.post("/rooms", status_code=status.HTTP_201_CREATED)
def post_rooms(
    room: RoomCreate,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    new_room = Room(
        room_number=room.room_number,
        room_type=room.room_type,
        floor=room.floor,
        price=room.price,
        status=room.status
    )

    try:
        db.add(new_room)
        db.commit()
        db.refresh(new_room)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Room number already exists"
        )

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error adding room")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to add room"
        )

    return {
        "message": "Room added successfully",
        "room_id": new_room.id
    }


# ADMIN: Update room
@router.put("/rooms/{id}")
def update_room(
    id: int,
    room: RoomUpdate,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    db_room = db.query(Room).filter(Room.id == id).first()

    if db_room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    try:
        db_room.room_number = room.room_number
        db_room.room_type = room.room_type
        db_room.floor = room.floor
        db_room.price = room.price
        db_room.status = room.status

        db.commit()
        db.refresh(db_room)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Room number already exists"
        )

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error updating room")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update room"
        )

    return {
        "message": "Room updated successfully",
        "room_id": db_room.id
    }


# ADMIN: Delete room
@router.delete("/rooms/{id}")
def delete_room(
    id: int,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    db_room = db.query(Room).filter(Room.id == id).first()

    if db_room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    try:
        db.delete(db_room)
        db.commit()

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete this room because it is linked to existing records"
        )

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error deleting room")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete room"
        )

    return {
        "message": "Room deleted successfully"
    }


# ADMIN: Verify admin access
@router.get("/admin-only")
def admin_only(
    current_user: dict = Depends(get_current_admin)
):
    return {
        "message": f"Welcome Admin {current_user['email']}"
    }


# Search rooms
@router.get("/rooms/search")
def search_rooms(
    room_type: str = Query(None),
    status: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Room)

    if room_type:
        query = query.filter(Room.room_type == room_type)

    if status:
        query = query.filter(Room.status == status)

    return query.all()

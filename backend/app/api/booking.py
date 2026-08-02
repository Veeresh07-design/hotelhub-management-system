from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import Query

from app.database.database import get_db
from app.models.booking import Booking
from app.schemas.booking import BookingCreate, BookingUpdate
from app.models.room import Room

router = APIRouter()


@router.get("/bookings")
def get_bookings(
    db: Session = Depends(get_db)
):
    bookings = db.query(Booking).all()
    return bookings


@router.post("/bookings")
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db)
):
    db_room = db.query(Room).filter(Room.id == booking.room_id).first()

    if db_room is None:
        return {
            "message": "Room not found"
        }
    
    if db_room.status == "Occupied":
        return {
            "message": "Room not available"
        }

    new_booking = Booking(
        guest_id=booking.guest_id,
        room_id=booking.room_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        status=booking.status
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    db_room.status = "Occupied"

    db.commit()
    db.refresh(db_room)

    return {"message": "Booking created successfully"}

@router.put("/bookings/{booking_id}")
def update_booking(
    booking_id: int,
    booking: BookingUpdate,
    db: Session = Depends(get_db)
):
    existing_booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not existing_booking:
        return {"message": "Booking not found"}

    existing_booking.guest_id = booking.guest_id
    existing_booking.room_id = booking.room_id
    existing_booking.check_in = booking.check_in
    existing_booking.check_out = booking.check_out
    existing_booking.status = booking.status

    db.commit()

    return {"message": "Booking updated successfully"}

@router.delete("/bookings/{booking_id}")
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):
    existing_booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not existing_booking:
        return {"message": "Booking not found"}

    db.delete(existing_booking)
    db.commit()

    return {"message": "Booking deleted successfully"}

@router.put("/bookings/checkin/{booking_id}")
def check_in(
    booking_id: int,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if booking is None:
        return {
            "message": "Booking not found"
        }

    if booking.status != "Booked":
        return {
            "message": "Guest cannot check in"
        }

    booking.status = "Checked In"

    db.commit()
    db.refresh(booking)

    return {
        "message": "Guest checked in successfully"
    }

@router.put("/bookings/checkout/{booking_id}")
def check_out(
    booking_id: int,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if booking is None:
        return {
            "message": "Booking not found"
        }

    if booking.status != "Checked In":
        return {
            "message": "Guest is not checked in"
        }

    room = db.query(Room).filter(Room.id == booking.room_id).first()

    booking.status = "Checked Out"

    if room:
        room.status = "Available"

    db.commit()

    db.refresh(booking)

    if room:
        db.refresh(room)

    return {
        "message": "Guest checked out successfully"
    }

@router.get("/bookings/search")
def search_bookings(
    status: str = Query(None),
    guest_id: int = Query(None),
    room_id: int = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Booking)

    if status:
        query = query.filter(Booking.status == status)

    if guest_id:
        query = query.filter(Booking.guest_id == guest_id)

    if room_id:
        query = query.filter(Booking.room_id == room_id)

    return query.all()
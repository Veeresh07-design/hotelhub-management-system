
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.models.guest import Guest
from app.models.room import Room
from app.models.booking import Booking
from app.auth.jwt_handler import get_current_customer
from app.schemas.customer_booking import CustomerBookingCreate


logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/customer/profile")
def get_customer_profile(
    current_user: dict = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == current_user["email"]
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    guest = db.query(Guest).filter(
        Guest.user_id == user.id
    ).first()

    if not guest:
        raise HTTPException(
            status_code=404,
            detail="Guest profile not found"
        )

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "phone": guest.phone,
        "role": user.role
    }


@router.get("/customer/bookings")
def get_customer_bookings(
    current_user: dict = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == current_user["email"]
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    bookings = db.query(Booking).filter(
        Booking.user_id == user.id
    ).all()

    return bookings


@router.post("/customer/bookings", status_code=201)
def create_customer_booking(
    booking: CustomerBookingCreate,
    current_user: dict = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == current_user["email"]
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    guest = db.query(Guest).filter(
        Guest.user_id == user.id
    ).first()

    if not guest:
        raise HTTPException(
            status_code=404,
            detail="Guest profile not found"
        )

    if booking.check_out <= booking.check_in:
        raise HTTPException(
            status_code=400,
            detail="Check-out must be after check-in"
        )

    room = db.query(Room).filter(
        Room.id == booking.room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    if room.status in ["Maintenance", "Cleaning", "Out of Service"]:
        raise HTTPException(
            status_code=409,
            detail="Room is currently unavailable"
        )

    overlapping_booking = db.query(Booking).filter(
        Booking.room_id == booking.room_id,
        Booking.check_in < booking.check_out.isoformat(),
        Booking.check_out > booking.check_in.isoformat(),
        Booking.status.notin_(
            ["Cancelled", "Canceled", "Checked Out"]
        )
    ).first()

    if overlapping_booking:
        raise HTTPException(
            status_code=409,
            detail="Room is already booked for these dates"
        )

    new_booking = Booking(
        user_id=user.id,
        guest_id=guest.id,
        room_id=room.id,
        check_in=booking.check_in.isoformat(),
        check_out=booking.check_out.isoformat(),
        status="Booked",
        payment_method=booking.payment_method,
        payment_status="Pending"
    )

    try:
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)

        logger.info(
            "Customer booking created successfully. Booking ID: %s",
            new_booking.id
        )

        return {
            "message": "Reservation created successfully",
            "booking_id": new_booking.id,
            "room_id": new_booking.room_id,
            "check_in": new_booking.check_in,
            "check_out": new_booking.check_out,
            "status": new_booking.status,
            "payment_method": new_booking.payment_method,
            "payment_status": new_booking.payment_status
        }

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Database error while creating customer booking")

        raise HTTPException(
            status_code=500,
            detail="Unable to create reservation"
        )


@router.put("/customer/bookings/{booking_id}/cancel")
def cancel_customer_booking(
    booking_id: int,
    current_user: dict = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == current_user["email"]
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    # Only allow customers to access their own bookings.
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == user.id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    if booking.status in ["Checked In", "Checked Out"]:
        raise HTTPException(
            status_code=400,
            detail="This booking cannot be cancelled"
        )

    if booking.status in ["Cancelled", "Canceled"]:
        raise HTTPException(
            status_code=400,
            detail="Booking is already cancelled"
        )

    if booking.status != "Booked":
        raise HTTPException(
            status_code=400,
            detail="Only booked reservations can be cancelled"
        )

    try:
        booking.status = "Cancelled"

        db.commit()
        db.refresh(booking)

        logger.info(
            "Customer booking cancelled successfully. Booking ID: %s",
            booking.id
        )

        return {
            "message": "Booking cancelled successfully",
            "booking_id": booking.id,
            "status": booking.status
        }

    except SQLAlchemyError:
        db.rollback()
        logger.exception(
            "Database error while cancelling booking ID: %s",
            booking_id
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to cancel booking"
        )

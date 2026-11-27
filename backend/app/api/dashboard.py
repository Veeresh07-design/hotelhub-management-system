
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.models.room import Room
from app.models.guest import Guest
from app.models.booking import Booking
from app.models.bill import Bill
from app.auth.jwt_handler import get_current_admin

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    total_rooms = db.query(Room).count()

    available_rooms = db.query(Room).filter(
        Room.status == "Available"
    ).count()

    occupied_rooms = db.query(Room).filter(
        Room.status == "Occupied"
    ).count()

    total_guests = db.query(Guest).count()

    active_bookings = db.query(Booking).filter(
        Booking.status == "Checked In"
    ).count()

    total_bills = db.query(Bill).count()

    pending_payments = db.query(Bill).filter(
        Bill.payment_status == "Pending"
    ).count()

    completed_checkouts = db.query(Booking).filter(
        Booking.status == "Checked Out"
    ).count()

    room_revenue = db.query(
        func.sum(Bill.room_charge)
    ).scalar() or 0

    restaurant_revenue = db.query(
        func.sum(Bill.restaurant_charge)
    ).scalar() or 0

    total_revenue = db.query(
        func.sum(Bill.total_amount)
    ).scalar() or 0

    pending_revenue = db.query(
        func.sum(Bill.total_amount)
    ).filter(
        Bill.payment_status == "Pending"
    ).scalar() or 0

    return {
        "total_rooms": total_rooms,
        "available_rooms": available_rooms,
        "occupied_rooms": occupied_rooms,
        "total_guests": total_guests,
        "active_bookings": active_bookings,
        "total_bills": total_bills,
        "pending_payments": pending_payments,
        "completed_checkouts": completed_checkouts,
        "room_revenue": room_revenue,
        "restaurant_revenue": restaurant_revenue,
        "total_revenue": total_revenue,
        "pending_revenue": pending_revenue
    }

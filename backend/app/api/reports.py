from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.models.booking import Booking
from app.models.bill import Bill
from app.models.restaurant_order import RestaurantOrder

router = APIRouter(tags=["Reports"])

@router.get("/reports/bookings")
def booking_report(db: Session = Depends(get_db)):
    bookings = db.query(Booking).all()

    checked_in = len(
        [b for b in bookings if b.status == "Checked In"]
    )

    checked_out = len(
        [b for b in bookings if b.status == "Checked Out"]
    )

    booked = len(
        [b for b in bookings if b.status == "Booked"]
    )

    return {
        "summary": {
            "total_bookings": len(bookings),
            "booked": booked,
            "checked_in": checked_in,
            "checked_out": checked_out
        },
        "bookings": bookings
    }

@router.get("/reports/revenue")
def revenue_report(db: Session = Depends(get_db)):

    bills = db.query(Bill).all()

    total_revenue = sum(bill.total_amount for bill in bills)
    room_revenue = sum(bill.room_charge for bill in bills)
    restaurant_revenue = sum(bill.restaurant_charge for bill in bills)

    paid_bills = len(
        [bill for bill in bills if bill.payment_status == "Paid"]
    )

    pending_bills = len(
        [bill for bill in bills if bill.payment_status == "Pending"]
    )

    return {
        "summary": {
            "total_revenue": total_revenue,
            "room_revenue": room_revenue,
            "restaurant_revenue": restaurant_revenue,
            "paid_bills": paid_bills,
            "pending_bills": pending_bills
        },
        "bills": bills
    }

@router.get("/reports/restaurant")
def restaurant_report(db: Session = Depends(get_db)):
    restaurant_orders = db.query(RestaurantOrder).all()

    completed_orders = len(
        [o for o in restaurant_orders if o.status == "Completed"]
    )

    pending_orders = len(
        [o for o in restaurant_orders if o.status == "Pending"]
    )

    return {
        "summary": {
            "total_orders": len(restaurant_orders),
            "completed_orders": completed_orders,
            "pending_orders": pending_orders
        },
        "orders": restaurant_orders
    }
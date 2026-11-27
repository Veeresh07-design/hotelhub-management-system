from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.bill import Bill
from app.models.restaurant_order import RestaurantOrder

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.get("/bookings")
def booking_report(db: Session = Depends(get_db)):
    bookings = db.query(Booking).all()

    return {
        "summary": {
            "total_bookings": len(bookings),
            "booked": sum(1 for b in bookings if b.status == "Booked"),
            "checked_in": sum(1 for b in bookings if b.status == "Checked In"),
            "checked_out": sum(1 for b in bookings if b.status == "Checked Out")
        },
        "bookings": bookings
    }


@router.get("/revenue")
def revenue_report(db: Session = Depends(get_db)):
    bills = db.query(Bill).all()

    total_revenue = sum(
        bill.total_amount or 0 for bill in bills
    )

    paid_revenue = sum(
        bill.total_amount or 0
        for bill in bills
        if bill.payment_status == "Paid"
    )

    pending_revenue = sum(
        bill.total_amount or 0
        for bill in bills
        if bill.payment_status == "Pending"
    )

    return {
        "summary": {
            "total_bills": len(bills),
            "total_revenue": total_revenue,
            "paid_revenue": paid_revenue,
            "pending_revenue": pending_revenue,
            "paid_bills": sum(
                1 for bill in bills if bill.payment_status == "Paid"
            ),
            "pending_bills": sum(
                1 for bill in bills if bill.payment_status == "Pending"
            )
        },
        "bills": bills
    }


@router.get("/restaurant")
def restaurant_report(db: Session = Depends(get_db)):
    orders = db.query(RestaurantOrder).all()

    return {
        "summary": {
            "total_orders": len(orders),
            "completed_orders": sum(
                1 for order in orders if order.status == "Served"
            ),
            "pending_orders": sum(
                1 for order in orders if order.status == "Pending"
            )
        },
        "orders": orders
    }
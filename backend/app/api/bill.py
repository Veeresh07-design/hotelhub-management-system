
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.bill import Bill
from app.models.booking import Booking
from app.models.room import Room
from app.models.restaurant_order import RestaurantOrder
from app.models.order_item import OrderItem
from app.auth.jwt_handler import get_current_admin


router = APIRouter()
logger = logging.getLogger(__name__)


# ADMIN: View all bills
@router.get("/bills")
def get_bills(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    return db.query(Bill).all()


# ADMIN: Search bills
@router.get("/bills/search")
def search_bills(
    payment_status: str = Query(None),
    booking_id: int = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    query = db.query(Bill)

    if payment_status:
        query = query.filter(
            Bill.payment_status == payment_status
        )

    if booking_id is not None:
        query = query.filter(
            Bill.booking_id == booking_id
        )

    return query.all()


# ADMIN: View a specific bill
@router.get("/bills/{bill_id}")
def get_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    bill = db.query(Bill).filter(
        Bill.id == bill_id
    ).first()

    if bill is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found"
        )

    return bill


# ADMIN: Mark bill as Paid
@router.put("/bills/pay/{bill_id}")
def pay_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    bill = db.query(Bill).filter(
        Bill.id == bill_id
    ).first()

    if bill is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bill not found"
        )

    if bill.payment_status == "Paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bill is already paid"
        )

    booking = db.query(Booking).filter(
        Booking.id == bill.booking_id
    ).first()

    try:
        bill.payment_status = "Paid"

        if booking:
            booking.payment_status = "Paid"

        db.commit()
        db.refresh(bill)

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error processing bill payment")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process payment"
        )

    return {
        "message": "Payment successful",
        "bill_id": bill.id,
        "payment_status": bill.payment_status
    }


# ADMIN: Generate bill after checkout
@router.post(
    "/bills/{booking_id}",
    status_code=status.HTTP_201_CREATED
)
def generate_bill(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    if booking.status != "Checked Out":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bill can only be generated after checkout"
        )

    # Check whether bill already exists
    existing_bill = db.query(Bill).filter(
        Bill.booking_id == booking.id
    ).first()

    if existing_bill:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bill already exists for this booking"
        )

    room = db.query(Room).filter(
        Room.id == booking.room_id
    ).first()

    if room is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    # Validate booking duration
    try:
        check_in = datetime.strptime(
            booking.check_in,
            "%Y-%m-%d"
        )

        check_out = datetime.strptime(
            booking.check_out,
            "%Y-%m-%d"
        )

        number_of_days = (check_out - check_in).days

        if number_of_days <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid booking duration"
            )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid booking date format"
        )

    # Calculate room charges
    room_charge = room.price * number_of_days

    # Calculate restaurant charges
    restaurant_orders = db.query(RestaurantOrder).filter(
        RestaurantOrder.booking_id == booking.id
    ).all()

    restaurant_charge = 0

    for order in restaurant_orders:
        items = db.query(OrderItem).filter(
            OrderItem.restaurant_order_id == order.id
        ).all()

        restaurant_charge += sum(
            item.subtotal for item in items
        )

    total_amount = room_charge + restaurant_charge

    # Create bill
    bill = Bill(
        booking_id=booking.id,
        room_charge=room_charge,
        restaurant_charge=restaurant_charge,
        total_amount=total_amount,
        payment_status=booking.payment_status or "Pending"
    )

    try:
        db.add(bill)
        db.commit()
        db.refresh(bill)

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error generating bill")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate bill"
        )

    return {
        "message": "Bill generated successfully",
        "bill_id": bill.id,
        "room_charge": bill.room_charge,
        "restaurant_charge": bill.restaurant_charge,
        "total_amount": bill.total_amount,
        "payment_status": bill.payment_status
    }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import Query

from app.database.database import get_db
from app.models.bill import Bill
from app.models.booking import Booking
from app.models.room import Room
from datetime import datetime
from app.models.restaurant_order import RestaurantOrder
from app.models.order_item import OrderItem

router = APIRouter()

@router.get("/bills")
def get_bills(
    db: Session = Depends(get_db)
):
    bills = db.query(Bill).all()
    return bills\

@router.get("/bills/search")
def search_bills(
    payment_status: str = Query(None),
    booking_id: int = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Bill)

    if payment_status:
        query = query.filter(Bill.payment_status == payment_status)

    if booking_id:
        query = query.filter(Bill.booking_id == booking_id)

    return query.all()

@router.get("/bills/{bill_id}")
def get_bill(
    bill_id: int,
    db: Session = Depends(get_db)
):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()

    if bill is None:
        return {
            "message": "Bill not found"
        }

    return bill

@router.put("/bills/pay/{bill_id}")
def pay_bill(
    bill_id: int,
    db: Session = Depends(get_db)
):
    bill = db.query(Bill).filter(Bill.id == bill_id).first()

    if bill is None:
        return {
            "message": "Bill not found"
        }

    if bill.payment_status == "Paid":
        return {
            "message": "Bill is already paid"
        }

    bill.payment_status = "Paid"

    db.commit()
    db.refresh(bill)

    return {
        "message": "Payment successful"
    }

@router.post("/bills/{booking_id}")
def generate_bill(
    booking_id: int,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if booking is None:
        return {
            "message": "Booking not found"
        }

    room = db.query(Room).filter(Room.id == booking.room_id).first()

    if room is None:
        return {
            "message": "Room not found"
        }

    existing_bill = db.query(Bill).filter(Bill.booking_id == booking.id).first()

    if existing_bill:
        return {
            "message": "Bill already exists for this booking"
        }

    check_in = datetime.strptime(booking.check_in, "%Y-%m-%d")
    check_out = datetime.strptime(booking.check_out, "%Y-%m-%d")

    number_of_days = (check_out - check_in).days

    room_charge = room.price * number_of_days

    restaurant_orders = db.query(RestaurantOrder).filter(
        RestaurantOrder.booking_id == booking.id
    ).all()

    print("Booking ID:", booking.id)
    print("Restaurant Orders:", restaurant_orders)

    restaurant_charge = 0

    for order in restaurant_orders:
        items = db.query(OrderItem).filter(
            OrderItem.restaurant_order_id == order.id
        ).all()

        restaurant_charge += sum(item.subtotal for item in items)

    bill = Bill(
        booking_id=booking.id,
        room_charge=room_charge,
        restaurant_charge=restaurant_charge,
        total_amount=room_charge + restaurant_charge,
        payment_status="Pending"
    )

    db.add(bill)
    db.commit()
    db.refresh(bill)

    return {
        "message": "Bill generated successfully",
        "bill_id": bill.id,
        "total_amount": bill.total_amount
    }
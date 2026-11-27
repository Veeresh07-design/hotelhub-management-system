import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.booking import Booking
from app.models.room import Room
from app.models.guest import Guest
from app.models.bill import Bill
from app.models.housekeeping import Housekeeping
from app.models.restaurant_order import RestaurantOrder
from app.models.order_item import OrderItem

from app.schemas.booking import BookingCreate, BookingUpdate
from app.auth.jwt_handler import get_current_admin


router = APIRouter()
logger = logging.getLogger(__name__)


# ADMIN: View all bookings with guest and room details
@router.get("/bookings")
def get_bookings(
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    bookings = db.query(Booking).all()

    result = []

    for booking in bookings:
        guest = db.query(Guest).filter(
            Guest.id == booking.guest_id
        ).first()

        room = db.query(Room).filter(
            Room.id == booking.room_id
        ).first()

        result.append({
            "id": booking.id,
            "booking_id": booking.id,
            "check_in": booking.check_in,
            "check_out": booking.check_out,
            "status": booking.status,

            "guest_id": booking.guest_id,
            "guest_name": guest.guest_name if guest else "Unknown",
            "guest_phone": guest.phone if guest else "",
            "guest_email": guest.email if guest else "",

            "room_id": booking.room_id,
            "room_number": room.room_number if room else None,
            "room_type": room.room_type if room else "Unknown",
            "floor": room.floor if room else None,
            "price": room.price if room else None,
            "room_status": room.status if room else "Unknown",

            "user_id": booking.user_id,

            "payment_method": booking.payment_method,
            "payment_status": booking.payment_status
        })

    return result


# ADMIN: Create booking
@router.post("/bookings", status_code=status.HTTP_201_CREATED)
def create_booking(
    booking: BookingCreate,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Validate room
    db_room = db.query(Room).filter(
        Room.id == booking.room_id
    ).first()

    if not db_room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    # Validate guest
    db_guest = db.query(Guest).filter(
        Guest.id == booking.guest_id
    ).first()

    if not db_guest:
        raise HTTPException(
            status_code=404,
            detail="Guest not found"
        )

    # Validate dates
    if booking.check_out <= booking.check_in:
        raise HTTPException(
            status_code=400,
            detail="Invalid booking dates"
        )

    # Check overlapping bookings
    overlapping = db.query(Booking).filter(
        Booking.room_id == booking.room_id,
        Booking.check_in < booking.check_out,
        Booking.check_out > booking.check_in,
        Booking.status.notin_([
            "Cancelled",
            "Canceled",
            "Checked Out"
        ])
    ).first()

    if overlapping:
        raise HTTPException(
            status_code=409,
            detail="Room already booked for these dates"
        )

    # Check room status
    if db_room.status in [
        "Maintenance",
        "Cleaning",
        "Out of Service"
    ]:
        raise HTTPException(
            status_code=409,
            detail="Room is not available"
        )

    new_booking = Booking(
        guest_id=booking.guest_id,
        room_id=booking.room_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        status=booking.status
    )

    try:
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)

    except Exception:
        db.rollback()
        logger.exception("Error creating booking")

        raise HTTPException(
            status_code=500,
            detail="Unable to create booking"
        )

    return {
        "message": "Booking created successfully",
        "booking_id": new_booking.id
    }


# ADMIN: Update booking
@router.put("/bookings/{booking_id}")
def update_booking(
    booking_id: int,
    booking: BookingUpdate,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    # Prevent modifying checked-in or completed bookings
    if existing.status in ["Checked In", "Checked Out"]:
        raise HTTPException(
            status_code=409,
            detail="Cannot modify a booking that is checked in or checked out"
        )

    # Validate guest
    guest = db.query(Guest).filter(
        Guest.id == booking.guest_id
    ).first()

    if not guest:
        raise HTTPException(
            status_code=404,
            detail="Guest not found"
        )

    # Validate room
    room = db.query(Room).filter(
        Room.id == booking.room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    changing_room = existing.room_id != booking.room_id

    if changing_room and room.status in [
        "Maintenance",
        "Cleaning",
        "Out of Service",
        "Occupied"
    ]:
        raise HTTPException(
            status_code=409,
            detail="Room is not available"
        )

    # Check overlapping bookings, excluding current booking
    overlapping = db.query(Booking).filter(
        Booking.room_id == booking.room_id,
        Booking.id != booking_id,
        Booking.check_in < booking.check_out,
        Booking.check_out > booking.check_in,
        Booking.status.notin_([
            "Cancelled",
            "Canceled",
            "Checked Out"
        ])
    ).first()

    if overlapping:
        raise HTTPException(
            status_code=409,
            detail="Room already booked for these dates"
        )

    existing.guest_id = booking.guest_id
    existing.room_id = booking.room_id
    existing.check_in = booking.check_in
    existing.check_out = booking.check_out
    existing.status = booking.status

    try:
        db.commit()
        db.refresh(existing)

    except Exception:
        db.rollback()
        logger.exception("Error updating booking")

        raise HTTPException(
            status_code=500,
            detail="Unable to update booking"
        )

    return {
        "message": "Booking updated successfully",
        "booking_id": existing.id
    }


# ADMIN: Delete booking
@router.delete("/bookings/{booking_id}")
def delete_booking(
    booking_id: int,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if not existing:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    try:
        db.delete(existing)
        db.commit()

    except Exception:
        db.rollback()
        logger.exception("Error deleting booking")

        raise HTTPException(
            status_code=500,
            detail="Unable to delete booking"
        )

    return {
        "message": "Booking deleted successfully"
    }


# ADMIN: Check-in
@router.put("/bookings/checkin/{booking_id}")
def check_in(
    booking_id: int,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    if booking.status != "Booked":
        raise HTTPException(
            status_code=400,
            detail="Guest cannot check in"
        )

    room = db.query(Room).filter(
        Room.id == booking.room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    if room.status in [
        "Maintenance",
        "Cleaning",
        "Out of Service",
        "Occupied"
    ]:
        raise HTTPException(
            status_code=409,
            detail="Room is not available for check-in"
        )

    try:
        booking.status = "Checked In"
        room.status = "Occupied"

        db.commit()

    except Exception:
        db.rollback()
        logger.exception("Error during guest check-in")

        raise HTTPException(
            status_code=500,
            detail="Unable to complete check-in"
        )

    return {
        "message": "Guest checked in successfully"
    }


# ADMIN: Check-out
# Automatically creates housekeeping task and bill
@router.put("/bookings/checkout/{booking_id}")
def check_out(
    booking_id: int,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    if booking.status != "Checked In":
        raise HTTPException(
            status_code=400,
            detail="Guest is not checked in"
        )

    room = db.query(Room).filter(
        Room.id == booking.room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    try:
        # Validate booking duration
        check_in_date = datetime.strptime(
            booking.check_in,
            "%Y-%m-%d"
        )

        check_out_date = datetime.strptime(
            booking.check_out,
            "%Y-%m-%d"
        )

        number_of_days = (
            check_out_date - check_in_date
        ).days

        if number_of_days <= 0:
            raise HTTPException(
                status_code=400,
                detail="Invalid booking duration"
            )

        # Update booking and room status
        booking.status = "Checked Out"
        room.status = "Cleaning"

        # Create housekeeping task if one does not exist
        existing_task = db.query(Housekeeping).filter(
            Housekeeping.room_id == room.id,
            Housekeeping.status.in_([
                "Pending",
                "In Progress"
            ])
        ).first()

        if not existing_task:
            task = Housekeeping(
                room_id=room.id,
                status="Pending"
            )
            db.add(task)

        # Calculate room charge
        room_charge = room.price * number_of_days

        # Calculate restaurant charges
        restaurant_orders = db.query(
            RestaurantOrder
        ).filter(
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

        # Check whether bill already exists
        existing_bill = db.query(Bill).filter(
            Bill.booking_id == booking.id
        ).first()

        if existing_bill:
            existing_bill.room_charge = room_charge
            existing_bill.restaurant_charge = restaurant_charge
            existing_bill.total_amount = total_amount
            existing_bill.payment_status = (
                booking.payment_status
                or existing_bill.payment_status
                or "Pending"
            )

        else:
            new_bill = Bill(
                booking_id=booking.id,
                room_charge=room_charge,
                restaurant_charge=restaurant_charge,
                total_amount=total_amount,
                payment_status=booking.payment_status or "Pending"
            )

            db.add(new_bill)

        db.commit()
        db.refresh(booking)

        return {
            "message": "Guest checked out successfully. Bill generated.",
            "booking_id": booking.id,
            "room_number": room.room_number,
            "room_status": room.status,
            "housekeeping_status": "Pending"
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        logger.exception("Booking checkout failed")

        raise HTTPException(
            status_code=500,
            detail="Checkout failed. Please try again."
        )


# ADMIN: Search bookings
@router.get("/bookings/search")
def search_bookings(
    status: str = None,
    guest_id: int = None,
    room_id: int = None,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Booking)

    if status:
        query = query.filter(
            Booking.status == status
        )

    if guest_id is not None:
        query = query.filter(
            Booking.guest_id == guest_id
        )

    if room_id is not None:
        query = query.filter(
            Booking.room_id == room_id
        )

    return query.all()


# ADMIN: Mark booking payment as Paid
@router.put("/bookings/{booking_id}/payment")
def update_booking_payment(
    booking_id: int,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    if booking.status in ["Cancelled", "Canceled"]:
        raise HTTPException(
            status_code=400,
            detail="Cannot collect payment for a cancelled booking"
        )

    if booking.payment_method != "Pay at Hotel":
        raise HTTPException(
            status_code=400,
            detail="Only Pay at Hotel payments can be updated manually"
        )

    if booking.payment_status == "Paid":
        raise HTTPException(
            status_code=400,
            detail="Payment is already marked as Paid"
        )

    try:
        booking.payment_status = "Paid"

        # Update corresponding bill if it exists
        bill = db.query(Bill).filter(
            Bill.booking_id == booking.id
        ).first()

        if bill:
            bill.payment_status = "Paid"

        db.commit()
        db.refresh(booking)

        return {
            "message": "Payment marked as Paid successfully",
            "booking_id": booking.id,
            "payment_method": booking.payment_method,
            "payment_status": booking.payment_status
        }

    except Exception:
        db.rollback()
        logger.exception("Error updating booking payment")

        raise HTTPException(
            status_code=500,
            detail="Unable to update payment status"
        )
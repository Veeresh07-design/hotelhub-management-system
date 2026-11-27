
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.booking import Booking
from app.models.room import Room
from app.models.guest import Guest
from app.models.user import User
from app.models.bill import Bill
from app.models.housekeeping import Housekeeping
from app.models.restaurant_order import RestaurantOrder
from app.models.order_item import OrderItem

from app.schemas.booking import BookingCreate, BookingUpdate
from app.auth.jwt_handler import get_current_admin


router = APIRouter()


# ADMIN: View all bookings with complete guest and room details
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
            # Booking information
            "id": booking.id,
            "booking_id": booking.id,
            "check_in": booking.check_in,
            "check_out": booking.check_out,
            "status": booking.status,

            # Guest information
            "guest_id": booking.guest_id,
            "guest_name": guest.guest_name if guest else "Unknown",
            "guest_phone": guest.phone if guest else "",
            "guest_email": guest.email if guest else "",

            # Room information
            "room_id": booking.room_id,
            "room_number": room.room_number if room else None,
            "room_type": room.room_type if room else "Unknown",
            "floor": room.floor if room else None,
            "price": room.price if room else None,
            "room_status": room.status if room else "Unknown",

            # Customer account information
            "user_id": booking.user_id,

            # Payment information
            "payment_method": booking.payment_method,
            "payment_status": booking.payment_status
        })

    return result


# ADMIN: Create booking
@router.post("/bookings")
def create_booking(
    booking: BookingCreate,
    current_user: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    db_room = db.query(Room).filter(
        Room.id == booking.room_id
    ).first()

    if not db_room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    if booking.check_out <= booking.check_in:
        raise HTTPException(
            status_code=400,
            detail="Invalid booking dates"
        )

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

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

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

    existing.guest_id = booking.guest_id
    existing.room_id = booking.room_id
    existing.check_in = booking.check_in
    existing.check_out = booking.check_out
    existing.status = booking.status

    db.commit()

    return {
        "message": "Booking updated successfully"
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

    db.delete(existing)
    db.commit()

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

    booking.status = "Checked In"
    room.status = "Occupied"

    db.commit()

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

        # Check whether bill already exists
        existing_bill = db.query(Bill).filter(
            Bill.booking_id == booking.id
        ).first()

        if existing_bill:
            # Keep existing bill payment status synchronized
            existing_bill.payment_status = (
                booking.payment_status or "Pending"
            )

        else:
            # Calculate number of nights
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

            # Calculate room charge
            room_charge = room.price * number_of_days

            # Get restaurant orders linked to this booking
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

            # Generate bill
            new_bill = Bill(
                booking_id=booking.id,
                room_charge=room_charge,
                restaurant_charge=restaurant_charge,
                total_amount=room_charge + restaurant_charge,
                payment_status=booking.payment_status or "Pending"
            )

            db.add(new_bill)

        db.commit()

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

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Checkout failed: {str(e)}"
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

    if guest_id:
        query = query.filter(
            Booking.guest_id == guest_id
        )

    if room_id:
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

    # Find booking
    booking = db.query(Booking).filter(
        Booking.id == booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    # Check booking status
    if booking.status in ["Cancelled", "Canceled"]:
        raise HTTPException(
            status_code=400,
            detail="Cannot collect payment for a cancelled booking"
        )

    # Check payment method
    if booking.payment_method != "Pay at Hotel":
        raise HTTPException(
            status_code=400,
            detail="Only Pay at Hotel payments can be updated manually"
        )

    # Check current payment status
    if booking.payment_status == "Paid":
        raise HTTPException(
            status_code=400,
            detail="Payment is already marked as Paid"
        )

    try:
        # Update booking payment
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

        raise HTTPException(
            status_code=500,
            detail="Unable to update payment status"
        )


import logging

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.guest import Guest
from app.models.booking import Booking
from app.schemas.guest import GuestCreate, GuestUpdate
from app.database.database import get_db
from app.auth.jwt_handler import get_current_admin


router = APIRouter()
logger = logging.getLogger(__name__)


# ADMIN: View all guests
@router.get("/guests")
def get_guests(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    guests = db.query(Guest).all()

    result = []

    for guest in guests:
        room_number = guest.room_number

        # If room number is 0, get it from the latest booking
        if room_number == 0:
            latest_booking = (
                db.query(Booking)
                .filter(Booking.guest_id == guest.id)
                .order_by(Booking.id.desc())
                .first()
            )

            if latest_booking and latest_booking.room:
                room_number = latest_booking.room.room_number

        result.append({
            "id": guest.id,
            "user_id": guest.user_id,
            "guest_name": guest.guest_name,
            "email": guest.email,
            "phone": guest.phone,
            "room_number": room_number
        })

    return result


# ADMIN: Create guest
@router.post(
    "/guests",
    status_code=status.HTTP_201_CREATED
)
def create_guest(
    guest: GuestCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    new_guest = Guest(
        guest_name=guest.guest_name,
        phone=guest.phone,
        email=guest.email,
        room_number=guest.room_number
    )

    try:
        db.add(new_guest)
        db.commit()
        db.refresh(new_guest)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Guest record conflicts with existing data"
        )

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error creating guest")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create guest"
        )

    return {
        "message": "Guest created successfully",
        "guest_id": new_guest.id
    }


# ADMIN: Update guest
@router.put("/guests/{guest_id}")
def update_guest(
    guest_id: int,
    guest: GuestUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    existing_guest = db.query(Guest).filter(
        Guest.id == guest_id
    ).first()

    if not existing_guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found"
        )

    try:
        existing_guest.guest_name = guest.guest_name
        existing_guest.phone = guest.phone
        existing_guest.email = guest.email
        existing_guest.room_number = guest.room_number

        db.commit()
        db.refresh(existing_guest)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Guest information conflicts with existing data"
        )

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error updating guest")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update guest"
        )

    return {
        "message": "Guest updated successfully",
        "guest_id": existing_guest.id
    }


# ADMIN: Delete guest
@router.delete("/guests/{guest_id}")
def delete_guest(
    guest_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    existing_guest = db.query(Guest).filter(
        Guest.id == guest_id
    ).first()

    if not existing_guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found"
        )

    # Prevent deletion when booking records are linked
    linked_booking = db.query(Booking).filter(
        Booking.guest_id == guest_id
    ).first()

    if linked_booking:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete guest because booking records are linked to this guest."
        )

    try:
        db.delete(existing_guest)
        db.commit()

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error deleting guest")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete guest"
        )

    return {
        "message": "Guest deleted successfully"
    }


# ADMIN: Search guests
@router.get("/guests/search")
def search_guests(
    name: str = Query(None),
    email: str = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    query = db.query(Guest)

    if name:
        query = query.filter(
            Guest.guest_name.ilike(f"%{name}%")
        )

    if email:
        query = query.filter(
            Guest.email.ilike(f"%{email}%")
        )

    return query.all()

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.models.guest import Guest
from app.schemas.guest import GuestCreate, GuestUpdate
from app.database.database import get_db
from fastapi import Query

router = APIRouter()


@router.get("/guests")
def get_guests(
    db: Session = Depends(get_db)
):
    guests = db.query(Guest).all()
    return guests


@router.post("/guests")
def create_guest(
    guest: GuestCreate,
    db: Session = Depends(get_db)
):
    new_guest = Guest(
        guest_name=guest.guest_name,
        phone=guest.phone,
        email=guest.email,
        room_number=guest.room_number
    )

    db.add(new_guest)
    db.commit()
    db.refresh(new_guest)

    return {"message": "Guest created successfully"}

@router.put("/guests/{guest_id}")
def update_guest(
    guest_id: int,
    guest: GuestUpdate,
    db: Session = Depends(get_db)
):
    existing_guest = db.query(Guest).filter(Guest.id == guest_id).first()

    if not existing_guest:
        return {"message": "Guest not found"}

    existing_guest.guest_name = guest.guest_name
    existing_guest.phone = guest.phone
    existing_guest.email = guest.email
    existing_guest.room_number = guest.room_number

    db.commit()

    return {"message": "Guest updated successfully"}

@router.delete("/guests/{guest_id}")
def delete_guest(
    guest_id: int,
    db: Session = Depends(get_db)
):
    existing_guest = db.query(Guest).filter(Guest.id == guest_id).first()

    if not existing_guest:
        return {"message": "Guest not found"}

    db.delete(existing_guest)
    db.commit()

    return {"message": "Guest deleted successfully"}

from fastapi import Query

@router.get("/guests/search")
def search_guests(
    name: str = Query(None),
    email: str = Query(None),
    db: Session = Depends(get_db)
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
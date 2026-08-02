from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.room import Room
from app.schemas.room import RoomCreate
from app.database.database import get_db
from app.schemas.room import RoomUpdate
from app.auth.jwt_handler import get_current_user
from fastapi import Query

router = APIRouter()

@router.get("/rooms")
def get_rooms(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    rooms = db.query(Room).all()
    return rooms

@router.post("/rooms")
def post_rooms(
    room: RoomCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "admin":
        return {
            "message": "Only admins can add rooms"
        }

    new_room = Room(
        room_number=room.room_number,
        room_type=room.room_type,
        floor=room.floor,
        price=room.price,
        status=room.status
    )
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return {"message": "Room added successfully"}

@router.put("/rooms/{id}")
def update_room(
    id: int,
    room: RoomUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "admin":
        return {
            "message": "Only admins can update rooms"
        }

    db_room = db.query(Room).filter(Room.id == id).first()

    if db_room is None:
        return {"message": "Room not found"}
    
    db_room.room_number = room.room_number
    db_room.room_type = room.room_type
    db_room.floor = room.floor
    db_room.price = room.price
    db_room.status = room.status

    db.commit()
    db.refresh(db_room)

    return {
        "message": "Room updated successfully"
    }

@router.delete("/rooms/{id}")
def delete_room(
    id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "admin":
        return {
            "message": "Only admins can delete rooms"
        }

    db_room = db.query(Room).filter(Room.id == id).first()

    if db_room is None:
        return {"message": "Room not found"}
    
    db.delete(db_room)
    db.commit()

    return {"message": "Room deleted successfully"}

@router.get("/admin-only")
def admin_only(
    current_user = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        return {
            "message": "Access denied. Admins only."
        }

    return {
        "message": f"Welcome Admin {current_user['email']}"
    }

@router.get("/rooms/search")
def search_rooms(
    room_type: str = Query(None),
    status: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Room)

    if room_type:
        query = query.filter(Room.room_type == room_type)

    if status:
        query = query.filter(Room.status == status)

    return query.all()
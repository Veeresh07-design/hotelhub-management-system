from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.restaurant_order import RestaurantOrder
from app.models.booking import Booking
from app.schemas.restaurant_order import RestaurantOrderCreate

router = APIRouter(tags=["Restaurant Orders"])


@router.post("/restaurant-orders")
def create_restaurant_order(
    order: RestaurantOrderCreate,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.id == order.booking_id
    ).first()

    if booking is None:
        return {
            "message": "Booking not found"
        }

    new_order = RestaurantOrder(
        booking_id=order.booking_id,
        order_date=order.order_date
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return {
        "message": "Restaurant order created successfully",
        "order_id": new_order.id
    }
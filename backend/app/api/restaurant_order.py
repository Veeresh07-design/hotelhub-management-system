
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.restaurant_order import RestaurantOrder
from app.models.booking import Booking
from app.schemas.restaurant_order import RestaurantOrderCreate
from app.models.order_item import OrderItem
from app.models.menu import Menu
from app.auth.jwt_handler import get_current_admin


router = APIRouter(tags=["Restaurant Orders"])
logger = logging.getLogger(__name__)


# ADMIN: Create restaurant order
@router.post(
    "/restaurant-orders",
    status_code=status.HTTP_201_CREATED
)
def create_restaurant_order(
    order: RestaurantOrderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    booking = db.query(Booking).filter(
        Booking.id == order.booking_id
    ).first()

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    if booking.status != "Checked In":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Restaurant orders can only be created for checked-in bookings"
        )

    new_order = RestaurantOrder(
        booking_id=order.booking_id,
        order_date=order.order_date
    )

    try:
        db.add(new_order)
        db.commit()
        db.refresh(new_order)

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error creating restaurant order")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create restaurant order"
        )

    return {
        "message": "Restaurant order created successfully",
        "order_id": new_order.id
    }


# ADMIN: View all restaurant orders
@router.get("/restaurant-orders")
def get_restaurant_orders(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    orders = db.query(RestaurantOrder).all()

    result = []

    for order in orders:
        order_items = db.query(OrderItem).filter(
            OrderItem.restaurant_order_id == order.id
        ).all()

        items = []

        for item in order_items:
            menu = db.query(Menu).filter(
                Menu.id == item.menu_id
            ).first()

            items.append({
                "menu_id": item.menu_id,
                "item_name": menu.item_name if menu else "Unknown Item",
                "quantity": item.quantity,
                "subtotal": item.subtotal
            })

        total = sum(
            item["subtotal"] for item in items
        )

        result.append({
            "order_id": order.id,
            "booking_id": order.booking_id,
            "order_date": order.order_date,
            "status": order.status,
            "items": items,
            "total_amount": total
        })

    return result


# Schema for updating restaurant order status
class OrderStatusUpdate(BaseModel):
    status: str


# ADMIN: Update restaurant order status
@router.put("/restaurant-orders/{order_id}/status")
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    order = db.query(RestaurantOrder).filter(
        RestaurantOrder.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant order not found"
        )

    allowed_statuses = [
        "Pending",
        "Preparing",
        "Served"
    ]

    if data.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order status"
        )

    try:
        order.status = data.status

        db.commit()
        db.refresh(order)

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error updating restaurant order status")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update restaurant order status"
        )

    return {
        "message": "Order status updated successfully",
        "order_id": order.id,
        "status": order.status
    }

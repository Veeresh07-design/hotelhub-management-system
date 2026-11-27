
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.database import get_db
from app.models.restaurant_order import RestaurantOrder
from app.models.booking import Booking
from app.schemas.restaurant_order import RestaurantOrderCreate
from app.models.order_item import OrderItem
from app.models.menu import Menu
from app.auth.jwt_handler import get_current_admin

router = APIRouter(tags=["Restaurant Orders"])


@router.post("/restaurant-orders")
def create_restaurant_order(
    order: RestaurantOrderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
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


@router.get("/restaurant-orders")
def get_restaurant_orders(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    orders = db.query(RestaurantOrder).all()

    result = []

    for order in orders:
        booking = db.query(Booking).filter(
            Booking.id == order.booking_id
        ).first()

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

        total = sum(item["subtotal"] for item in items)

        result.append({
            "order_id": order.id,
            "booking_id": order.booking_id,
            "order_date": order.order_date,
            "status": order.status,
            "items": items,
            "total_amount": total
        })

    return result


class OrderStatusUpdate(BaseModel):
    status: str


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
            status_code=404,
            detail="Restaurant order not found"
        )

    allowed_statuses = ["Pending", "Preparing", "Served"]

    if data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid order status"
        )

    order.status = data.status
    db.commit()
    db.refresh(order)

    return {
        "message": "Order status updated successfully",
        "order_id": order.id,
        "status": order.status
    }

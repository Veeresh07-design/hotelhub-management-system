
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.order_item import OrderItem
from app.models.restaurant_order import RestaurantOrder
from app.models.menu import Menu
from app.schemas.order_item import OrderItemCreate
from app.auth.jwt_handler import get_current_admin


router = APIRouter(tags=["Order Items"])
logger = logging.getLogger(__name__)


# ADMIN: Add item to restaurant order
@router.post(
    "/order-items",
    status_code=status.HTTP_201_CREATED
)
def add_order_item(
    item: OrderItemCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    # Validate restaurant order
    order = db.query(RestaurantOrder).filter(
        RestaurantOrder.id == item.restaurant_order_id
    ).first()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant order not found"
        )

    # Prevent modifying served orders
    if order.status == "Served":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add items to an order that has been served"
        )

    # Validate menu item
    menu = db.query(Menu).filter(
        Menu.id == item.menu_id
    ).first()

    if menu is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu item not found"
        )

    # Check menu availability
    if menu.availability != "Available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Menu item is currently unavailable"
        )

    # Validate quantity
    if item.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than zero"
        )

    subtotal = menu.price * item.quantity

    order_item = OrderItem(
        restaurant_order_id=item.restaurant_order_id,
        menu_id=item.menu_id,
        quantity=item.quantity,
        subtotal=subtotal
    )

    try:
        db.add(order_item)
        db.commit()
        db.refresh(order_item)

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error adding restaurant order item")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to add order item"
        )

    return {
        "message": "Order item added successfully",
        "order_item_id": order_item.id,
        "subtotal": subtotal
    }


# ADMIN: Get restaurant order total
@router.get("/restaurant-orders/{restaurant_order_id}/total")
def get_restaurant_order_total(
    restaurant_order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    order = db.query(RestaurantOrder).filter(
        RestaurantOrder.id == restaurant_order_id
    ).first()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Restaurant order not found"
        )

    order_items = db.query(OrderItem).filter(
        OrderItem.restaurant_order_id == restaurant_order_id
    ).all()

    total = sum(
        item.subtotal for item in order_items
    )

    return {
        "restaurant_order_id": restaurant_order_id,
        "total_amount": total
    }

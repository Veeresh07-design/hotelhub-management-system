from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.order_item import OrderItem
from app.models.restaurant_order import RestaurantOrder
from app.models.menu import Menu
from app.schemas.order_item import OrderItemCreate

router = APIRouter(tags=["Order Items"])


@router.post("/order-items")
def add_order_item(
    item: OrderItemCreate,
    db: Session = Depends(get_db)
):
    order = db.query(RestaurantOrder).filter(
        RestaurantOrder.id == item.restaurant_order_id
    ).first()

    if order is None:
        return {"message": "Restaurant order not found"}

    menu = db.query(Menu).filter(
        Menu.id == item.menu_id
    ).first()

    if menu is None:
        return {"message": "Menu item not found"}

    subtotal = menu.price * item.quantity

    order_item = OrderItem(
        restaurant_order_id=item.restaurant_order_id,
        menu_id=item.menu_id,
        quantity=item.quantity,
        subtotal=subtotal
    )

    db.add(order_item)
    db.commit()
    db.refresh(order_item)

    return {
        "message": "Order item added successfully",
        "order_item_id": order_item.id,
        "subtotal": subtotal
    }

@router.get("/restaurant-orders/{restaurant_order_id}/total")
def get_restaurant_order_total(
    restaurant_order_id: int,
    db: Session = Depends(get_db)
):
    order = db.query(RestaurantOrder).filter(
        RestaurantOrder.id == restaurant_order_id
    ).first()

    if order is None:
        return {
            "message": "Restaurant order not found"
        }

    order_items = db.query(OrderItem).filter(
        OrderItem.restaurant_order_id == restaurant_order_id
    ).all()

    total = sum(item.subtotal for item in order_items)

    return {
        "restaurant_order_id": restaurant_order_id,
        "total_amount": total
    }
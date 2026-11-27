
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.menu import Menu
from app.schemas.menu import MenuCreate, MenuUpdate
from app.auth.jwt_handler import get_current_admin


router = APIRouter(tags=["Menu"])
logger = logging.getLogger(__name__)


# ADMIN: Add menu item
@router.post("/menu", status_code=status.HTTP_201_CREATED)
def add_menu_item(
    menu: MenuCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    new_item = Menu(
        item_name=menu.item_name,
        category=menu.category,
        price=menu.price,
        availability=menu.availability
    )

    try:
        db.add(new_item)
        db.commit()
        db.refresh(new_item)

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error adding menu item")

        raise HTTPException(
            status_code=500,
            detail="Unable to add menu item"
        )

    return {
        "message": "Menu item added successfully",
        "menu_id": new_item.id
    }


# ADMIN / CUSTOMER: View all menu items
@router.get("/menu")
def get_menu(
    db: Session = Depends(get_db)
):
    return db.query(Menu).all()


# ADMIN / CUSTOMER: View specific menu item
@router.get("/menu/{menu_id}")
def get_menu_item(
    menu_id: int,
    db: Session = Depends(get_db)
):
    menu_item = db.query(Menu).filter(
        Menu.id == menu_id
    ).first()

    if menu_item is None:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    return menu_item


# ADMIN: Update menu item
@router.put("/menu/{menu_id}")
def update_menu_item(
    menu_id: int,
    menu: MenuUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    menu_item = db.query(Menu).filter(
        Menu.id == menu_id
    ).first()

    if menu_item is None:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    try:
        menu_item.item_name = menu.item_name
        menu_item.category = menu.category
        menu_item.price = menu.price
        menu_item.availability = menu.availability

        db.commit()
        db.refresh(menu_item)

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error updating menu item")

        raise HTTPException(
            status_code=500,
            detail="Unable to update menu item"
        )

    return {
        "message": "Menu item updated successfully",
        "menu_id": menu_item.id
    }


# ADMIN: Delete menu item
@router.delete("/menu/{menu_id}")
def delete_menu_item(
    menu_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    menu_item = db.query(Menu).filter(
        Menu.id == menu_id
    ).first()

    if menu_item is None:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    try:
        db.delete(menu_item)
        db.commit()

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Cannot delete this menu item because it is used in existing restaurant orders. Mark it Unavailable instead."
        )

    except SQLAlchemyError:
        db.rollback()
        logger.exception("Error deleting menu item")

        raise HTTPException(
            status_code=500,
            detail="Unable to delete menu item"
        )

    return {
        "message": "Menu item deleted successfully"
    }

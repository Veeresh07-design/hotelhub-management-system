from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.menu import Menu
from app.schemas.menu import MenuCreate
from app.schemas.menu import MenuCreate, MenuUpdate

router = APIRouter(tags=["Menu"])


@router.post("/menu")
def add_menu_item(
    menu: MenuCreate,
    db: Session = Depends(get_db)
):
    new_item = Menu(
        item_name=menu.item_name,
        category=menu.category,
        price=menu.price,
        availability=menu.availability
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return {
        "message": "Menu item added successfully",
        "menu_id": new_item.id
    }

@router.get("/menu")
def get_menu(
    db: Session = Depends(get_db)
):
    menu_items = db.query(Menu).all()
    return menu_items

@router.get("/menu/{menu_id}")
def get_menu_item(
    menu_id: int,
    db: Session = Depends(get_db)
):
    menu_item = db.query(Menu).filter(Menu.id == menu_id).first()

    if menu_item is None:
        return {
            "message": "Menu item not found"
        }

    return menu_item

@router.put("/menu/{menu_id}")
def update_menu_item(
    menu_id: int,
    menu: MenuUpdate,
    db: Session = Depends(get_db)
):
    menu_item = db.query(Menu).filter(Menu.id == menu_id).first()

    if menu_item is None:
        return {
            "message": "Menu item not found"
        }

    menu_item.item_name = menu.item_name
    menu_item.category = menu.category
    menu_item.price = menu.price
    menu_item.availability = menu.availability

    db.commit()
    db.refresh(menu_item)

    return {
        "message": "Menu item updated successfully"
    }

@router.delete("/menu/{menu_id}")
def delete_menu_item(
    menu_id: int,
    db: Session = Depends(get_db)
):
    menu_item = db.query(Menu).filter(Menu.id == menu_id).first()

    if menu_item is None:
        return {
            "message": "Menu item not found"
        }

    db.delete(menu_item)
    db.commit()

    return {
        "message": "Menu item deleted successfully"
    }
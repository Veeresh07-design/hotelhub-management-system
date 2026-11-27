from app.models.base import Base
from app.database.database import engine

from app.models.room import Room
from app.models.guest import Guest
from app.models.booking import Booking
from app.models.user import User
from app.models.bill import Bill
from app.models.menu import Menu
from app.models.restaurant_order import RestaurantOrder
from app.models.order_item import OrderItem
from app.models.housekeeping import Housekeeping

Base.metadata.create_all(bind=engine)
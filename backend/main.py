
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.room import router as room_router
from app.api.guest import router as guest_router
from app.api.booking import router as booking_router
from app.api.auth import router as auth_router
from app.api.bill import router as bill_router
from app.api.menu import router as menu_router
from app.api.restaurant_order import router as restaurant_order_router
from app.api.order_item import router as order_item_router
from app.api.dashboard import router as dashboard_router
from app.api.reports import router as reports_router
from app.api.customer import router as customer_router
from app.api.housekeeping import router as housekeeping_router

app = FastAPI(
    title="HotelHub Management System API",
    description="API for hotel reservations, guest management, restaurant operations, billing and housekeeping.",
    version="1.0.0",
)

frontend_origin = os.getenv(
    "FRONTEND_ORIGIN",
    "http://localhost:5173"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(room_router)
app.include_router(guest_router)
app.include_router(booking_router)
app.include_router(auth_router)
app.include_router(bill_router)
app.include_router(menu_router)
app.include_router(restaurant_order_router)
app.include_router(order_item_router)
app.include_router(dashboard_router)
app.include_router(reports_router)
app.include_router(customer_router)
app.include_router(housekeeping_router)


@app.get("/")
def home():
    return {"message": "Welcome to the HotelHub Management System!"}

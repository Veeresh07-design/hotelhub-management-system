# HotelHub – Hotel & Restaurant Management System

A web-based Hotel and Restaurant Management System designed to simplify hotel operations, customer reservations, guest management, restaurant orders, billing and reporting.

## Overview

HotelHub provides a centralized platform for managing hotel activities through separate Admin and Customer interfaces.

The system helps hotel administrators manage daily operations while allowing customers to register, browse available rooms, make reservations and track their bookings.

## Key Features

### Admin Module
- Admin authentication and role-based access control
- Dashboard with hotel statistics
- Room management
- Guest management
- Booking management
- Restaurant menu management
- Restaurant order management
- Billing and payment tracking
- Housekeeping management
- Reports

### Customer Module
- Customer registration and login
- Customer profile management
- Browse available rooms
- Room booking
- View booking details
- Track and cancel bookings

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | SQLite |
| ORM | SQLAlchemy |
| Authentication | JWT |
| API Testing | FastAPI Swagger UI |
| Version Control | Git and GitHub |

## Project Architecture

The application follows a frontend-backend architecture.

- **Frontend:** React-based user interface.
- **Backend:** FastAPI REST API handling application logic and requests.
- **Database:** SQLite with SQLAlchemy for database operations.
- **Authentication:** JWT-based authentication with role-based authorization.

## Project Structure

```text
hotelhub-management-system/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── database/
│   │   ├── models/
│   │   └── schemas/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites

- Python 3.10 or later
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Veeresh07-design/hotelhub-management-system.git
cd hotelhub-management-system
```

### 2. Backend Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Set the JWT secret key in PowerShell:

```powershell
$env:HOTELHUB_SECRET_KEY="your-secret-key"
```

Start the backend:

```powershell
python -m uvicorn main:app --reload
```

Backend API: http://127.0.0.1:8000

Swagger documentation: http://127.0.0.1:8000/docs

### 3. Frontend Setup

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Security

- Password hashing for user authentication
- JWT-based authentication
- Role-based access control for Admin and Customer
- Protected API endpoints
- Input validation using Pydantic


## Future Enhancements

- Online payment gateway integration
- Email and booking notifications
- Inventory management enhancements
- Cloud deployment
- Advanced analytics and reporting

## Author

**Veeresh S Baligar**

Computer Science and Design Engineering

GitHub: [Veeresh07-design](https://github.com/Veeresh07-design)

---

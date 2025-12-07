# 🚗 Vehicle Rental System – Backend API

A scalable and secure backend system for managing vehicle rentals with authentication, booking workflows, and role-based access.

> 🔗 **Live URL:** [https://express-server-kk.vercel.app/](https://express-server-kk.vercel.app/) 

---

## 🎯 Project Overview

The **Vehicle Rental System** is a RESTful backend application designed to manage:

### 🚘 Vehicles
- Add, update, and delete vehicles  
- Track availability (`available`, `booked`)  
- Prevent deletion if associated with active bookings  

### 👤 Users / Customers
- Register, login, JWT-based authentication  
- Role-based access (`admin`, `customer`)  
- Customers can book vehicles and manage their rentals  

### 📅 Bookings
- Create bookings with start and end dates  
- System calculates rental cost: **daily rate × duration**  
- Vehicle status automatically updated to `booked` and later `available`  
- Admin or customer can manage cancellation and return logic  

### 🔐 Authentication
- Secure login/signup using JWT  
- Password hashing using **bcrypt**  
- Middleware-based role protection  

---

## 🛠️ Technology Stack

| Layer    | Technology                    |
|----------|------------------------------|
| Language | Node.js + TypeScript         |
| Web      | Express.js                   |
| DB       | PostgreSQL                   |
| Auth     | JSON Web Tokens (`jsonwebtoken`) |
| Security | bcrypt (password hashing)    |
| Cron     | node-cron (auto return jobs) |
| Env      | dotenv / config-based setup  |

---

## 📁 Project Structure

```bash
src/
├── app.ts
├── server.ts

├── config/
│   └── index.ts

├── database/
│   └── db.ts

├── jobs/
│   └── bookingCron.ts

├── middleware/
│   ├── auth.ts
│   ├── allowAdminOrOwn.ts
│   └── globalErrorHandler.ts

├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   
│   │
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.routes.ts
│   │   
│   │
│   ├── vehicle/
│   │   ├── vehicle.controller.ts
│   │   ├── vehicle.service.ts
│   │   ├── vehicle.routes.ts
│   │   
│   │
│   └── booking/
│       ├── booking.controller.ts
│       ├── booking.service.ts
│       ├── booking.routes.ts
│       └── booking.validation.ts

├── types/
│   └── express/
│       └── index.d.ts   # extends Request type (req.user etc.)

├── utils/
│   ├── catchAsync.ts
│   ├── httpStatus.ts
│   ├── sendError.ts
│   └── sendSuccess.ts


## 🌐 API Endpoints

### Authentication
| Method | Endpoint              | Access | Description                 |
|--------|---------------------- |--------|-------------                |
| POST   | `/api/v1/auth/signup` | Public | Register new user account   |
| POST   | `/api/v1/auth/signin` | Public | Login and receive JWT token |

---

### Vehicles
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/vehicles` | Admin only | Add new vehicle with name, type, registration, daily rent price and availability status |
| GET | `/api/v1/vehicles` | Public | View all vehicles in the system |
| GET | `/api/v1/vehicles/:vehicleId` | Public | View specific vehicle details |
| PUT | `/api/v1/vehicles/:vehicleId` | Admin only | Update vehicle details, daily rent price or availability status |
| DELETE | `/api/v1/vehicles/:vehicleId` | Admin only | Delete vehicle (only if no active bookings exist) |

---

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/users` | Admin only | View all users in the system |
| PUT | `/api/v1/users/:userId` | Admin or Own | Admin: Update any user's role or details<br>Customer: Update own profile only |
| DELETE | `/api/v1/users/:userId` | Admin only | Delete user (only if no active bookings exist) |

---

### Bookings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/bookings` | Customer or Admin | Create booking with start/end dates<br>• Validates vehicle availability<br>• Calculates total price (daily rate × duration)<br>• Updates vehicle status to "booked" |
| GET | `/api/v1/bookings` | Role-based | Admin: View all bookings<br>Customer: View own bookings only |
| PUT | `/api/v1/bookings/:bookingId` | Role-based | Customer: Cancel booking (before start date only)<br>Admin: Mark as "returned" (updates vehicle to "available")<br>System: Auto-mark as "returned" when period ends |

## 📊 Database Tables

### Users
| Field | Notes |
|-------|-------|
| id | Auto-generated |
| name | Required |
| email | Required, unique, lowercase |
| password | Required, min 6 characters |
| phone | Required |
| role | 'admin' or 'customer' |

### Vehicles
| Field | Notes |
|-------|-------|
| id | Auto-generated |
| vehicle_name | Required |
| type | 'car', 'bike', 'van' or 'SUV' |
| registration_number | Required, unique |
| daily_rent_price | Required, positive |
| availability_status | 'available' or 'booked' |

### Bookings
| Field | Notes |
|-------|-------|
| id | Auto-generated |
| customer_id | Links to Users table |
| vehicle_id | Links to Vehicles table |
| rent_start_date | Required |
| rent_end_date | Required, must be after start date |
| total_price | Required, positive |
| status | 'active', 'cancelled' or 'returned' |
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

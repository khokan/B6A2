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

## ⚙️ Setup & Usage Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/vehicle-rental-system.git
cd vehicle-rental-system
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file:

```env
DATABASE_URL=postgres://username:password@localhost:5432/vehicle_rental
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
```

### 4️⃣ Create Database & Run Migrations
```bash
createdb vehicle_rental
psql -d vehicle_rental -f schema.sql
```

### 5️⃣ Start Development Server
```bash
npm run dev
```

### 6️⃣ Build & Run Production
```bash
npm run build
npm start
```

### 7️⃣ Testing the API
Use Postman or Thunder Client.

Set request header:
```
Authorization: Bearer <token>
```

### 8️⃣ Cron Automation
```ts
cron.schedule("0 0 * * *", autoReturnFinishedBookings);
```

---

## 🌐 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| **POST** | `/api/v1/auth/signup` | Public | Register new user |
| **POST** | `/api/v1/auth/signin` | Public | Login and get JWT token |

---

### 🚘 Vehicles
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| **POST** | `/api/v1/vehicles` | Admin | Add vehicle |
| **GET**  | `/api/v1/vehicles` | Public | View all vehicles |
| **GET**  | `/api/v1/vehicles/:vehicleId` | Public | View specific vehicle |
| **PUT**  | `/api/v1/vehicles/:vehicleId` | Admin | Update vehicle |
| **DELETE** | `/api/v1/vehicles/:vehicleId` | Admin | Delete vehicle |

---

### 👤 Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| **GET** | `/api/v1/users` | Admin | View all users |
| **PUT** | `/api/v1/users/:userId` | Admin/Own | Update user |
| **DELETE** | `/api/v1/users/:userId` | Admin | Delete user |

---

### 📅 Bookings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| **POST** | `/api/v1/bookings` | Customer/Admin | Create booking |
| **GET** | `/api/v1/bookings` | Role-based | Get bookings |
| **PUT** | `/api/v1/bookings/:bookingId` | Role-based | Cancel / Return |

---

## 📊 Database Tables

### Users
| Field | Notes |
|-------|-------|
| id | Auto-generated |
| name | Required |
| email | Required, unique |
| password | Required |
| phone | Required |
| role | admin/customer |

### Vehicles
| Field | Notes |
|-------|-------|
| id | Auto-generated |
| vehicle_name | Required |
| type | car/bike/van/SUV |
| registration_number | Unique |
| daily_rent_price | Positive |
| availability_status | available/booked |

### Bookings
| Field | Notes |
|-------|-------|
| id | Auto-generated |
| customer_id | FK |
| vehicle_id | FK |
| rent_start_date | Required |
| rent_end_date | Required |
| total_price | Positive |
| status | active/cancelled/returned |

---

## 📌 Future Enhancements
- Vehicle images  
- Payment gateway  
- Admin dashboard  
- Refresh tokens  
- Rate limiting  

---

## 🤝 Contributing
Pull requests are welcome.

---

## 📄 License
MIT License.
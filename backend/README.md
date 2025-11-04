# Meeting Room Management System - Backend

Backend API for Meeting Room Management System built with Node.js, Express, and MongoDB.

## Features

- User authentication & authorization (JWT)
- Role-based access control (Admin, Manager, User)
- Room management (CRUD operations)
- Booking management with approval workflow
- Real-time room availability checking
- Export booking data to CSV
- Statistics and reports
- Audit logging
- Email notifications

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport.js
- **Security**: Helmet, CORS, bcryptjs
- **Logging**: Custom logger with file rotation

## Getting Started

### Prerequisites

- Node.js >= 14.0.0
- MongoDB >= 4.0
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Update .env file with your configuration

5. Start MongoDB (if running locally)
```bash
mongod
```

6. Start the server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/change-password` - Change password (protected)

### Rooms
- `GET /api/rooms` - Get all rooms (protected)
- `GET /api/rooms/:id` - Get room by ID (protected)
- `POST /api/rooms` - Create room (admin/manager)
- `PUT /api/rooms/:id` - Update room (admin/manager)
- `DELETE /api/rooms/:id` - Delete room (admin)
- `GET /api/rooms/:id/availability` - Check room availability (protected)
- `GET /api/rooms/:id/statistics` - Get room statistics (protected)

### Bookings
- `GET /api/bookings` - Get all bookings (protected)
- `GET /api/bookings/my-bookings` - Get user's bookings (protected)
- `GET /api/bookings/upcoming` - Get upcoming bookings (protected)
- `GET /api/bookings/:id` - Get booking by ID (protected)
- `POST /api/bookings` - Create booking (protected)
- `PUT /api/bookings/:id` - Update booking (protected)
- `POST /api/bookings/:id/cancel` - Cancel booking (protected)
- `POST /api/bookings/:id/approve` - Approve booking (admin/manager)
- `POST /api/bookings/:id/reject` - Reject booking (admin/manager)

### Export & Reports
- `GET /api/export/bookings/csv` - Export bookings to CSV (admin/manager)
- `GET /api/export/rooms/csv` - Export rooms to CSV (admin/manager)
- `GET /api/export/statistics` - Get booking statistics (admin/manager)
- `GET /api/export/utilization` - Get room utilization report (admin/manager)

## Project Structure

```
backend/
├── src/
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middlewares/     # Custom middlewares
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration files
│   └── app.js           # Express app setup
├── tests/               # Test files
├── logs/                # Log files (auto-generated)
├── server.js            # Server entry point
├── package.json         # Dependencies
├── .env.example         # Environment variables example
└── README.md            # Documentation
```

## User Roles

- **Admin**: Full access to all features
- **Manager**: Can manage rooms and approve/reject bookings
- **User**: Can view rooms and create/manage own bookings

## Default Admin Account

After setting up the database, you can create an admin account using the credentials in `.env` file:
- Email: admin@example.com
- Password: admin123456

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## License

ISC


# Meeting Room Management API – Milestone 2

This document captures the REST endpoints that are live for milestone 2, including request/response examples and required roles.

## Authentication

All protected endpoints expect a JWT via `Authorization: Bearer <token>`. Roles available: `admin`, `user`.

## Rooms

| Endpoint | Method | Description | Auth | Request |
| --- | --- | --- | --- | --- |
| `/api/rooms` | `GET` | List rooms with optional filters (`search`, `type`, `status`, `minCapacity`, `maxCapacity`, `equipment[]`, `page`, `limit`, `order`, `sortBy`). | Public | Query params |
| `/api/rooms` | `POST` | Create a new room. Payload must include `name`, `description`, `capacity`, `type`. `equipment` accepts array or comma separated string. Status is forced to `available`. | Admin | JSON body |
| `/api/rooms/:id` | `PUT` | Update room fields (`name`, `description`, `capacity`, `status`, `type`, `equipment`). | Admin | JSON body |
| `/api/rooms/:id` | `DELETE` | Delete a room. | Admin | – |

### Room Responses

- **Success 200/201**
  ```json
  {
    "success": true,
    "data": [{ "name": "...", "status": "available", "...": "..." }],
    "meta": { "total": 12, "page": 1, "limit": 50, "filters": { "type": "Trung bA�nh" } }
  }
  ```
- **Validation / Conflict**
  - `400` invalid payload or duplicate room name.
  - `404` room not found.

## Bookings

| Endpoint | Method | Description | Auth | Request |
| --- | --- | --- | --- | --- |
| `/api/bookings` | `GET` | List bookings. Users receive only their bookings; admins can filter by any `user`. Supports `room`, `user`, `status`, `startDate`, `endDate`. | Authenticated (VIEW_BOOKINGS) | Query params |
| `/api/bookings` | `POST` | Create a booking. Validates payload, ensures room exists, and prevents overlapping bookings. | Authenticated (CREATE_BOOKING) | `{ "room": "<roomId>", "startTime": "2025-01-02T09:00:00Z", "endTime": "...", "purpose": "Sprint review" }` |
| `/api/bookings/:id` | `DELETE` | Cancel a booking. Users can cancel their own bookings; admins can cancel any. | Authenticated (DELETE_BOOKING) | – |

### Booking Responses

- **Success**
  ```json
  {
    "success": true,
    "data": {
      "_id": "...",
      "room": { "name": "Phòng A", "code": "PA001" },
      "user": { "fullName": "Admin", "email": "admin@company.com" },
      "startTime": "2025-01-02T09:00:00.000Z",
      "endTime": "2025-01-02T10:00:00.000Z",
      "status": "pending",
      "purpose": "Sprint review"
    }
  }
  ```
- **Errors**
  - `400` validation errors (missing room, invalid time range, purpose too long, etc.).
  - `401/403` authentication or permission failures.
  - `404` room/booking not found.
  - `409` overlapping booking conflict.

## Status Codes

- `200` Success / retrieval / deletion.
- `201` Resource created.
- `400` Validation error.
- `401` Not authenticated.
- `403` Not authorized.
- `404` Resource not found.
- `409` Conflict (e.g., overlapping booking).
- `500` Unexpected server error.

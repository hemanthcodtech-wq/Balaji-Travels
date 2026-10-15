# TTD Travels Backend

Express.js backend configured with **Neon Serverless PostgreSQL**.

## Features & Structure

- **Framework**: Express (ES Modules)
- **Database**: Neon Postgres using `@neondatabase/serverless`
- **Tables Auto-initialized**:
  - `queries` (Customer inquiries & contact requests)
  - `bookings` (Tour & cab reservations)
  - `tours` (Tour packages)
  - `fleets` (Vehicle listings)

## Folder Structure

```text
backend/
├── .env                  # Environment variables (Add your Neon DATABASE_URL here)
├── .env.example          # Sample environment variables
├── package.json
└── src/
    ├── index.js          # Express entry point
    ├── config/
    │   ├── db.js         # Neon DB connection client
    │   └── schema.js     # Automatic database schema initialization
    ├── controllers/
    │   ├── bookingController.js
    │   └── queryController.js
    └── routes/
        ├── bookingRoutes.js
        └── queryRoutes.js
```

## Getting Started

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Add your **Neon DB connection string** in `.env`:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<dbname>?sslmode=require
   CORS_ORIGIN=http://localhost:5173
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Server runs on `http://localhost:5000` with endpoints:
   - `GET  /api/health`
   - `POST /api/queries` & `GET /api/queries`
   - `POST /api/bookings` & `GET /api/bookings`

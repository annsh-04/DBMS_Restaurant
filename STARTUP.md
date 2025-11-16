# Chef Chatter Startup Guide

## Quick Start

### Windows (PowerShell)
```powershell
cd C:\Users\1976c\Downloads\123\chef-chatter-ui-main
.\start.ps1
```

Then open your browser and go to:
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3000

### macOS / Linux (Bash)
```bash
cd /path/to/chef-chatter-ui-main
chmod +x start.sh
./start.sh
```

Then open your browser and go to:
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3000

## What the startup script does

1. **Backend Server** (Node.js/Express)
   - Connects to MySQL database (`restaurant_db`)
   - Serves REST API endpoints on port 3000
   - Endpoints: `/api/customers`, `/api/staff`, `/api/orders`, `/api/reservations`, `/api/financial`, `/api/attendance`, `/api/summary`

2. **Frontend Server** (Vite)
   - React + TypeScript development server
   - Hot module reloading (HMR) on port 8080
   - Connects to backend API at `http://localhost:3000`

## Stopping the servers

### Windows
- Press `Ctrl+C` in the PowerShell window, or
- Run in a new terminal: `taskkill /IM node.exe /F`

### macOS / Linux
- Press `Ctrl+C` in the terminal, or
- Run in another terminal: `pkill -f node`

## Database Setup

Before starting, make sure:
1. MySQL is running (default: localhost:3306)
2. Database schema is imported:
   ```bash
   # From the backend folder
   mysql -u root -p < schema.sql
   ```

Set these environment variables (or use defaults):
- `DB_HOST` (default: localhost)
- `DB_USER` (default: root)
- `DB_PASSWORD` (default: blank)
- `DB_NAME` (default: restaurant_db)
- `DB_PORT` (default: 3306)

Example:
```bash
set DB_USER=admin
set DB_PASSWORD=mypassword
set DB_HOST=localhost
.\start.ps1
```

## Features Available

### Dashboard
- Real-time metrics: today's revenue, orders count, customers, attendance present
- Weekly revenue and orders charts (aggregated from live data)
- Recent orders list

### Pages with Full CRUD
- **Customers:** Create, read, update, delete customers
- **Staff:** Create, read, update, delete staff with phone numbers
- **Orders:** Create, read, update (status), delete orders with item summaries
- **Reservations:** Create, read, update, delete reservations with IST time display
- **Financial:** Create, read, delete income/expense entries (INR formatting)
- **Attendance:** View attendance records filtered by role and date

### Internationalization
- All currency displayed in Indian Rupees (INR)
- Reservation times displayed in IST (Asia/Kolkata timezone)

## API Endpoints

All endpoints require the backend to be running on port 3000.

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Staff
- `GET /api/staff` - List all staff
- `POST /api/staff` - Create staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Reservations
- `GET /api/reservations` - List all reservations
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Delete reservation

### Financial
- `GET /api/financial` - List all financial entries
- `POST /api/financial` - Create entry
- `PUT /api/financial/:id` - Update entry
- `DELETE /api/financial/:id` - Delete entry

### Attendance
- `GET /api/attendance` - List all attendance records
- `POST /api/attendance` - Create attendance record
- `PUT /api/attendance/:id` - Update attendance record
- `DELETE /api/attendance/:id` - Delete attendance record

### Summary (Pre-aggregated Metrics)
- `GET /api/summary` - Returns today's metrics, last 7 days data, and recent orders
  - Used by Dashboard for fast load times

## Troubleshooting

### "Address already in use" error
Port 3000 or 8080 is still in use. Stop any running node processes:
```powershell
# Windows
taskkill /IM node.exe /F

# macOS / Linux
pkill -f node
```

### "Cannot find database"
Make sure:
1. MySQL is running
2. Schema is imported: `mysql -u root -p < backend/schema.sql`
3. Database name matches (default: `restaurant_db`)

### Backend won't start
Check:
1. MySQL connection (test with `mysql -u root -p`)
2. Node.js version (requires v14+)
3. Dependencies: `cd backend && npm install`

### Frontend won't load
Check:
1. Backend is running (test with `curl http://localhost:3000`)
2. Port 8080 is free
3. Dependencies: `npm install` (from project root)

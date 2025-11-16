# 🍽️ Chef Chatter - Quick Start Guide

## One-Command Startup

Everything starts with **one single command**:

### Windows (Recommended)
```powershell
cd C:\Users\1976c\Downloads\123\chef-chatter-ui-main
.\start.bat
```

### macOS / Linux
```bash
cd /path/to/chef-chatter-ui-main
./start.sh
```

**That's it!** Both backend and frontend will start automatically.

---

## What Happens When You Start

When you run `start.bat` or `start.sh`:

1. **Backend Server** starts on port **3000**
   - Node.js + Express REST API
   - Connected to MySQL database
   - Serves all data endpoints

2. **Frontend Server** starts on port **8080**
   - React + Vite development server
   - Hot reloading enabled
   - Automatically connects to backend

3. **Two new windows/tabs open** showing live output from each server

---

## Access the App

Once started, open your browser:

- **Frontend (UI):** http://localhost:8080
- **Backend (API):** http://localhost:3000

---

## How to Stop

Choose any method:

- Press **Ctrl+C** in the command window
- Close the command windows
- Run: `taskkill /IM node.exe /F` (Windows)
- Run: `pkill -f node` (macOS/Linux)

---

## Before First Use

**Make sure MySQL is running and the schema is imported:**

```bash
# From the backend folder
mysql -u root -p < schema.sql
```

Environment variables (optional, defaults provided):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=restaurant_db
DB_PORT=3306
```

---

## Dashboard & Live Data

The Dashboard now shows **real data**:

- ✅ Today's Revenue (from financial entries)
- ✅ Total Orders (from orders table)
- ✅ Active Customers (from customers table)
- ✅ Attendance Present (from attendance table)
- ✅ Weekly Revenue Chart (aggregated from orders)
- ✅ Weekly Orders Chart (aggregated from orders)
- ✅ Recent Orders List (latest 4 orders)

All data updates in real-time as you create/edit/delete records!

---

## Attendance & Financial Pages

The Attendance page shows **real attendance records**:

- View staff attendance by role and date
- See present/absent/late counts
- Filter by role or date
- Data fetches live from `/api/attendance`

The Financial page shows **real financial entries**:

- Create income/expense entries
- All amounts formatted in INR (₹)
- Data persists in database

---

## Pages with Full CRUD

| Page | Create | Read | Update | Delete | Notes |
|------|--------|------|--------|--------|-------|
| **Customers** | ✅ | ✅ | ❌ | ❌ | Name, phone, email |
| **Staff** | ✅ | ✅ | ❌ | ❌ | Name, role, email, phone |
| **Orders** | ✅ | ✅ | ✅ | ✅ | Items, totals, status editable |
| **Reservations** | ✅ | ✅ | ✅ | ✅ | Time shown in IST |
| **Financial** | ✅ | ✅ | ❌ | ✅ | Income/expense in INR |
| **Attendance** | ✅ | ✅ | ✅ | ✅ | Present/absent/late status |

---

## API Endpoints

All API calls return JSON:

```
GET    /api/customers
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id

GET    /api/staff
POST   /api/staff
PUT    /api/staff/:id
DELETE /api/staff/:id

GET    /api/orders
POST   /api/orders
PUT    /api/orders/:id
DELETE /api/orders/:id

GET    /api/reservations
POST   /api/reservations
PUT    /api/reservations/:id
DELETE /api/reservations/:id

GET    /api/financial
POST   /api/financial
PUT    /api/financial/:id
DELETE /api/financial/:id

GET    /api/attendance
POST   /api/attendance
PUT    /api/attendance/:id
DELETE /api/attendance/:id

GET    /api/summary
```

**Example:** Get today's metrics
```bash
curl http://localhost:3000/api/summary
```

Returns:
```json
{
  "today": {
    "orders_count": 5,
    "orders_revenue": 250.50,
    "financial_net": 150.00,
    "attendance_present": 8
  },
  "counts": {
    "customers": 12,
    "reservations": 3,
    "staff": 5
  },
  "last7": [
    { "day": "2025-11-10", "orders": 3, "revenue": 120.00 },
    { "day": "2025-11-11", "orders": 5, "revenue": 250.50 }
  ],
  "recentOrders": [
    { "order_id": 1, "customer_id": 1, "total_amount": 45.50, "status": "completed", ... }
  ]
}
```

---

## Features Implemented

✅ **Dynamic Dashboard** — Real-time metrics and charts  
✅ **Full CRUD** — Create, read, update, delete all resources  
✅ **Live Attendance** — View and manage staff attendance  
✅ **Financial Tracking** — Income/expense entries in INR  
✅ **Order Management** — Items, totals, status tracking  
✅ **Reservations** — Dates/times in IST  
✅ **Unified Startup** — One command starts everything  
✅ **Phone Column** — Staff phone numbers fully integrated  
✅ **Pre-aggregated Data** — `/api/summary` for fast dashboard  
✅ **Currency Formatting** — All amounts in Indian Rupees  

---

## Troubleshooting

**"Port 3000/8080 already in use"**
```powershell
taskkill /IM node.exe /F
```

**"Cannot connect to database"**
- Check MySQL is running
- Verify schema imported: `mysql -u root -p < backend/schema.sql`
- Check DB credentials in backend/.env (if using env file)

**"Frontend won't load"**
- Verify backend is running (check output window)
- Try: `curl http://localhost:3000`
- Check browser console for errors

**"No data showing on Dashboard"**
- Ensure MySQL has data
- Create test orders/customers via UI
- Check browser console for fetch errors

---

## File Structure

```
chef-chatter-ui-main/
├── start.bat              ← Run this! (Windows)
├── start.sh               ← Run this! (macOS/Linux)
├── STARTUP.md            ← Full startup documentation
│
├── backend/
│   ├── server.js         ← Express server + all API endpoints
│   ├── db.js             ← MySQL connection
│   ├── schema.sql        ← Database schema + seed data
│   └── package.json
│
└── src/
    ├── pages/
    │   ├── Dashboard.tsx  ← Dynamic metrics + charts
    │   ├── Customers.tsx
    │   ├── Staff.tsx
    │   ├── Orders.tsx
    │   ├── Reservations.tsx
    │   ├── Financial.tsx
    │   └── Attendance.tsx ← Live attendance data
    │
    ├── api/
    │   └── client.ts      ← HTTP helpers
    │
    └── ...
```

---

## Next Steps (Optional Enhancements)

- Add authentication (login/logout)
- Implement user roles & permissions
- Add image uploads for customers/staff
- Create more detailed reports
- Add email notifications
- Implement real-time updates with WebSockets

---

**Happy coding! 🚀**

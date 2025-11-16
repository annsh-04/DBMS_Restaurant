# 🍽️ Chef Chatter - Restaurant Management Dashboard

A full-featured restaurant management system with real-time dashboard, staff tracking, order management, reservations, and financial ledger.

## 🚀 Quick Start (One Command!)

**Everything starts with a single command:**

```powershell
.\start.bat
```

Then open your browser: **http://localhost:8080**

---

## ✨ Features

- ✅ **Real-time Dashboard** — Live metrics and weekly charts
- ✅ **Full CRUD** — Create, read, update, delete for all resources
- ✅ **Customers & Staff** — Manage customer and staff records
- ✅ **Orders** — Track orders with items, totals, and status
- ✅ **Reservations** — Manage reservations with IST time display
- ✅ **Financial** — Income/expense tracking in Indian Rupees
- ✅ **Attendance** — Staff attendance with role-based filtering
- ✅ **Unified Startup** — Backend + Frontend in one command
- ✅ **INR Currency** — All amounts formatted in Indian Rupees
- ✅ **API Endpoints** — Complete REST API on port 3000

---

## 📊 Dashboard Features

The dashboard displays:
- **Today's Revenue** — Net financial transactions
- **Total Orders** — Order count from database
- **Active Customers** — Customer count
- **Attendance Present** — Staff present today
- **Weekly Revenue Chart** — 7-day aggregated revenue
- **Weekly Orders Chart** — 7-day order counts
- **Recent Orders** — Latest 4 orders with details

All data is **live** and updates automatically!

---

## 🔧 Setup

### Prerequisites
- Node.js v14+
- MySQL 5.7+
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

2. **Import database schema:**
   ```bash
   mysql -u root -p < backend/schema.sql
   ```

3. **Start everything:**
   ```bash
   # Windows
   .\start.bat
   
   # macOS/Linux
   chmod +x start.sh
   ./start.sh
   ```

---

## 📍 Access Points

- **Frontend (UI):** http://localhost:8080
- **Backend (API):** http://localhost:3000
- **API Docs:** See `QUICKSTART.md` for endpoint list

---

## 🛑 Stop Servers

- Press **Ctrl+C** in the command window, or
- Close the command windows, or
- Run: `taskkill /IM node.exe /F`

---

## 📁 Project Structure

```
chef-chatter-ui-main/
├── start.bat            ← Windows startup script
├── start.sh             ← macOS/Linux startup script
├── QUICKSTART.md        ← Quick reference guide
├── STARTUP.md           ← Detailed documentation
│
├── backend/
│   ├── server.js        ← Express API + all endpoints
│   ├── db.js            ← MySQL connection
│   ├── schema.sql       ← Database schema
│   └── package.json
│
└── src/
    ├── pages/
    │   ├── Dashboard.tsx      ← Real-time dashboard
    │   ├── Customers.tsx
    │   ├── Staff.tsx
    │   ├── Orders.tsx
    │   ├── Reservations.tsx
    │   ├── Financial.tsx
    │   └── Attendance.tsx
    │
    └── api/
        └── client.ts         ← HTTP helpers
```

---

## 🌟 Pages Included

| Page | Features |
|------|----------|
| **Dashboard** | Metrics, charts, recent orders |
| **Customers** | Create/view customer records |
| **Staff** | Create/view staff with phone numbers |
| **Orders** | Full CRUD with items and totals |
| **Reservations** | Full CRUD with IST time display |
| **Financial** | Income/expense in INR |
| **Attendance** | View/filter by role and date |

---

## 🎯 Built With

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend:** Node.js, Express, MySQL2
- **Database:** MySQL with full schema
- **UI Components:** Radix UI primitives

---

## 📚 Documentation

- **QUICKSTART.md** — Quick start guide with API endpoints
- **STARTUP.md** — Detailed setup and troubleshooting

---

## 🚀 Key Improvements Made

1. ✅ Added dynamic Dashboard with real-time data
2. ✅ Implemented attendance CRUD endpoints
3. ✅ Created /api/summary for pre-aggregated metrics
4. ✅ Wired all pages to live API endpoints
5. ✅ Formatted all currency in INR (₹)
6. ✅ Converted times to IST (Asia/Kolkata)
7. ✅ Unified startup with single command
8. ✅ Full CRUD for all resources

---

## 🐛 Troubleshooting

**Port already in use:**
```powershell
taskkill /IM node.exe /F
```

**Database connection failed:**
- Verify MySQL is running
- Check credentials in schema.sql
- Ensure schema is imported

**Frontend won't connect:**
- Verify backend is running (port 3000)
- Check browser console (F12) for errors
- Run `npm install` again if needed

---

**Happy restaurant managing! 🍽️**
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5aafc21e-18c7-4a27-8174-bd8a08fe87c9) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

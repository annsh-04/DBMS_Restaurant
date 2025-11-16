# Chef Chatter - Backend

This folder contains a small Express + MySQL backend used by the UI in this workspace.

What I added
- `schema.sql` — SQL script creating `restaurant_db` with tables and seed data.
- `db.js` was updated to read database credentials from environment variables (with sensible defaults).

Quick start (Windows / PowerShell)

1) Install dependencies

```powershell
cd backend
npm install
```

2) Create the database and seed it

You need a running MySQL server and a MySQL client installed. Then run:

```powershell
# Import the schema (you will be prompted for the MySQL password)
mysql -u root -p < schema.sql

# Or explicitly using mysql client and specifying DB/host if needed:
# mysql -h localhost -P 3306 -u root -p restaurant_db < schema.sql
```

If you don't want to type your password interactively, set environment variables (see next step).

3) Configure environment (optional)

The `db.js` reads the following environment variables (defaults shown):

- DB_HOST=localhost
- DB_USER=root
- DB_PASSWORD=200606
- DB_NAME=restaurant_db
- DB_PORT=3306

Set them in PowerShell like this before starting the server:

```powershell
$env:DB_PASSWORD = 'your_mysql_password';
$env:DB_USER = 'root';
# then start
npm start
```

4) Start the server

```powershell
npm start
```

The server listens on port 3000 by default and exposes the following endpoints used by the UI:

- GET /api/orders
- GET /api/staff
- GET /api/customers
- GET /api/reservations
- GET /api/financial

Notes & alternatives
- If you prefer, you can change the DB connector to SQLite (single-file DB) to avoid installing MySQL. I can do that for you if you want a zero-install dev backend.
- If you run into connection errors, double-check that MySQL is running and that the credentials match.

import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Promise helper for db.query
function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// Determine which phone column exists on the staff table (supports either `phone` or `staff_phone`).
let staffPhoneCol = "phone";
function detectStaffPhoneColumn() {
  const schema = process.env.DB_NAME || "restaurant_db";
  db.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'staff' AND COLUMN_NAME IN ('phone','staff_phone') LIMIT 1`,
    [schema],
    (err, results) => {
      if (err) {
        console.warn("Could not detect staff phone column, defaulting to 'phone':", err.message);
        staffPhoneCol = "phone";
        return;
      }
      if (results && results.length) {
        staffPhoneCol = results[0].COLUMN_NAME;
      } else {
        staffPhoneCol = "phone";
      }
      console.log(`Using staff phone column: ${staffPhoneCol}`);
    }
  );
}

// Run detection once on startup.
detectStaffPhoneColumn();

// Root route
app.get("/", (req, res) => res.send("Restaurant API running with MySQL"));

// ---- Orders ----
app.get("/api/orders", (req, res) => {
  db.query("SELECT * FROM orders", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create order
app.post('/api/orders', (req, res) => {
  const { customer_id, total_amount, status, notes } = req.body;
  const sql = 'INSERT INTO orders (customer_id, total_amount, status, order_time, notes) VALUES (?, ?, ?, NOW(), ?)';
  db.query(sql, [customer_id || null, total_amount || 0.0, status || 'pending', notes || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const insertedId = result.insertId;
    db.query('SELECT * FROM orders WHERE order_id = ?', [insertedId], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json(rows[0]);
    });
  });
});

// Update order
app.put('/api/orders/:id', (req, res) => {
  const id = req.params.id;
  const { customer_id, total_amount, status, notes } = req.body;
  const sql = 'UPDATE orders SET customer_id = ?, total_amount = ?, status = ?, notes = ? WHERE order_id = ?';
  db.query(sql, [customer_id || null, total_amount || 0.0, status || 'pending', notes || null, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query('SELECT * FROM orders WHERE order_id = ?', [id], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (!rows.length) return res.status(404).json({ error: 'Order not found' });
      res.json(rows[0]);
    });
  });
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM orders WHERE order_id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
  });
});


// ---- Staff ----
app.get("/api/staff", (req, res) => {
  // Explicitly select and alias the phone column so the frontend always receives `phone`.
  const sql = `SELECT staff_id, name, role, email, ${staffPhoneCol} AS phone FROM staff`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create staff
app.post('/api/staff', (req, res) => {
  const { name, role, email, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const sql = `INSERT INTO staff (name, role, email, ${staffPhoneCol}) VALUES (?, ?, ?, ?)`;
  db.query(sql, [name, role || null, email || null, phone || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const insertedId = result.insertId;
    // Return the row with phone aliased to `phone` for frontend compatibility.
    db.query(`SELECT staff_id, name, role, email, ${staffPhoneCol} AS phone FROM staff WHERE staff_id = ?`, [insertedId], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json(rows[0]);
    });
  });
});

// Update staff
app.put('/api/staff/:id', (req, res) => {
  const id = req.params.id;
  const { name, role, email, phone } = req.body;
  const sql = `UPDATE staff SET name = ?, role = ?, email = ?, ${staffPhoneCol} = ? WHERE staff_id = ?`;
  db.query(sql, [name, role || null, email || null, phone || null, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query(`SELECT staff_id, name, role, email, ${staffPhoneCol} AS phone FROM staff WHERE staff_id = ?`, [id], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (!rows.length) return res.status(404).json({ error: 'Staff not found' });
      res.json(rows[0]);
    });
  });
});

// Delete staff
app.delete('/api/staff/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM staff WHERE staff_id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Staff not found' });
    res.json({ success: true });
  });
});

// ---- Customers ----
app.get("/api/customers", (req, res) => {
  db.query("SELECT * FROM customers", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create customer
app.post('/api/customers', (req, res) => {
  const { name, phone, email } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const sql = 'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)';
  db.query(sql, [name, phone || null, email || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const insertedId = result.insertId;
    db.query('SELECT * FROM customers WHERE customer_id = ?', [insertedId], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json(rows[0]);
    });
  });
});

// Update customer
app.put('/api/customers/:id', (req, res) => {
  const id = req.params.id;
  const { name, phone, email } = req.body;
  const sql = 'UPDATE customers SET name = ?, phone = ?, email = ? WHERE customer_id = ?';
  db.query(sql, [name, phone || null, email || null, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query('SELECT * FROM customers WHERE customer_id = ?', [id], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
      res.json(rows[0]);
    });
  });
});

// Delete customer
app.delete('/api/customers/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM customers WHERE customer_id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true });
  });
});

// ---- Reservations ----
app.get("/api/reservations", (req, res) => {
  db.query("SELECT * FROM reservations", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create reservation
app.post('/api/reservations', (req, res) => {
  const { customer_id, party_size, reserve_time, status } = req.body;
  const sql = 'INSERT INTO reservations (customer_id, party_size, reserve_time, status) VALUES (?, ?, ?, ?)';
  db.query(sql, [customer_id || null, party_size || 1, reserve_time || null, status || 'confirmed'], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const insertedId = result.insertId;
    db.query('SELECT * FROM reservations WHERE reservation_id = ?', [insertedId], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json(rows[0]);
    });
  });
});

// Update reservation
app.put('/api/reservations/:id', (req, res) => {
  const id = req.params.id;
  const { customer_id, party_size, reserve_time, status } = req.body;
  const sql = 'UPDATE reservations SET customer_id = ?, party_size = ?, reserve_time = ?, status = ? WHERE reservation_id = ?';
  db.query(sql, [customer_id || null, party_size || 1, reserve_time || null, status || 'confirmed', id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query('SELECT * FROM reservations WHERE reservation_id = ?', [id], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (!rows.length) return res.status(404).json({ error: 'Reservation not found' });
      res.json(rows[0]);
    });
  });
});

// Delete reservation
app.delete('/api/reservations/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM reservations WHERE reservation_id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Reservation not found' });
    res.json({ success: true });
  });
});

// ---- Financial ----
app.get("/api/financial", (req, res) => {
  db.query("SELECT * FROM financial", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create financial entry
app.post('/api/financial', (req, res) => {
  const { type, amount, category, note } = req.body;
  if (!type || !amount) return res.status(400).json({ error: 'type and amount are required' });
  const sql = 'INSERT INTO financial (type, amount, category, note) VALUES (?, ?, ?, ?)';
  db.query(sql, [type, amount, category || null, note || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const insertedId = result.insertId;
    db.query('SELECT * FROM financial WHERE id = ?', [insertedId], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json(rows[0]);
    });
  });
});

// Update financial entry
app.put('/api/financial/:id', (req, res) => {
  const id = req.params.id;
  const { type, amount, category, note } = req.body;
  const sql = 'UPDATE financial SET type = ?, amount = ?, category = ?, note = ? WHERE id = ?';
  db.query(sql, [type, amount, category || null, note || null, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query('SELECT * FROM financial WHERE id = ?', [id], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (!rows.length) return res.status(404).json({ error: 'Entry not found' });
      res.json(rows[0]);
    });
  });
});

// Delete financial entry
app.delete('/api/financial/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM financial WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Entry not found' });
    res.json({ success: true });
  });
});

// ---- Attendance ----
app.get('/api/attendance', (req, res) => {
  // Join with staff to provide names/roles for the dashboard
  const sql = `SELECT a.*, s.name AS staff_name, s.role AS staff_role FROM attendance a LEFT JOIN staff s ON a.staff_id = s.staff_id ORDER BY a.date DESC, a.check_in DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create attendance
app.post('/api/attendance', (req, res) => {
  const { staff_id, date, check_in, check_out, status, hours } = req.body;
  const sql = 'INSERT INTO attendance (staff_id, date, check_in, check_out, status, hours) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [staff_id || null, date || null, check_in || null, check_out || null, status || 'present', hours || 0], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const id = result.insertId;
    db.query('SELECT a.*, s.name AS staff_name, s.role AS staff_role FROM attendance a LEFT JOIN staff s ON a.staff_id = s.staff_id WHERE attendance_id = ?', [id], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json(rows[0]);
    });
  });
});

// Update attendance
app.put('/api/attendance/:id', (req, res) => {
  const id = req.params.id;
  const { staff_id, date, check_in, check_out, status, hours } = req.body;
  const sql = 'UPDATE attendance SET staff_id = ?, date = ?, check_in = ?, check_out = ?, status = ?, hours = ? WHERE attendance_id = ?';
  db.query(sql, [staff_id || null, date || null, check_in || null, check_out || null, status || 'present', hours || 0, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query('SELECT a.*, s.name AS staff_name, s.role AS staff_role FROM attendance a LEFT JOIN staff s ON a.staff_id = s.staff_id WHERE attendance_id = ?', [id], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (!rows.length) return res.status(404).json({ error: 'Attendance not found' });
      res.json(rows[0]);
    });
  });
});

// Delete attendance
app.delete('/api/attendance/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM attendance WHERE attendance_id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Attendance not found' });
    res.json({ success: true });
  });
});

// ---- Summary endpoint ----
app.get('/api/summary', async (req, res) => {
  try {
    // Today's metrics
    const todayOrdersRows = await q("SELECT COUNT(*) AS count, IFNULL(SUM(total_amount),0) AS revenue FROM orders WHERE DATE(order_time) = CURDATE()");
    const todayOrders = Array.isArray(todayOrdersRows) ? todayOrdersRows[0] : todayOrdersRows;

    const todayFinancialRows = await q("SELECT type, IFNULL(SUM(amount),0) AS total FROM financial WHERE DATE(created_at) = CURDATE() GROUP BY type");
    let todayFinancialNet = 0;
    if (Array.isArray(todayFinancialRows)) {
      todayFinancialRows.forEach(r => { if (r.type === 'income') todayFinancialNet += Number(r.total || 0); else todayFinancialNet -= Number(r.total || 0); });
    }

    const customersCountRows = await q('SELECT COUNT(*) AS count FROM customers');
    const customersCount = Array.isArray(customersCountRows) ? customersCountRows[0].count : customersCountRows.count;

    const reservationsCountRows = await q('SELECT COUNT(*) AS count FROM reservations');
    const reservationsCount = Array.isArray(reservationsCountRows) ? reservationsCountRows[0].count : reservationsCountRows.count;

    const staffCountRows = await q('SELECT COUNT(*) AS count FROM staff');
    const staffCount = Array.isArray(staffCountRows) ? staffCountRows[0].count : staffCountRows.count;

    const attendancePresentRows = await q("SELECT COUNT(*) AS count FROM attendance WHERE DATE(date) = CURDATE() AND status = 'present'");
    const attendancePresent = Array.isArray(attendancePresentRows) ? attendancePresentRows[0].count : attendancePresentRows.count;

    // Last 7 days orders and revenue
    const last7 = await q("SELECT DATE(order_time) AS day, COUNT(*) AS orders, IFNULL(SUM(total_amount),0) AS revenue FROM orders WHERE order_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(order_time) ORDER BY day");

    // Recent orders (latest 4)
    const recentOrders = await q('SELECT order_id, customer_id, total_amount, status, order_time, notes FROM orders ORDER BY order_time DESC LIMIT 4');

    res.json({
      today: {
        orders_count: Number(todayOrders.count || 0),
        orders_revenue: Number(todayOrders.revenue || 0),
        financial_net: Number(todayFinancialNet || 0),
        attendance_present: Number(attendancePresent || 0),
      },
      counts: {
        customers: Number(customersCount || 0),
        reservations: Number(reservationsCount || 0),
        staff: Number(staffCount || 0),
      },
      last7: Array.isArray(last7) ? last7 : [],
      recentOrders: Array.isArray(recentOrders) ? recentOrders : [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);

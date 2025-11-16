import mysql from 'mysql2/promise';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '200606';
const DB_NAME = process.env.DB_NAME || 'restaurant_db';
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

async function main() {
  console.log('Connecting to MySQL...', { host: DB_HOST, user: DB_USER, database: DB_NAME, port: DB_PORT });
  const conn = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, port: DB_PORT });
  try {
    console.log('Disabling foreign key checks and truncating tables...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    const tables = ['orders','reservations','financial','attendance','customers','staff'];
    for (const t of tables) {
      // Use backtick-escaped identifier to avoid conflicts with reserved words
      await conn.query(`TRUNCATE TABLE \`${t}\``);
    }

    console.log('Inserting seed data...');

    // Customers
    await conn.query(
      `INSERT INTO customers (name, phone, email) VALUES
      ('Asha Patel', '9876543210', 'asha.patel@example.com'),
      ('Vikram Singh', '9876543211', 'vikram.singh@example.com'),
      ('Priya Sharma', '9876543212', 'priya.sharma@example.com'),
      ('Guest', NULL, NULL),
      ('Ravi Kumar', '9876543213', 'ravi.kumar@example.com'),
      ('Neha Rao', '9876543214', 'neha.rao@example.com')`
    );

    // Staff
    await conn.query(
      `INSERT INTO staff (name, role, email, phone) VALUES
      ('Sanjay Mehta','Manager','sanjay.mehta@example.com','9000000001'),
      ('Anita Desai','Chef','anita.desai@example.com','9000000002'),
      ('Rakesh Gupta','Captain','rakesh.gupta@example.com','9000000003'),
      ('Maya Iyer','Waiter','maya.iyer@example.com','9000000004'),
      ('Arjun Rao','Waiter','arjun.rao@example.com','9000000005')`
    );

    // Orders (some past days, some today)
    await conn.query(
      `INSERT INTO orders (customer_id, total_amount, status, order_time, notes) VALUES
      (1, 450.00, 'completed', NOW() - INTERVAL 3 DAY, 'Dine-in: Thali x2'),
      (2, 320.50, 'completed', NOW() - INTERVAL 2 DAY, 'Birthday booking'),
      (3, 150.75, 'completed', NOW() - INTERVAL 1 DAY, 'Lunch special'),
      (NULL, 89.90, 'pending', NOW(), 'Walk-in guest, snacks'),
      (5, 599.00, 'preparing', NOW(), 'Dinner: Family pack'),
      (6, 240.00, 'completed', NOW() - INTERVAL 6 DAY, 'Takeaway')`
    );

    // Reservations
    await conn.query(
      `INSERT INTO reservations (customer_id, party_size, reserve_time, status) VALUES
      (1,2, DATE_ADD(NOW(), INTERVAL 1 DAY), 'confirmed'),
      (2,4, DATE_ADD(NOW(), INTERVAL 2 DAY), 'confirmed'),
      (5,6, DATE_ADD(NOW(), INTERVAL 5 DAY), 'confirmed')`
    );

    // Financial entries
    await conn.query(
      `INSERT INTO financial (type, amount, category, note) VALUES
      ('income', 450.00, 'sales', 'Order from Asha'),
      ('income', 320.50, 'sales', 'Order from Vikram'),
      ('income', 150.75, 'sales', 'Order from Priya'),
      ('expense', 200.00, 'supplies', 'Vegetables and fruits'),
      ('expense', 300.00, 'utilities', 'Gas and electricity')`
    );

    // Attendance (today)
    await conn.query(
      `INSERT INTO attendance (staff_id, date, check_in, check_out, status, hours) VALUES
      (1, CURDATE(), '09:00:00', '18:00:00', 'present', 9.00),
      (2, CURDATE(), '09:15:00', '18:30:00', 'present', 9.25),
      (3, CURDATE(), '11:00:00', '20:00:00', 'present', 9.00),
      (4, CURDATE(), NULL, NULL, 'absent', 0.00)`
    );

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Seed complete.');

    // Log counts
    const [custCount] = await conn.query('SELECT COUNT(*) AS c FROM customers');
    const [staffCount] = await conn.query('SELECT COUNT(*) AS c FROM staff');
    const [ordersCount] = await conn.query('SELECT COUNT(*) AS c FROM orders');
    const [resCount] = await conn.query('SELECT COUNT(*) AS c FROM reservations');
    const [finCount] = await conn.query('SELECT COUNT(*) AS c FROM financial');
    const [attCount] = await conn.query('SELECT COUNT(*) AS c FROM attendance');

    console.log('Counts:', {
      customers: custCount[0].c,
      staff: staffCount[0].c,
      orders: ordersCount[0].c,
      reservations: resCount[0].c,
      financial: finCount[0].c,
      attendance: attCount[0].c,
    });

  } catch (err) {
    console.error('Seed failed:', err.message || err);
  } finally {
    await conn.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

import db from './db.js';

const checkSql = `SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`;
db.query(checkSql, ['restaurant_db', 'staff', 'phone'], (err, rows) => {
  if (err) {
    console.error('Check failed:', err.message);
    process.exit(1);
  }
  const cnt = rows[0].cnt;
  if (cnt > 0) {
    console.log('phone column already exists');
    process.exit(0);
  }

  const alter = `ALTER TABLE staff ADD COLUMN phone VARCHAR(30)`;
  db.query(alter, (err2) => {
    if (err2) {
      console.error('ALTER TABLE failed:', err2.message);
      process.exit(1);
    }
    console.log('phone column added');
    // Optionally set phones for existing seeded rows if empty
    db.query("UPDATE staff SET phone = '555-0201' WHERE name = 'Maria Gonzales'", () => {});
    db.query("UPDATE staff SET phone = '555-0202' WHERE name = 'Jake Turner'", () => {});
    process.exit(0);
  });
});

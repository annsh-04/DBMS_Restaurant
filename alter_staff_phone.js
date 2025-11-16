import db from './db.js';

const sql = `ALTER TABLE staff ADD COLUMN IF NOT EXISTS phone VARCHAR(30)`;

db.query(sql, (err, res) => {
  if (err) {
    console.error('ALTER TABLE failed:', err.message);
    process.exit(1);
  }
  console.log('ALTER TABLE executed or column already exists');
  process.exit(0);
});

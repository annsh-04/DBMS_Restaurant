(async () => {
  try {
    console.log('Starting staff CRUD test...');
    // Create
    let res = await fetch('http://localhost:3000/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Auto Staff', role: 'Chef', email: 'astaff@test', phone: '111' }),
    });
    const text = await res.text();
    let created;
    try { created = JSON.parse(text); } catch (e) {
      console.error('Failed to parse create response, status', res.status);
      console.error(text);
      process.exit(1);
    }
    console.log('CREATED:', created);

    // List
    const list = await (await fetch('http://localhost:3000/api/staff')).json();
    console.log('COUNT AFTER CREATE:', list.length);

    // Update
    const id = created.staff_id;
    const upd = await (await fetch(`http://localhost:3000/api/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Auto Staff Updated', role: 'Head Chef', email: 'astaff@test', phone: '222' }),
    })).json();
    console.log('UPDATED:', upd);

    // Delete
    const delRes = await fetch(`http://localhost:3000/api/staff/${id}`, { method: 'DELETE' });
    console.log('DELETE STATUS:', delRes.status);

    // Final list
    const final = await (await fetch('http://localhost:3000/api/staff')).json();
    console.log('COUNT AFTER DELETE:', final.length);

    console.log('Staff CRUD test completed.');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
})();

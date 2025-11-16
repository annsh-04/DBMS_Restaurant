(async () => {
  const fetch = globalThis.fetch;
  try {
    console.log('Starting customers CRUD test...');

    // Create
    let res = await fetch('http://localhost:3000/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Auto Test', email: 'auto@test', phone: '123' }),
    });
    const created = await res.json();
    console.log('CREATED:', created);

    // List
    const list = await (await fetch('http://localhost:3000/api/customers')).json();
    console.log('COUNT AFTER CREATE:', list.length);

    // Update
    const id = created.customer_id;
    const upd = await (await fetch(`http://localhost:3000/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Auto Test Updated', email: 'auto@test', phone: '456' }),
    })).json();
    console.log('UPDATED:', upd);

    // Delete
    const delRes = await fetch(`http://localhost:3000/api/customers/${id}`, { method: 'DELETE' });
    console.log('DELETE STATUS:', delRes.status);

    // Final list
    const final = await (await fetch('http://localhost:3000/api/customers')).json();
    console.log('COUNT AFTER DELETE:', final.length);

    console.log('Customers CRUD test completed.');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
})();

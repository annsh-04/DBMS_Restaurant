export const API_BASE_URL = "http://localhost:3000";

export async function fetchData<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return res.json();
}

export async function postData<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to POST ${endpoint}`);
  return res.json();
}

export async function putData<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to PUT ${endpoint}`);
  return res.json();
}

export async function deleteData(endpoint: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to DELETE ${endpoint}`);
}

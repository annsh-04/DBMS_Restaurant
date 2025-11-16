import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetchData, postData, putData, deleteData } from "@/api/client";

type Reservation = { reservation_id: number; customer_id?: number | null; party_size: number; reserve_time?: string | null; status?: string };

const defaultForm = { customer_id: "", party_size: 2, reserve_time: "", status: "confirmed" };

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [form, setForm] = useState<any>(defaultForm);

  useEffect(() => { loadReservations(); }, []);

  async function loadReservations() {
    setIsLoading(true);
    try {
      const data = await fetchData<Reservation[]>('/api/reservations');
      setReservations(data || []);
    } catch (e) {
      console.error('Failed to load reservations', e);
    } finally { setIsLoading(false); }
  }

  function openAdd() { setEditing(null); setForm(defaultForm); setDialogOpen(true); }
  function openEdit(r: Reservation) { setEditing(r); setForm({ customer_id: r.customer_id || '', party_size: r.party_size, reserve_time: r.reserve_time || '', status: r.status || 'confirmed' }); setDialogOpen(true); }

  async function save() {
    try {
      if (editing) {
        const updated = await putData<Reservation>(`/api/reservations/${editing.reservation_id}`, form);
        setReservations(prev => prev.map(p => p.reservation_id === updated.reservation_id ? updated : p));
      } else {
        const created = await postData<Reservation>(`/api/reservations`, form);
        setReservations(prev => [created, ...prev]);
      }
      setDialogOpen(false);
    } catch (e) { console.error('Save failed', e); alert('Failed to save reservation'); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this reservation?')) return;
    try { await deleteData(`/api/reservations/${id}`); setReservations(prev => prev.filter(r => r.reservation_id !== id)); } catch (e) { console.error('Delete failed', e); alert('Failed to delete reservation'); }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground mt-1">Manage table reservations</p>
        </div>
        <div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={openAdd}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                New Reservation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? 'Edit Reservation' : 'New Reservation'}</DialogTitle></DialogHeader>
              <div className="grid gap-2">
                <label className="text-sm">Customer ID (optional)</label>
                <Input value={form.customer_id} onChange={(e:any)=>setForm({...form, customer_id: e.target.value})} />
                <label className="text-sm">Party Size</label>
                <Input type="number" value={form.party_size} onChange={(e:any)=>setForm({...form, party_size: Number(e.target.value)})} />
                <label className="text-sm">Reserve Time (ISO)</label>
                <Input value={form.reserve_time} onChange={(e:any)=>setForm({...form, reserve_time: e.target.value})} placeholder="2025-01-15T19:00:00 (local)" />
                <label className="text-sm">Status</label>
                <Input value={form.status} onChange={(e:any)=>setForm({...form, status: e.target.value})} />
              </div>
              <DialogFooter>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={()=>setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={save}>{editing ? 'Save' : 'Create'}</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? <div>Loading...</div> : reservations.map((reservation)=> (
          <Card key={reservation.reservation_id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{reservation.customer_id ? `Customer #${reservation.customer_id}` : 'Guest'}</CardTitle>
                <Badge variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}>{reservation.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground"><Clock className="mr-2 h-4 w-4" />{reservation.reserve_time ? new Date(reservation.reserve_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '-'}</div>
              <div className="flex items-center text-sm text-muted-foreground"><Users className="mr-2 h-4 w-4" />{reservation.party_size} guests</div>
              <div className="flex gap-2 pt-2">
                {reservation.status === 'pending' && <Button size="sm" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={()=>openEdit(reservation)}>Confirm</Button>}
                <Button size="sm" variant="outline" className="flex-1" onClick={()=>openEdit(reservation)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={()=>handleDelete(reservation.reservation_id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

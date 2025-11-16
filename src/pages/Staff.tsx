import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";
import { fetchData, postData, putData, deleteData } from "@/api/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Staff = { staff_id: number; name: string; role?: string; email?: string; phone?: string };

const defaultForm = { name: "", role: "", email: "", phone: "" };

export default function Staff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    setIsLoading(true);
    try {
      const data = await fetchData<Staff[]>("/api/staff");
      setStaff(data);
    } catch (e) {
      console.error("Failed to load staff", e);
    } finally {
      setIsLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  }

  function openEdit(s: Staff) {
    setEditing(s);
    setForm({ name: s.name || "", role: s.role || "", email: s.email || "", phone: s.phone || "" });
    setDialogOpen(true);
  }

  async function save() {
    try {
      if (editing) {
        const updated = await putData<Staff>(`/api/staff/${editing.staff_id}`, form);
        setStaff((prev) => prev.map((p) => (p.staff_id === updated.staff_id ? updated : p)));
      } else {
        const created = await postData<Staff>(`/api/staff`, form);
        setStaff((prev) => [created, ...prev]);
      }
      setDialogOpen(false);
    } catch (e) {
      console.error("Save failed", e);
      alert("Failed to save staff member");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this staff member?")) return;
    try {
      await deleteData(`/api/staff/${id}`);
      setStaff((prev) => prev.filter((p) => p.staff_id !== id));
    } catch (e) {
      console.error("Delete failed", e);
      alert("Failed to delete staff member");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage your restaurant team</p>
        </div>
        <div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={openAdd}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Staff" : "Add Staff Member"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2">
                <label className="text-sm">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <label className="text-sm">Role</label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                <label className="text-sm">Email</label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <label className="text-sm">Phone</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <DialogFooter>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={save}>{editing ? 'Save' : 'Create'}</Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
              ) : (
                staff.map((s) => (
                  <TableRow key={s.staff_id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.role}</TableCell>
                    <TableCell className="text-muted-foreground">{s.email}</TableCell>
                    <TableCell className="text-muted-foreground">{s.phone}</TableCell>
                    <></>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

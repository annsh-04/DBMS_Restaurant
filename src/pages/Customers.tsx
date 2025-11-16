import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, UserPlus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { fetchData, postData, putData, deleteData } from "@/api/client";
import { Input as UiInput } from "@/components/ui/input";

type Customer = { customer_id: number; name: string; email?: string; phone?: string };

const defaultForm = { name: "", email: "", phone: "" };

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setIsLoading(true);
    try {
      const data = await fetchData<Customer[]>("/api/customers");
      setCustomers(data);
    } catch (e) {
      console.error("Failed to load customers", e);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q)
    );
  });

  function openAdd() {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  }

  function openEdit(c: Customer) {
    setEditing(c);
    setForm({ name: c.name || "", email: c.email || "", phone: c.phone || "" });
    setDialogOpen(true);
  }

  async function save() {
    try {
      if (editing) {
        const updated = await putData<Customer>(`/api/customers/${editing.customer_id}`, form);
        setCustomers((prev) => prev.map((p) => (p.customer_id === updated.customer_id ? updated : p)));
      } else {
        const created = await postData<Customer>(`/api/customers`, form);
        setCustomers((prev) => [created, ...prev]);
      }
      setDialogOpen(false);
    } catch (e) {
      console.error("Save failed", e);
      alert("Failed to save customer");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this customer?")) return;
    try {
      await deleteData(`/api/customers/${id}`);
      setCustomers((prev) => prev.filter((p) => p.customer_id !== id));
    } catch (e) {
      console.error("Delete failed", e);
      alert("Failed to delete customer");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer database</p>
        </div>
        <div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={openAdd}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Customer" : "Add Customer"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2">
                <label className="text-sm">Name</label>
                <UiInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <label className="text-sm">Email</label>
                <UiInput value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <label className="text-sm">Phone</label>
                <UiInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.customer_id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
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

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchData } from "@/api/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { postData, deleteData } from "@/api/client";

// --- TypeScript Interfaces matching the expected API structure ---

type OrderStatus = "completed" | "preparing" | "pending" | "cancelled";

interface Order {
  id: string; // Corresponds to ORDERS.order_id
  customer: string; // Corresponds to CUSTOMERS.name
  itemsSummary: string; // A summary string created by joining ORDER_ITEMS
  total: string; // Corresponds to ORDERS.total_amount
  status: OrderStatus; // Corresponds to ORDERS.status
  orderTime: string; // Corresponds to ORDERS.order_time (formatted for display)
}


// Mock API Call Function
const INRCurrency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

const fetchOrders = async () => {
  const rawOrders = await fetchData<any[]>("/api/orders")

  const orders: Order[] = rawOrders.map(o => {
    // Try to parse items from notes if present (we store items as JSON in notes when created from UI)
    let itemsSummary = "—";
    try {
      if (o.notes) {
        const parsed = JSON.parse(o.notes);
        if (Array.isArray(parsed)) {
          itemsSummary = parsed.map((it:any) => it.name).join(', ');
        } else if (typeof o.notes === 'string') {
          itemsSummary = o.notes;
        }
      }
    } catch (e) {
      // not JSON, fallback
      itemsSummary = o.notes || '—';
    }

    return {
      id: o.order_id.toString(),
      customer: o.customer_id ? `Customer #${o.customer_id}` : "Guest",
      itemsSummary,
      total: o.total_amount,
      status: o.status,
      orderTime: new Date(o.order_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    } as Order
  })

  return orders
}


export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [computedTotal, setComputedTotal] = useState<number>(0);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        // Optionally set an error state here
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Helper function to determine badge styling based on status
  const getBadgeProps = (status: OrderStatus) => {
    switch (status) {
      case "completed":
        return {
          variant: "default",
          className: "bg-green-600/10 text-green-600 hover:bg-green-600/20",
        };
      case "preparing":
        return {
          variant: "secondary",
          className: "bg-amber-600/10 text-amber-600 hover:bg-amber-600/20",
        };
      case "pending":
      default:
        return {
          variant: "outline",
          className: "border-blue-600 text-blue-600 hover:bg-blue-600/5",
        };
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order History</h1>
          <p className="text-muted-foreground mt-1">
            View, track, and manage all customer orders.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          New Order
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Latest Orders</CardTitle>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
            <div className="mb-4 flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">New Order</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>New Order</DialogTitle></DialogHeader>
                  <div className="grid gap-2">
                    <label className="text-sm">Customer ID (optional)</label>
                    <Input id="new-customer" />
                    <label className="text-sm">Items (one per line in format name,price)</label>
                    <textarea id="new-items" className="w-full p-2 border rounded" placeholder={`Burger,199\nFries,59`} onChange={(e) => {
                      const itemsText = e.target.value || '';
                      const items = itemsText.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
                        const parts = line.split(',').map(s=>s.trim());
                        const price = parseFloat(parts[1] || '0');
                        return { price };
                      });
                      const total = items.reduce((s, it) => s + (isNaN(it.price) ? 0 : it.price), 0);
                      setComputedTotal(total);
                    }} />
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="text-sm">Status</label>
                        <Input id="new-status" defaultValue="pending" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Computed total</p>
                        <div id="computed-total" className="text-lg font-semibold">{INRCurrency.format(computedTotal)}</div>
                      </div>
                    </div>
                    <label className="text-sm">Notes (optional)</label>
                    <Input id="new-notes" />
                  </div>
                  <DialogFooter>
                    <div className="flex gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button onClick={async () => {
                        try {
                          const customer = (document.getElementById('new-customer') as HTMLInputElement).value || null;
                          const itemsText = (document.getElementById('new-items') as HTMLTextAreaElement).value || '';
                          const status = (document.getElementById('new-status') as HTMLInputElement).value || 'pending';
                          const notesExtra = (document.getElementById('new-notes') as HTMLInputElement).value || null;

                          // parse items lines
                          const items = itemsText.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
                            const parts = line.split(',').map(s=>s.trim());
                            const name = parts[0] || 'Item';
                            const price = parseFloat(parts[1] || '0');
                            return { name, price };
                          });
                          const total = items.reduce((s, it) => s + (isNaN(it.price) ? 0 : it.price), 0);

                          const notes = items.length ? JSON.stringify(items) : (notesExtra || null);
                          await postData('/api/orders', { customer_id: customer || null, total_amount: total, status, notes });
                          const data = await fetchOrders();
                          setOrders(data);
                        } catch (e) { console.error(e); alert('Failed to create order'); }
                      }}>Create</Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg text-muted-foreground">Loading Orders...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const badgeProps = getBadgeProps(order.status);
                  return (
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.itemsSummary}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.orderTime}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {INRCurrency.format(Number(order.total))}
                      </TableCell>
                      <TableCell>
                        <select value={order.status} onChange={async (e) => {
                          const newStatus = e.target.value as OrderStatus;
                          try {
                            // update status
                            await fetch(`/api/orders/${order.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
                            const data = await fetchOrders();
                            setOrders(data);
                          } catch (err) { console.error('Failed to update status', err); alert('Failed to update status'); }
                        }} className="px-2 py-1 rounded border">
                          <option value="completed">completed</option>
                          <option value="preparing">preparing</option>
                          <option value="pending">pending</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Users, Calendar } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchData } from "@/api/client";

// Defaults; will be replaced by server /api/summary
const defaultSales = [] as Array<{ name: string; revenue: number }>;
const defaultOrdersSeries = [] as Array<{ name: string; orders: number }>;

// recentOrders will be derived from live orders fetched from the backend.

export default function Dashboard() {
  const INRCurrency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [financial, setFinancial] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [salesData, setSalesData] = useState(defaultSales);
  const [ordersData, setOrdersData] = useState(defaultOrdersSeries);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [cust, ord, resv, stf, fin, att, summ] = await Promise.all([
          fetchData<any[]>('/api/customers'),
          fetchData<any[]>('/api/orders'),
          fetchData<any[]>('/api/reservations'),
          fetchData<any[]>('/api/staff'),
          fetchData<any[]>('/api/financial'),
          fetchData<any[]>('/api/attendance'),
          fetchData<any>('/api/summary'),
        ]);
        if (!mounted) return;
        setCustomers(cust || []);
        setOrders(ord || []);
        setReservations(resv || []);
  setFinancial(fin || []);
  setAttendance(att || []);
        setStaff(stf || []);
        setSummary(summ || null);
        // Populate chart data from summary.last7 if available
        if (summ && Array.isArray(summ.last7)) {
          // Map last7 entries to arrays covering each day
          const last7 = summ.last7;
          setSalesData(last7.map((r: any) => ({ name: String(r.day), revenue: Number(r.revenue || 0) })));
          setOrdersData(last7.map((r: any) => ({ name: String(r.day), orders: Number(r.orders || 0) })));
        }
      } catch (err) {
        // keep working offline if API fails
        // eslint-disable-next-line no-console
        console.error('Failed to load dashboard data', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Helper: relative time string for recent orders
  function timeAgo(dateStr: string | null | undefined) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  // Derived metrics
  const totalOrders = orders.length;
  const activeCustomers = customers.length;
  const reservationsCount = reservations.length;
  const todayOrdersRevenue = orders.reduce((sum, o) => {
    try {
      if (!o.order_time) return sum;
      const d = new Date(o.order_time);
      const now = new Date();
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) {
        return sum + Number(o.total_amount || 0);
      }
    } catch (_) {
      // ignore parse errors
    }
    return sum;
  }, 0);

  // Financial totals for today (income/expense)
  const todayFinancialNet = (financial || []).reduce((sum, f) => {
    try {
      if (!f.created_at) return sum;
      const d = new Date(f.created_at);
      const now = new Date();
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) {
        return sum + (f.type === 'income' ? Number(f.amount || 0) : -Number(f.amount || 0));
      }
    } catch (_) {}
    return sum;
  }, 0);

  // Attendance present count for today
  const attendancePresentToday = (attendance || []).filter((a) => {
    try {
      if (!a.date) return false;
      const d = new Date(a.date);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate() && a.status === 'present';
    } catch (_) { return false; }
  }).length;

  const recentOrders = [...orders]
    .sort((a, b) => {
      const ta = a.order_time ? new Date(a.order_time).getTime() : 0;
      const tb = b.order_time ? new Date(b.order_time).getTime() : 0;
      return tb - ta;
    })
    .slice(0, 4)
    .map((o) => ({
      id: `#${o.order_id}`,
      customer: (customers.find((c) => c.customer_id === o.customer_id)?.name) || 'Guest',
      amount: o.total_amount || 0,
      status: o.status || 'pending',
      time: timeAgo(o.order_time),
    }));
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your restaurant performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today's Net"
          value={INRCurrency.format(todayFinancialNet)}
          icon={DollarSign}
          change=""
          changeType="neutral"
        />
        <MetricCard
          title="Total Orders"
          value={String(totalOrders)}
          icon={ShoppingBag}
          change=""
          changeType="neutral"
        />
        <MetricCard
          title="Active Customers"
          value={String(activeCustomers)}
          icon={Users}
          change=""
          changeType="neutral"
        />
        <MetricCard
          title="Attendance Present"
          value={String(attendancePresentToday)}
          icon={Calendar}
          change=""
          changeType="neutral"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }} 
                />
                <Bar dataKey="orders" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-foreground">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-foreground">{INRCurrency.format(Number(order.amount))}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === "completed" ? "bg-accent/10 text-accent" :
                    order.status === "preparing" ? "bg-warning/10 text-warning" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {order.status}
                  </span>
                  <span className="text-sm text-muted-foreground w-24 text-right">{order.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

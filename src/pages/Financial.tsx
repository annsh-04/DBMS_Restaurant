import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { fetchData, postData, deleteData } from "@/api/client";
const INRCurrency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const monthlyData = [
  { month: "Jan", revenue: 45000, expenses: 28000, profit: 17000 },
  { month: "Feb", revenue: 52000, expenses: 30000, profit: 22000 },
  { month: "Mar", revenue: 48000, expenses: 29000, profit: 19000 },
  { month: "Apr", revenue: 61000, expenses: 32000, profit: 29000 },
  { month: "May", revenue: 55000, expenses: 31000, profit: 24000 },
  { month: "Jun", revenue: 67000, expenses: 35000, profit: 32000 },
];

const categoryExpenses = [
  { category: "Food & Beverages", amount: 18000 },
  { category: "Salaries", amount: 12000 },
  { category: "Utilities", amount: 3000 },
  { category: "Rent", amount: 5000 },
  { category: "Marketing", amount: 2000 },
];

export default function Financial() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => { loadEntries(); }, []);

  async function loadEntries(){
    try{ const data = await fetchData<any[]>('/api/financial'); setEntries(data || []); }catch(e){console.error('Failed to load financial entries',e)}
  }

  async function createEntry()
  {
    const type = (document.getElementById('entry-type') as HTMLInputElement).value;
    const amount = parseFloat((document.getElementById('entry-amount') as HTMLInputElement).value || '0');
    const category = (document.getElementById('entry-category') as HTMLInputElement).value || null;
    const note = (document.getElementById('entry-note') as HTMLInputElement).value || null;
    try{ await postData('/api/financial',{type, amount, category, note}); await loadEntries(); }catch(e){console.error(e); alert('Create failed')}
  }

  const totalRevenue = monthlyData[monthlyData.length - 1].revenue;
  const totalExpenses = monthlyData[monthlyData.length - 1].expenses;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Financial Overview</h1>
        <p className="text-muted-foreground mt-1">Track revenue, expenses, and profitability</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{INRCurrency.format(totalRevenue)}</div>
            <p className="text-xs text-accent mt-1">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <TrendingDown className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{INRCurrency.format(totalExpenses)}</div>
            <p className="text-xs text-destructive mt-1">+3.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{INRCurrency.format(netProfit)}</div>
            <p className="text-xs text-muted-foreground mt-1">{profitMargin}% profit margin</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)"
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--destructive))" }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--accent))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={categoryExpenses} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" width={150} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)"
                }}
              />
              <Bar dataKey="amount" fill="hsl(var(--secondary))" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Add Entry</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Financial Entry</DialogTitle></DialogHeader>
                <div className="grid gap-2">
                  <label className="text-sm">Type (income|expense)</label>
                  <Input id="entry-type" defaultValue="income" />
                  <label className="text-sm">Amount</label>
                  <Input id="entry-amount" />
                  <label className="text-sm">Category</label>
                  <Input id="entry-category" />
                  <label className="text-sm">Note</label>
                  <Input id="entry-note" />
                </div>
                <DialogFooter>
                  <div className="flex gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={createEntry}>Create</Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="text-left">ID</th>
                  <th className="text-left">Type</th>
                  <th className="text-left">Amount</th>
                  <th className="text-left">Category</th>
                  <th className="text-left">Note</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} className="hover:bg-muted/50">
                    <td>{e.id}</td>
                    <td>{e.type}</td>
                    <td>{INRCurrency.format(Number(e.amount))}</td>
                    <td>{e.category}</td>
                    <td>{e.note}</td>
                    <td className="text-right"><Button variant="destructive" size="sm" onClick={async ()=>{ if(!confirm('Delete entry?')) return; try{ await deleteData(`/api/financial/${e.id}`); await loadEntries(); }catch(err){console.error(err); alert('Delete failed')} }}>Delete</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

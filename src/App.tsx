import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Reservations from "./pages/Reservations";
import Orders from "./pages/Orders";
import Staff from "./pages/Staff";
import Financial from "./pages/Financial";
import Attendance from "./pages/Attendance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/customers" element={<DashboardLayout><Customers /></DashboardLayout>} />
          <Route path="/reservations" element={<DashboardLayout><Reservations /></DashboardLayout>} />
          <Route path="/orders" element={<DashboardLayout><Orders /></DashboardLayout>} />
          <Route path="/staff" element={<DashboardLayout><Staff /></DashboardLayout>} />
          <Route path="/financial" element={<DashboardLayout><Financial /></DashboardLayout>} />
          <Route path="/attendance" element={<DashboardLayout><Attendance /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

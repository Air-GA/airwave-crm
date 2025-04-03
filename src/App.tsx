
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Unauthorized from "@/pages/Unauthorized";
import Customers from "@/pages/Customers";
import WorkOrders from "@/pages/WorkOrders";
import CreateWorkOrder from "@/pages/CreateWorkOrder";
import Schedule from "@/pages/Schedule";
import Dispatch from "@/pages/Dispatch";
import Inventory from "@/pages/Inventory";
import Invoices from "@/pages/Invoices";
import Reports from "@/pages/Reports";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Timesheets from "@/pages/Timesheets";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import RoleGuard from "@/components/auth/RoleGuard";
import ImportData from "@/pages/ImportData";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="hvac-ui-theme">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected routes */}
            <Route element={<RoleGuard allowedRoles={["user", "admin"]} />}>
              <Route path="/customers" element={<Customers />} />
              <Route path="/work-orders" element={<WorkOrders />} />
              <Route path="/work-orders/create" element={<CreateWorkOrder />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/dispatch" element={<Dispatch />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/timesheets" element={<Timesheets />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/import-data" element={<ImportData />} />
            </Route>

            {/* Not found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;

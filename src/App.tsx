
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";

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
import { RoleGuard } from "@/components/guards/RoleGuard";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="hvac-ui-theme">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected routes */}
              <Route path="/customers" element={
                <RoleGuard allowedRoles={["admin", "manager", "csr", "sales", "customer"]}>
                  <Customers />
                </RoleGuard>
              } />
              <Route path="/work-orders" element={
                <RoleGuard allowedRoles={["admin", "manager", "csr", "technician", "customer"]}>
                  <WorkOrders />
                </RoleGuard>
              } />
              <Route path="/work-orders/create" element={
                <RoleGuard allowedRoles={["admin", "manager", "csr", "sales"]}>
                  <CreateWorkOrder />
                </RoleGuard>
              } />
              <Route path="/schedule" element={
                <RoleGuard allowedRoles={["admin", "manager", "csr", "technician", "customer"]}>
                  <Schedule />
                </RoleGuard>
              } />
              <Route path="/dispatch" element={
                <RoleGuard allowedRoles={["admin", "manager", "csr"]}>
                  <Dispatch />
                </RoleGuard>
              } />
              <Route path="/inventory" element={
                <RoleGuard allowedRoles={["admin", "manager", "technician"]}>
                  <Inventory />
                </RoleGuard>
              } />
              <Route path="/invoices" element={
                <RoleGuard allowedRoles={["admin", "manager", "csr", "sales", "customer"]}>
                  <Invoices />
                </RoleGuard>
              } />
              <Route path="/reports" element={
                <RoleGuard allowedRoles={["admin", "manager", "hr"]}>
                  <Reports />
                </RoleGuard>
              } />
              <Route path="/messages" element={
                <RoleGuard allowedRoles={["admin", "manager", "csr", "sales", "hr", "technician", "customer"]}>
                  <Messages />
                </RoleGuard>
              } />
              <Route path="/notifications" element={
                <RoleGuard allowedRoles={["admin", "manager", "csr", "sales", "hr", "technician", "customer"]}>
                  <Notifications />
                </RoleGuard>
              } />
              <Route path="/timesheets" element={
                <RoleGuard allowedRoles={["admin", "manager", "hr", "technician"]}>
                  <Timesheets />
                </RoleGuard>
              } />
              <Route path="/settings" element={
                <RoleGuard allowedRoles={["admin", "manager", "customer"]}>
                  <Settings />
                </RoleGuard>
              } />

              {/* Not found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;

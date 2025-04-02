
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RoleGuard } from "@/components/guards/RoleGuard";
import Dashboard from "./pages/Index";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import Login from "./pages/Login";
import Customers from "./pages/Customers";
import WorkOrders from "./pages/WorkOrders";
import CreateWorkOrder from "./pages/CreateWorkOrder";
import Dispatch from "./pages/Dispatch";
import Schedule from "./pages/Schedule";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Timesheets from "./pages/Timesheets";
import Reports from "./pages/Reports";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <RoleGuard allowedRoles={['admin', 'manager', 'csr', 'sales', 'hr', 'tech', 'customer']}>
                <Dashboard />
              </RoleGuard>
            } />
            
            <Route path="/customers" element={
              <RoleGuard allowedRoles={['admin', 'manager', 'csr', 'sales']}>
                <Customers />
              </RoleGuard>
            } />
            
            <Route path="/work-orders" element={
              <RoleGuard allowedRoles={['admin', 'manager', 'csr', 'tech']}>
                <WorkOrders />
              </RoleGuard>
            } />
            
            <Route path="/work-orders/create" element={
              <RoleGuard allowedRoles={['admin', 'manager', 'csr']}>
                <CreateWorkOrder />
              </RoleGuard>
            } />
            
            <Route path="/dispatch" element={
              <RoleGuard allowedRoles={['admin', 'manager', 'csr']}>
                <Dispatch />
              </RoleGuard>
            } />
            
            <Route path="/schedule" element={
              <RoleGuard allowedRoles={['admin', 'manager', 'csr', 'tech', 'customer']}>
                <Schedule />
              </RoleGuard>
            } />
            
            <Route path="/inventory" element={
              <RoleGuard allowedRoles={['admin', 'manager']}>
                <Inventory />
              </RoleGuard>
            } />
            
            <Route path="/invoices" element={
              <RoleGuard allowedRoles={['admin', 'manager', 'customer']}>
                <Invoices />
              </RoleGuard>
            } />
            
            <Route path="/timesheets" element={
              <RoleGuard allowedRoles={['admin', 'manager', 'hr', 'tech']}>
                <Timesheets />
              </RoleGuard>
            } />
            
            <Route path="/reports" element={
              <RoleGuard allowedRoles={['admin', 'manager']}>
                <Reports />
              </RoleGuard>
            } />
            
            <Route path="/messages" element={
              <RoleGuard allowedRoles={['admin', 'manager', 'csr', 'sales', 'tech', 'customer']}>
                <Messages />
              </RoleGuard>
            } />
            
            <Route path="/settings" element={
              <RoleGuard allowedRoles={['admin']}>
                <Settings />
              </RoleGuard>
            } />
            
            <Route path="/notifications" element={
              <RoleGuard allowedRoles={['admin', 'manager', 'csr', 'sales', 'hr', 'tech', 'customer']}>
                <Notifications />
              </RoleGuard>
            } />
            
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

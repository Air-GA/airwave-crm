
import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import CreateWorkOrder from './pages/CreateWorkOrder';
import CustomersList from './pages/CustomersList';
import Dispatch from './pages/Dispatch';
import Index from './pages/Index';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import Login from './pages/Login';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';
import PurchaseOrders from './pages/PurchaseOrders';
import Reports from './pages/Reports';
import Schedule from './pages/Schedule';
import ServiceAddresses from './pages/ServiceAddresses';
import Settings from './pages/Settings';
import Timesheets from './pages/Timesheets';
import Unauthorized from './pages/Unauthorized';
import WorkOrders from './pages/WorkOrders';
import { initializeCustomerStore } from './services/customerStore';

const RoutesComponent = () => {
  useEffect(() => {
    // Initialize customer store when the app loads
    console.log("RoutesComponent: Initializing customer store");
    initializeCustomerStore();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/customers" element={<CustomersList />} />
      <Route path="/customers-list" element={<CustomersList />} />
      <Route path="/dispatch" element={<Dispatch />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/login" element={<Login />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/purchase-orders" element={<PurchaseOrders />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/service-addresses" element={<ServiceAddresses />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/timesheets" element={<Timesheets />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/work-orders" element={<WorkOrders />} />
      <Route path="/work-orders/create" element={<CreateWorkOrder />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;

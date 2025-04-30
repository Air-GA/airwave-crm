
import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import CustomersList from './pages/CustomersList';
import Customers from './pages/Customers';
import Schedule from './pages/Schedule';
import Login from './pages/Login';
import Dispatch from './pages/Dispatch';
import WorkOrders from './pages/WorkOrders';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import Inventory from './pages/Inventory';
import CreateWorkOrder from './pages/CreateWorkOrder';
import Reports from './pages/Reports';
import PurchaseOrders from './pages/PurchaseOrders';
import Invoices from './pages/Invoices';
import Timesheets from './pages/Timesheets';
import Messages from './pages/Messages';
import ServiceAddresses from './pages/ServiceAddresses';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import { fetchCustomers } from './services/customerStore';

const RoutesComponent = () => {
  useEffect(() => {
    // Initialize customer store when the app loads
    fetchCustomers();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customers-list" element={<CustomersList />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/dispatch" element={<Dispatch />} />
      <Route path="/work-orders" element={<WorkOrders />} />
      <Route path="/work-orders/create" element={<CreateWorkOrder />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/purchase-orders" element={<PurchaseOrders />} />
      <Route path="/invoices" element={<Invoices />} />
      <Route path="/timesheets" element={<Timesheets />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/service-addresses" element={<ServiceAddresses />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;

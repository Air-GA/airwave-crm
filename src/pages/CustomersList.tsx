import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowUpDown, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Home,
  Filter,
  Plus,
  LayoutGrid,
  LayoutList,
  UserRound,
  FileEdit,
  RefreshCw
} from "lucide-react";

import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SyncWithQuickBooks } from "@/components/SyncWithQuickBooks";
import { SyncThreeCustomersButton } from "@/components/SyncThreeCustomersButton";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerCard } from "@/components/customers/CustomerCard";
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Customer, ServiceAddress } from "@/types";
import { apiIntegrationService } from "@/services/apiIntegrationService";
import { customers } from "@/data/mockData";
import { getStaticCustomers } from "@/services/customerSyncService";

const staticCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '404-555-1234',
    address: '123 Main St, Atlanta, GA 30301',
    billAddress: '123 Main St, Atlanta, GA 30301',
    serviceAddresses: [
      {
        id: 'addr-1',
        address: '123 Main St, Atlanta, GA 30301',
        isPrimary: true,
        notes: 'Primary residence'
      }
    ],
    type: 'residential',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastService: new Date().toISOString()
  },
  {
    id: 'c3',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '404-555-3456',
    address: '456 Oak Dr, Marietta, GA 30060',
    billAddress: '456 Oak Dr, Marietta, GA 30060',
    serviceAddresses: [
      {
        id: 'addr-4',
        address: '456 Oak Dr, Marietta, GA 30060',
        isPrimary: true,
        notes: 'Home address'
      }
    ],
    type: 'residential',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastService: new Date().toISOString()
  },
  {
    id: 'c5',
    name: 'Thomas Family',
    email: 'thomasfamily@outlook.com',
    phone: '770-555-7890',
    address: '789 Pine Road, Alpharetta, GA',
    billAddress: '789 Pine Road, Alpharetta, GA',
    serviceAddresses: [
      {
        id: 'addr-5',
        address: '789 Pine Road, Alpharetta, GA',
        isPrimary: true,
        notes: 'Beware of dog'
      }
    ],
    type: 'residential',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastService: new Date().toISOString()
  }
];

// Rest of the component remains unchanged

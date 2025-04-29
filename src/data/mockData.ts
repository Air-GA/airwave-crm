
import { Technician, WorkOrder } from '@/types';

export const technicians: Technician[] = [
  {
    id: "tech-1",
    name: "Mike Johnson",
    status: "available",
    specialties: ["HVAC", "Electrical"],
    currentLocationLat: 37.7749,
    currentLocationLng: -122.4194,
    currentLocationAddress: "123 Market St, San Francisco, CA",
    email: "mike.j@example.com",
    phone: "555-1234",
    createdAt: "2023-01-15T08:00:00Z"
  },
  {
    id: "tech-2",
    name: "Sarah Williams",
    status: "busy",
    specialties: ["Plumbing", "Electrical"],
    currentLocationLat: 37.7833,
    currentLocationLng: -122.4167,
    currentLocationAddress: "456 Mission St, San Francisco, CA",
    email: "sarah.w@example.com",
    phone: "555-2345",
    createdAt: "2023-02-20T09:30:00Z"
  },
  {
    id: "tech-3",
    name: "David Chen",
    status: "off-duty",
    specialties: ["Appliance Repair", "HVAC"],
    currentLocationLat: 37.7694,
    currentLocationLng: -122.4862,
    currentLocationAddress: "789 Sunset Blvd, San Francisco, CA",
    email: "david.c@example.com",
    phone: "555-3456",
    createdAt: "2023-03-05T10:15:00Z"
  }
];

const workOrders: WorkOrder[] = [];

const mockData = {
  technicians,
  workOrders
};

export default mockData;

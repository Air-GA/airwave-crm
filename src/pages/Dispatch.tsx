
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { technicians, workOrders } from "@/data/mockData";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { formatDate } from "@/lib/date-utils";

const Dispatch = () => {
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  
  // Get work orders that are pending or scheduled
  const activeWorkOrders = workOrders.filter(
    order => order.status === 'pending' || order.status === 'scheduled'
  );
  
  // Get assigned work orders for the selected technician
  const technicianWorkOrders = selectedTechnicianId
    ? activeWorkOrders.filter(order => order.technicianId === selectedTechnicianId)
    : [];
  
  // Calculate technician status counts
  const availableTechnicians = technicians.filter(tech => tech.status === 'available').length;
  const busyTechnicians = technicians.filter(tech => tech.status === 'busy').length;
  const offDutyTechnicians = technicians.filter(tech => tech.status === 'off-duty').length;
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dispatch</h1>
            <p className="text-muted-foreground">Assign and track technicians</p>
          </div>
        </div>
        
        {/* Status summary */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Total Technicians</p>
                <Badge>{technicians.length}</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Available</p>
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                  {availableTechnicians}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Busy</p>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                  {busyTechnicians}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Off Duty</p>
                <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
                  {offDutyTechnicians}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="map">
          <TabsList>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          <TabsContent value="map" className="pt-4">
            <Card className="overflow-hidden">
              <div className="relative">
                <div 
                  className="h-[500px] bg-cover bg-center" 
                  style={{ 
                    backgroundImage: "url('https://maps.googleapis.com/maps/api/staticmap?center=Atlanta,GA&zoom=11&size=1200x500&maptype=roadmap&key=USE_YOUR_API_KEY_HERE')",
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundColor: '#e5e7eb'
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-center p-4">
                    <div>
                      <MapPin className="h-10 w-10 mx-auto text-primary" />
                      <h3 className="mt-2 text-lg font-medium">Google Maps Integration</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        A real Google Maps integration would be displayed here, showing technicians' locations and optimized routes.
                        <br />This requires a valid Google Maps API key and live data from technicians.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Select a technician on the map or from the list below to view their assigned work orders and route.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="list" className="pt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-1 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Technicians</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[500px] overflow-y-auto">
                    <div className="space-y-2">
                      {technicians.map((technician) => (
                        <div 
                          key={technician.id}
                          className={`
                            flex items-center justify-between rounded-md border p-3 cursor-pointer
                            ${selectedTechnicianId === technician.id ? 'border-primary bg-primary/5' : ''}
                            hover:border-primary hover:bg-primary/5
                          `}
                          onClick={() => setSelectedTechnicianId(technician.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`
                              h-2 w-2 rounded-full
                              ${technician.status === 'available' ? 'bg-green-500' : ''}
                              ${technician.status === 'busy' ? 'bg-amber-500' : ''}
                              ${technician.status === 'off-duty' ? 'bg-gray-500' : ''}
                            `} />
                            <div>
                              <p className="font-medium">{technician.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {technician.specialties.join(', ')}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`
                              ${technician.status === 'available' ? 'bg-green-50 text-green-700 hover:bg-green-50' : ''}
                              ${technician.status === 'busy' ? 'bg-amber-50 text-amber-700 hover:bg-amber-50' : ''}
                              ${technician.status === 'off-duty' ? 'bg-gray-50 text-gray-700 hover:bg-gray-50' : ''}
                            `}
                          >
                            {technician.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                {selectedTechnicianId ? (
                  <>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle>
                          {technicians.find(tech => tech.id === selectedTechnicianId)?.name}'s Location
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const tech = technicians.find(tech => tech.id === selectedTechnicianId);
                          return tech?.currentLocation ? (
                            <div className="space-y-2">
                              <div className="relative h-[200px] bg-cover bg-center rounded-md overflow-hidden" 
                                style={{ 
                                  backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?center=${tech.currentLocation.lat},${tech.currentLocation.lng}&zoom=14&size=600x200&maptype=roadmap&key=USE_YOUR_API_KEY_HERE')`,
                                  backgroundPosition: 'center',
                                  backgroundSize: 'cover',
                                  backgroundColor: '#e5e7eb'
                                }}
                              >
                                <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                                  <MapPin className="h-6 w-6 text-primary" />
                                </div>
                              </div>
                              <p className="text-sm">
                                <span className="font-medium">Current Address:</span> {tech.currentLocation.address}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Last Updated:</span> {formatDate(new Date(tech.currentLocation.timestamp), { includeTime: true })}
                              </p>
                            </div>
                          ) : (
                            <p>Location data not available</p>
                          );
                        })()}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle>Assigned Work Orders</CardTitle>
                          <Button size="sm">Assign New</Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {technicianWorkOrders.length > 0 ? (
                          <div className="space-y-3">
                            {technicianWorkOrders.map((order) => (
                              <div key={order.id} className="rounded-md border p-4">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">#{order.id} - {order.type}</p>
                                  <Badge
                                    variant="outline"
                                    className={`
                                      ${order.status === 'scheduled' ? 'bg-amber-50 text-amber-700 hover:bg-amber-50' : ''}
                                      ${order.status === 'in-progress' ? 'bg-blue-50 text-blue-700 hover:bg-blue-50' : ''}
                                      ${order.status === 'pending' ? 'bg-gray-50 text-gray-700 hover:bg-gray-50' : ''}
                                    `}
                                  >
                                    {order.status}
                                  </Badge>
                                </div>
                                <div className="mt-2 space-y-1.5 text-sm">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{order.customerName}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{order.address}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{formatDate(new Date(order.scheduledDate))}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{formatDate(new Date(order.scheduledDate), { timeOnly: true })}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
                            <h3 className="mt-3 text-lg font-medium">No Assigned Work Orders</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              This technician has no assigned work orders.
                            </p>
                            <Button className="mt-3" size="sm">Assign Work Order</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle>Suggested Route</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-4">
                          <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
                          <h3 className="mt-3 text-lg font-medium">Route Optimization</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            A real implementation would display an optimized route for the technician's work orders.
                            <br />
                            This requires Google's Directions API integration.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <User className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No Technician Selected</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Select a technician from the list to view their location and assigned work orders.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Pending Work Orders */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Unassigned Work Orders</CardTitle>
              <Button size="sm">Assign All</Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeWorkOrders.filter(order => !order.technicianId).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground">Priority</th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeWorkOrders
                      .filter(order => !order.technicianId)
                      .map((order) => (
                        <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="px-3 py-3 text-sm">#{order.id}</td>
                          <td className="px-3 py-3 text-sm">{order.customerName}</td>
                          <td className="px-3 py-3 text-sm capitalize">{order.type}</td>
                          <td className="px-3 py-3">
                            <Badge
                              variant="outline"
                              className={`
                                ${order.priority === 'low' ? 'bg-gray-50 text-gray-700' : ''}
                                ${order.priority === 'medium' ? 'bg-blue-50 text-blue-700' : ''}
                                ${order.priority === 'high' ? 'bg-amber-50 text-amber-700' : ''}
                                ${order.priority === 'emergency' ? 'bg-red-50 text-red-700' : ''}
                              `}
                            >
                              {order.priority}
                            </Badge>
                          </td>
                          <td className="px-3 py-3 text-sm">{formatDate(new Date(order.scheduledDate), { includeTime: true })}</td>
                          <td className="px-3 py-3 text-right">
                            <Button size="sm">Assign</Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-3 text-lg font-medium">No Unassigned Work Orders</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  All work orders have been assigned to technicians.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dispatch;

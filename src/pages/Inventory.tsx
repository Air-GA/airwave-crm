
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertCircle, 
  ArrowDownUp, 
  ChevronDown, 
  Download, 
  Filter, 
  Package, 
  Plus, 
  RefreshCcw, 
  Search, 
  Settings,
  Truck,
  Warehouse,
  Bell,
  Edit,
  AlertTriangle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all-inventory");
  const { permissions } = useAuth();
  
  // Mock data for inventory items
  const inventoryItems = [
    {
      id: "INV001",
      name: "Air Filter - MERV 13",
      sku: "AF-M13-2024",
      category: "Filters",
      inStock: 54,
      minStock: 20,
      price: 24.99,
      supplier: "FilterTech Inc.",
      lastRestocked: "2023-07-15",
      location: "Main Warehouse",
      mobileUnits: [
        { unitId: "MU001", name: "Truck 1", quantity: 5 },
        { unitId: "MU003", name: "Truck 3", quantity: 3 }
      ]
    },
    {
      id: "INV002",
      name: "Refrigerant R-410A (10lb)",
      sku: "REF-410A-10",
      category: "Refrigerants",
      inStock: 12,
      minStock: 15,
      price: 89.95,
      supplier: "Cool Solutions LLC",
      lastRestocked: "2023-08-03",
      location: "Main Warehouse",
      mobileUnits: [
        { unitId: "MU002", name: "Truck 2", quantity: 2 },
      ]
    },
    {
      id: "INV003",
      name: "3-Ton Condenser Fan Motor",
      sku: "MTR-CF3T-01",
      category: "Motors",
      inStock: 8,
      minStock: 5,
      price: 149.99,
      supplier: "HVAC Supply Co.",
      lastRestocked: "2023-07-28",
      location: "Main Warehouse",
      mobileUnits: [
        { unitId: "MU001", name: "Truck 1", quantity: 1 },
      ]
    },
    {
      id: "INV004",
      name: "Capacitor 45/5 MFD",
      sku: "CAP-45-5-01",
      category: "Electrical",
      inStock: 32,
      minStock: 20,
      price: 19.95,
      supplier: "ElectroParts Inc.",
      lastRestocked: "2023-08-10",
      location: "Main Warehouse",
      mobileUnits: [
        { unitId: "MU001", name: "Truck 1", quantity: 8 },
        { unitId: "MU002", name: "Truck 2", quantity: 5 },
        { unitId: "MU003", name: "Truck 3", quantity: 7 }
      ]
    },
    {
      id: "INV005",
      name: "Digital Thermostat - Programmable",
      sku: "THERM-DIG-01",
      category: "Controls",
      inStock: 3,
      minStock: 10,
      price: 79.99,
      supplier: "Smart Controls LLC",
      lastRestocked: "2023-07-20",
      location: "Main Warehouse",
      mobileUnits: []
    },
  ];
  
  // Mock data for mobile units
  const mobileUnits = [
    { id: "MU001", name: "Truck 1", technicianName: "David Martinez", status: "active" },
    { id: "MU002", name: "Truck 2", technicianName: "Lisa Wong", status: "active" },
    { id: "MU003", name: "Truck 3", technicianName: "Robert Johnson", status: "maintenance" },
    { id: "MU004", name: "Truck 4", technicianName: "Unassigned", status: "inactive" }
  ];
  
  // Filter inventory items
  const filteredItems = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Edit minimum stock level
  const handleEditMinStock = (itemId: string) => {
    // In a real app, you would open a dialog to edit the value
    // For this demo, we'll just show a toast
    if (!permissions.canEditData) {
      toast.error("Permission denied", {
        description: "You do not have permission to edit inventory settings."
      });
      return;
    }
    
    toast.success("Min stock level updated", {
      description: "The minimum stock level has been updated."
    });
  };

  // Handle transferring inventory between warehouse and mobile units
  const handleTransferInventory = (itemId: string) => {
    toast.info("Transfer inventory", {
      description: "This would open a dialog to transfer inventory between locations."
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">Manage HVAC parts and materials</p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
            <Button variant="outline">
              <RefreshCcw className="mr-2 h-4 w-4" /> Restock
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all-inventory" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all-inventory">All Inventory</TabsTrigger>
            <TabsTrigger value="warehouse">
              <Warehouse className="mr-2 h-4 w-4" /> Warehouse
            </TabsTrigger>
            <TabsTrigger value="mobile-units">
              <Truck className="mr-2 h-4 w-4" /> Mobile Units
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="mr-2 h-4 w-4" /> 
              Alerts
              {inventoryItems.filter(item => item.inStock < item.minStock).length > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  {inventoryItems.filter(item => item.inStock < item.minStock).length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-inventory" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inventoryItems.length}</div>
                  <p className="text-xs text-muted-foreground">Across {new Set(inventoryItems.map(item => item.category)).size} categories</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500">
                    {inventoryItems.filter(item => item.inStock < item.minStock).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Require immediate reordering</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${inventoryItems.reduce((acc, item) => acc + (item.inStock * item.price), 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total value at cost price</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {inventoryItems.filter(item => item.inStock === 0).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Items currently unavailable</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Search and filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search inventory..."
                  className="pl-8 w-full md:max-w-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Category <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>All Categories</DropdownMenuItem>
                    <DropdownMenuItem>Filters</DropdownMenuItem>
                    <DropdownMenuItem>Refrigerants</DropdownMenuItem>
                    <DropdownMenuItem>Motors</DropdownMenuItem>
                    <DropdownMenuItem>Electrical</DropdownMenuItem>
                    <DropdownMenuItem>Controls</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Status <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>All Items</DropdownMenuItem>
                    <DropdownMenuItem>In Stock</DropdownMenuItem>
                    <DropdownMenuItem>Low Stock</DropdownMenuItem>
                    <DropdownMenuItem>Out of Stock</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Location <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>All Locations</DropdownMenuItem>
                    <DropdownMenuItem>Main Warehouse</DropdownMenuItem>
                    {mobileUnits.map(unit => (
                      <DropdownMenuItem key={unit.id}>{unit.name}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button variant="outline">
                  <Filter className="mr-1 h-4 w-4" /> More Filters
                </Button>
              </div>
            </div>
            
            {/* Inventory table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">SKU</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">In Stock</TableHead>
                      <TableHead className="text-right">Min Stock</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">{item.inStock}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {item.minStock}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => handleEditMinStock(item.id)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span className="sr-only">Edit minimum stock level</span>
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell className="text-right">
                          {item.inStock === 0 ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : item.inStock < item.minStock ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700">
                              Low Stock
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              In Stock
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Settings className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Item</DropdownMenuItem>
                              <DropdownMenuItem>Add Stock</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTransferInventory(item.id)}>
                                Transfer Inventory
                              </DropdownMenuItem>
                              <DropdownMenuItem>View History</DropdownMenuItem>
                              <DropdownMenuItem>Delete Item</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No inventory items found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Try adjusting your search or filters, or add a new inventory item.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="warehouse" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Warehouse className="mr-2 h-5 w-5" />
                  Main Warehouse Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Warehouse Qty</TableHead>
                      <TableHead className="text-right">Mobile Units Qty</TableHead>
                      <TableHead className="text-right">Total Qty</TableHead>
                      <TableHead className="text-right">Min Stock</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryItems.map((item) => {
                      const mobileUnitQty = item.mobileUnits.reduce((acc, unit) => acc + unit.quantity, 0);
                      const totalQty = item.inStock + mobileUnitQty;
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-right">{item.inStock}</TableCell>
                          <TableCell className="text-right">{mobileUnitQty}</TableCell>
                          <TableCell className="text-right">{totalQty}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {item.minStock}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => handleEditMinStock(item.id)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                                <span className="sr-only">Edit minimum stock level</span>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleTransferInventory(item.id)}
                            >
                              Transfer
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="mobile-units" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {mobileUnits.map((unit) => (
                <Card key={unit.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <Truck className="mr-2 h-5 w-5" />
                      {unit.name}
                      {unit.status === "maintenance" && (
                        <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700">
                          Maintenance
                        </Badge>
                      )}
                      {unit.status === "inactive" && (
                        <Badge variant="outline" className="ml-2 bg-gray-100 text-gray-500">
                          Inactive
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground mb-4">
                      Technician: {unit.technicianName}
                    </p>
                    
                    <h4 className="text-sm font-medium mb-2">Inventory Items</h4>
                    <ul className="space-y-1">
                      {inventoryItems
                        .filter(item => item.mobileUnits.some(mu => mu.unitId === unit.id))
                        .map(item => {
                          const mobileUnit = item.mobileUnits.find(mu => mu.unitId === unit.id);
                          return (
                            <li key={item.id} className="text-sm flex justify-between">
                              <span>{item.name}</span>
                              <span className="font-medium">{mobileUnit?.quantity}</span>
                            </li>
                          );
                        })
                      }
                      {!inventoryItems.some(item => 
                        item.mobileUnits.some(mu => mu.unitId === unit.id)
                      ) && (
                        <li className="text-sm text-muted-foreground">No inventory items</li>
                      )}
                    </ul>
                  </CardContent>
                  <div className="px-6 py-3 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Inventory
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inventoryItems.filter(item => item.inStock < item.minStock).length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                        <TableHead className="text-right">Min Stock</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryItems
                        .filter(item => item.inStock < item.minStock)
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.sku}</TableCell>
                            <TableCell className="text-right text-red-500 font-medium">{item.inStock}</TableCell>
                            <TableCell className="text-right">{item.minStock}</TableCell>
                            <TableCell>{item.supplier}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                Order
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No alerts</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      All inventory items are above their minimum stock levels.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Inventory;

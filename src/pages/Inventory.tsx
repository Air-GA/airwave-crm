
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  AlertTriangle,
  MoveRight,
  X,
  FileText,
  ChevronRight,
  ChevronUp
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { InventoryItem } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ExtendedInventoryItem extends InventoryItem {
  sku: string;
  minStock: number;
  inStock: number;
  lastRestocked?: string;
  invoiceNumber?: string;
  mobileUnits: {
    unitId: string;
    name: string;
    quantity: number;
    invoiceNumber?: string;
  }[];
}

interface TransferItemData {
  itemId: string;
  quantity: number;
  invoiceNumber: string;
}

interface TransferFormData {
  sourceLocation: string;
  destinationLocation: string;
  items: TransferItemData[];
}

interface InvoiceGroup {
  invoiceNumber: string;
  items: {
    item: ExtendedInventoryItem;
    quantity: number;
  }[];
}

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all-inventory");
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExtendedInventoryItem | null>(null);
  const [expandedInvoices, setExpandedInvoices] = useState<Record<string, boolean>>({});
  const { permissions } = useAuth();
  
  const transferForm = useForm<TransferFormData>({
    defaultValues: {
      sourceLocation: "warehouse",
      destinationLocation: "",
      items: [{ itemId: "", quantity: 1, invoiceNumber: "" }]
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control: transferForm.control,
    name: "items"
  });

  const [inventoryItems, setInventoryItems] = useState<ExtendedInventoryItem[]>([
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
      description: "High-efficiency air filter",
      quantity: 54,
      reorderLevel: 20,
      mobileUnits: [
        { unitId: "MU001", name: "Truck 1", quantity: 5, invoiceNumber: "INV-2023-001" },
        { unitId: "MU003", name: "Truck 3", quantity: 3, invoiceNumber: "INV-2023-002" }
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
      description: "EPA-approved refrigerant",
      quantity: 12,
      reorderLevel: 15,
      mobileUnits: [
        { unitId: "MU002", name: "Truck 2", quantity: 2, invoiceNumber: "INV-2023-003" },
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
      description: "3-ton condenser fan motor",
      quantity: 8,
      reorderLevel: 5,
      mobileUnits: [
        { unitId: "MU001", name: "Truck 1", quantity: 1, invoiceNumber: "INV-2023-001" },
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
      description: "Dual run capacitor",
      quantity: 32,
      reorderLevel: 20,
      mobileUnits: [
        { unitId: "MU001", name: "Truck 1", quantity: 8, invoiceNumber: "INV-2023-001" },
        { unitId: "MU002", name: "Truck 2", quantity: 5, invoiceNumber: "INV-2023-003" },
        { unitId: "MU003", name: "Truck 3", quantity: 7, invoiceNumber: "INV-2023-002" }
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
      description: "Programmable digital thermostat",
      quantity: 3,
      reorderLevel: 10,
      mobileUnits: []
    },
  ]);

  const mobileUnits = [
    { id: "MU001", name: "Truck 1", technicianName: "David Martinez", status: "active" },
    { id: "MU002", name: "Truck 2", technicianName: "Lisa Wong", status: "active" },
    { id: "MU003", name: "Truck 3", technicianName: "Robert Johnson", status: "maintenance" },
    { id: "MU004", name: "Truck 4", technicianName: "Unassigned", status: "inactive" }
  ];

  const filteredItems = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditMinStock = (itemId: string) => {
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

  const openTransferDialog = (item: ExtendedInventoryItem | null = null) => {
    setSelectedItem(item);
    
    transferForm.reset({
      sourceLocation: "warehouse",
      destinationLocation: "",
      items: [{ 
        itemId: item ? item.id : "",
        quantity: 1,
        invoiceNumber: "" 
      }]
    });
    
    setIsTransferDialogOpen(true);
  };

  const addItemToTransfer = () => {
    append({ itemId: "", quantity: 1, invoiceNumber: "" });
  };

  const toggleInvoiceExpand = (invoiceNumber: string) => {
    setExpandedInvoices(prev => ({
      ...prev,
      [invoiceNumber]: !prev[invoiceNumber]
    }));
  };

  const handleTransferInventory = async (data: TransferFormData) => {
    if (data.sourceLocation === data.destinationLocation) {
      toast.error("Invalid transfer", {
        description: "Source and destination cannot be the same"
      });
      return;
    }

    if (data.items.some(item => !item.itemId)) {
      toast.error("Invalid items", {
        description: "All items must be selected"
      });
      return;
    }

    if (data.items.some(item => item.quantity <= 0)) {
      toast.error("Invalid quantity", {
        description: "All quantities must be greater than zero"
      });
      return;
    }

    try {
      const itemsToTransfer = data.items.map(item => {
        const inventoryItem = inventoryItems.find(invItem => invItem.id === item.itemId);
        if (!inventoryItem) {
          throw new Error(`Item ${item.itemId} not found`);
        }
        
        let sourceQty = 0;
        
        if (data.sourceLocation === "warehouse") {
          sourceQty = inventoryItem.inStock;
        } else {
          const mobileUnit = inventoryItem.mobileUnits.find(unit => unit.unitId === data.sourceLocation);
          sourceQty = mobileUnit?.quantity || 0;
        }
        
        if (sourceQty < item.quantity) {
          throw new Error(`Only ${sourceQty} units of ${inventoryItem.name} available at source location`);
        }
        
        return {
          item: inventoryItem,
          quantity: item.quantity,
          invoiceNumber: item.invoiceNumber
        };
      });
      
      setInventoryItems(currentItems => {
        return currentItems.map(item => {
          const transferItem = itemsToTransfer.find(t => t.item.id === item.id);
          if (!transferItem) return item;
          
          let updatedItem = { ...item };
          const quantity = transferItem.quantity;
          const invoiceNumber = transferItem.invoiceNumber;
          
          if (data.sourceLocation === "warehouse") {
            updatedItem.inStock -= quantity;
          } else {
            updatedItem.mobileUnits = updatedItem.mobileUnits.map(unit => {
              if (unit.unitId === data.sourceLocation) {
                return { ...unit, quantity: unit.quantity - quantity };
              }
              return unit;
            });
          }
          
          if (data.destinationLocation === "warehouse") {
            updatedItem.inStock += quantity;
          } else {
            const existingUnitIndex = updatedItem.mobileUnits.findIndex(
              unit => unit.unitId === data.destinationLocation && unit.invoiceNumber === invoiceNumber
            );
            
            if (existingUnitIndex >= 0) {
              updatedItem.mobileUnits[existingUnitIndex].quantity += quantity;
            } else {
              const targetUnit = mobileUnits.find(unit => unit.id === data.destinationLocation);
              if (targetUnit) {
                updatedItem.mobileUnits.push({
                  unitId: targetUnit.id,
                  name: targetUnit.name,
                  quantity: quantity,
                  invoiceNumber: invoiceNumber
                });
              }
            }
          }
          
          return updatedItem;
        });
      });
      
      const itemNames = itemsToTransfer.map(t => t.item.name).join(", ");
      toast.success("Inventory transferred", {
        description: `Successfully transferred ${itemNames}`
      });
      
      setIsTransferDialogOpen(false);
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error("Transfer failed", {
        description: error instanceof Error ? error.message : "There was an error transferring inventory"
      });
    }
  };

  // Group inventory items by mobile unit and invoice number
  const getInvoiceGroupsByMobileUnit = (unitId: string) => {
    const itemsByInvoice: Record<string, InvoiceGroup> = {};
    
    inventoryItems.forEach(item => {
      item.mobileUnits.forEach(unit => {
        if (unit.unitId === unitId && unit.invoiceNumber) {
          const invoiceNumber = unit.invoiceNumber;
          
          if (!itemsByInvoice[invoiceNumber]) {
            itemsByInvoice[invoiceNumber] = {
              invoiceNumber,
              items: []
            };
          }
          
          itemsByInvoice[invoiceNumber].items.push({
            item,
            quantity: unit.quantity
          });
        }
      });
    });
    
    return Object.values(itemsByInvoice);
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
            <TabsTrigger value="transfers">
              <MoveRight className="mr-2 h-4 w-4" /> Transfers
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
                              <DropdownMenuItem onClick={() => openTransferDialog(item)}>
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
                              onClick={() => openTransferDialog(item)}
                            >
                              Transfer
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="mobile-units" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {mobileUnits.map((unit) => {
                const invoiceGroups = getInvoiceGroupsByMobileUnit(unit.id);
                
                return (
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
                      
                      <h4 className="text-sm font-medium mb-2">Inventory Items by Invoice</h4>
                      
                      {invoiceGroups.length > 0 ? (
                        <div className="space-y-3">
                          {invoiceGroups.map((group) => (
                            <Collapsible 
                              key={group.invoiceNumber}
                              open={expandedInvoices[group.invoiceNumber]}
                              onOpenChange={() => toggleInvoiceExpand(group.invoiceNumber)}
                              className="border rounded-md"
                            >
                              <CollapsibleTrigger className="flex w-full items-center justify-between p-2 hover:bg-muted/50">
                                <div className="flex items-center">
                                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span className="font-medium">{group.invoiceNumber}</span>
                                </div>
                                <div className="flex items-center">
                                  <Badge variant="outline">
                                    {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                                  </Badge>
                                  {expandedInvoices[group.invoiceNumber] ? (
                                    <ChevronUp className="h-4 w-4 ml-2" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                  )}
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="border-t px-2 py-1">
                                <ul className="space-y-1">
                                  {group.items.map((entry, idx) => (
                                    <li key={`${entry.item.id}-${idx}`} className="text-sm flex justify-between py-1">
                                      <span>{entry.item.name}</span>
                                      <span className="font-medium">{entry.quantity}</span>
                                    </li>
                                  ))}
                                </ul>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No inventory items</p>
                      )}
                    </CardContent>
                    <div className="px-6 py-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          if (inventoryItems.length > 0) {
                            const item = inventoryItems[0];
                            setSelectedItem(item);
                            transferForm.reset({
                              sourceLocation: "warehouse",
                              destinationLocation: unit.id,
                              items: [{ itemId: item.id, quantity: 1, invoiceNumber: "" }]
                            });
                            setIsTransferDialogOpen(true);
                          }
                        }}
                      >
                        Add Inventory
                      </Button>
                    </div>
                  </Card>
                );
              })}
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
          
          <TabsContent value="transfers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MoveRight className="mr-2 h-5 w-5" />
                  Recent Transfers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <MoveRight className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No recent transfers</h3>
                  <p className="mt-2 text-sm text-muted-foreground text-center">
                    Transfer inventory between the warehouse and mobile units to see history here.
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => openTransferDialog()}
                  >
                    <MoveRight className="mr-2 h-4 w-4" />
                    Start a Transfer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Transfer Inventory</DialogTitle>
            <DialogDescription>
              Move multiple inventory items between the warehouse and mobile units.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...transferForm}>
            <form onSubmit={transferForm.handleSubmit(handleTransferInventory)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={transferForm.control}
                  name="sourceLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="warehouse">Main Warehouse</SelectItem>
                          {mobileUnits.map(unit => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={transferForm.control}
                  name="destinationLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="warehouse">Main Warehouse</SelectItem>
                          {mobileUnits.map(unit => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-4 gap-4 items-end">
                    <FormField
                      control={transferForm.control}
                      name={`items.${index}.itemId`}
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel>Item</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select item" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {inventoryItems.map(item => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={transferForm.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              onChange={e => field.onChange(Number(e.target.value))}
                              value={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={transferForm.control}
                      name={`items.${index}.invoiceNumber`}
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel>Invoice #</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="INV-123"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-10 w-10"
                      disabled={fields.length === 1}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItemToTransfer}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Item
                </Button>
              </div>

              <DialogFooter className="mt-6">
                <Button type="submit">Transfer Inventory</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Inventory;

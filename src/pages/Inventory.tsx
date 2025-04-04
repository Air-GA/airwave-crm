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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  ChevronUp,
  Calendar,
  User,
  Trash2,
  Phone
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { InventoryItem, InventoryTransfer } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

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

interface RemovalDialogData {
  isOpen: boolean;
  unitId: string;
  itemId: string;
  itemName: string;
  currentQuantity: number;
  invoiceNumber?: string;
}

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all-inventory");
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExtendedInventoryItem | null>(null);
  const [expandedInvoices, setExpandedInvoices] = useState<Record<string, boolean>>({});
  const [removalDialog, setRemovalDialog] = useState<RemovalDialogData>({
    isOpen: false,
    unitId: "",
    itemId: "",
    itemName: "",
    currentQuantity: 0,
    invoiceNumber: ""
  });
  const [removalQuantity, setRemovalQuantity] = useState<number>(1);
  const [transferHistory, setTransferHistory] = useState<InventoryTransfer[]>([
    {
      id: "TR001",
      date: "2024-03-01T10:30:00Z",
      sourceLocation: "warehouse",
      destinationLocation: "MU001",
      items: [
        { itemId: "INV001", itemName: "Air Filter - MERV 13", quantity: 5, invoiceNumber: "INV-2023-001" },
        { itemId: "INV004", itemName: "Capacitor 45/5 MFD", quantity: 8, invoiceNumber: "INV-2023-001" }
      ],
      createdBy: "Admin User"
    },
    {
      id: "TR002",
      date: "2024-03-02T09:15:00Z",
      sourceLocation: "warehouse",
      destinationLocation: "MU003",
      items: [
        { itemId: "INV001", itemName: "Air Filter - MERV 13", quantity: 3, invoiceNumber: "INV-2023-002" },
        { itemId: "INV004", itemName: "Capacitor 45/5 MFD", quantity: 7, invoiceNumber: "INV-2023-002" }
      ],
      createdBy: "Admin User"
    },
    {
      id: "TR003",
      date: "2024-03-03T14:45:00Z",
      sourceLocation: "warehouse",
      destinationLocation: "MU002",
      items: [
        { itemId: "INV002", itemName: "Refrigerant R-410A (10lb)", quantity: 2, invoiceNumber: "INV-2023-003" },
        { itemId: "INV004", itemName: "Capacitor 45/5 MFD", quantity: 5, invoiceNumber: "INV-2023-003" }
      ],
      createdBy: "Admin User"
    }
  ]);
  
  const { permissions } = useAuth();
  const isMobile = useIsMobile();
  
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

  const openRemovalDialog = (unitId: string, itemId: string, invoiceNumber?: string) => {
    if (!permissions.canEditData) {
      toast.error("Permission denied", {
        description: "You do not have permission to remove inventory items."
      });
      return;
    }

    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return;
    
    const unitItem = item.mobileUnits.find(
      unit => unit.unitId === unitId && (!invoiceNumber || unit.invoiceNumber === invoiceNumber)
    );
    if (!unitItem) return;

    setRemovalDialog({
      isOpen: true,
      unitId,
      itemId,
      itemName: item.name,
      currentQuantity: unitItem.quantity,
      invoiceNumber
    });

    setRemovalQuantity(unitItem.quantity > 1 ? 1 : unitItem.quantity);
  };

  const handleRemoveItems = () => {
    const { unitId, itemId, invoiceNumber, currentQuantity } = removalDialog;
    const removeAll = removalQuantity >= currentQuantity;

    try {
      setInventoryItems(currentItems => {
        return currentItems.map(item => {
          if (item.id === itemId) {
            if (removeAll) {
              const updatedMobileUnits = item.mobileUnits.filter(
                unit => !(unit.unitId === unitId && (!invoiceNumber || unit.invoiceNumber === invoiceNumber))
              );
              return {
                ...item,
                mobileUnits: updatedMobileUnits
              };
            } else {
              const updatedMobileUnits = item.mobileUnits.map(unit => {
                if (unit.unitId === unitId && (!invoiceNumber || unit.invoiceNumber === invoiceNumber)) {
                  return {
                    ...unit,
                    quantity: unit.quantity - removalQuantity
                  };
                }
                return unit;
              });
              return {
                ...item,
                mobileUnits: updatedMobileUnits
              };
            }
          }
          return item;
        });
      });

      const unit = mobileUnits.find(u => u.id === unitId);
      const item = inventoryItems.find(i => i.id === itemId);
      
      toast.success("Item removed", {
        description: removeAll
          ? `${item?.name} has been completely removed from ${unit?.name}.`
          : `${removalQuantity} ${item?.name}(s) removed from ${unit?.name}.`
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item", {
        description: "There was an error removing the inventory item."
      });
    } finally {
      closeRemovalDialog();
    }
  };

  const closeRemovalDialog = () => {
    setRemovalDialog(prev => ({
      ...prev,
      isOpen: false
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
      
      const newTransfer: InventoryTransfer = {
        id: `TR${String(transferHistory.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString(),
        sourceLocation: data.sourceLocation,
        destinationLocation: data.destinationLocation,
        items: data.items.map(item => {
          const inventoryItem = inventoryItems.find(i => i.id === item.itemId);
          return {
            itemId: item.itemId,
            itemName: inventoryItem?.name || "Unknown Item",
            quantity: item.quantity,
            invoiceNumber: item.invoiceNumber
          };
        }),
        createdBy: "Admin User"
      };
      
      setTransferHistory(prev => [newTransfer, ...prev]);
      
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

  const getLocationName = (locationId: string) => {
    if (locationId === "warehouse") return "Main Warehouse";
    const unit = mobileUnits.find(u => u.id === locationId);
    return unit ? unit.name : locationId;
  };

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
                          <TableCell className="text-right">{item.minStock}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openTransferDialog(item)}
                            >
                              <MoveRight className="h-4 w-4" />
                              <span className="sr-only">Transfer</span>
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
            {mobileUnits.map(unit => (
              <Card key={unit.id} className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2 h-5 w-5" />
                    {unit.name} - {unit.technicianName}
                    <Badge 
                      variant={unit.status === "active" ? "default" : 
                              unit.status === "maintenance" ? "outline" : "secondary"}
                      className="ml-2"
                    >
                      {unit.status === "active" ? "Active" : 
                      unit.status === "maintenance" ? "In Maintenance" : "Inactive"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getInvoiceGroupsByMobileUnit(unit.id).length > 0 ? (
                    <div className="space-y-4">
                      {getInvoiceGroupsByMobileUnit(unit.id).map(group => (
                        <Collapsible 
                          key={group.invoiceNumber}
                          open={expandedInvoices[group.invoiceNumber]}
                          onOpenChange={() => toggleInvoiceExpand(group.invoiceNumber)}
                          className="border rounded-md p-2"
                        >
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted rounded-md">
                              <div className="flex items-center">
                                <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                                <div>
                                  <h4 className="text-sm font-medium">Invoice: {group.invoiceNumber}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {group.items.length} items
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon">
                                {expandedInvoices[group.invoiceNumber] ? 
                                  <ChevronUp className="h-4 w-4" /> : 
                                  <ChevronDown className="h-4 w-4" />
                                }
                              </Button>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Item</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead className="text-right">Quantity</TableHead>
                                  <TableHead className="w-[80px]">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {group.items.map(({ item, quantity }) => (
                                  <TableRow key={`${group.invoiceNumber}-${item.id}`}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell className="text-right">{quantity}</TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => openRemovalDialog(unit.id, item.id, group.invoiceNumber)}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="sr-only">Remove</span>
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Package className="h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-base font-medium">No inventory items</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        This mobile unit doesn't have any inventory items.
                      </p>
                      <Button className="mt-4" onClick={() => openTransferDialog()}>
                        <MoveRight className="mr-2 h-4 w-4" /> Transfer Items to this Unit
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                  Inventory Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inventoryItems.filter(item => item.inStock < item.minStock).length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">In Stock</TableHead>
                        <TableHead className="text-right">Min Stock</TableHead>
                        <TableHead className="text-right">Need to Order</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryItems
                        .filter(item => item.inStock < item.minStock)
                        .map(item => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell className="text-right text-destructive font-medium">
                              {item.inStock}
                            </TableCell>
                            <TableCell className="text-right">{item.minStock}</TableCell>
                            <TableCell className="text-right font-medium">
                              {item.minStock - item.inStock}
                            </TableCell>
                            <TableCell>{item.supplier}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm">
                                <Phone className="mr-2 h-4 w-4" /> Order
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-12 w-12 text-green-500" />
                    <h3 className="mt-4 text-lg font-medium">No alerts</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      All inventory items are at or above minimum stock levels.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transfers" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <CardTitle className="flex items-center">
                  <MoveRight className="mr-2 h-5 w-5" />
                  Inventory Transfer History
                </CardTitle>
                <Button onClick={() => openTransferDialog()}>
                  <Plus className="mr-2 h-4 w-4" /> New Transfer
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transferHistory.map(transfer => (
                    <Collapsible 
                      key={transfer.id}
                      className="border rounded-md"
                    >
                      <CollapsibleTrigger asChild>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-muted">
                          <div>
                            <div className="flex items-center">
                              <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <MoveRight className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {getLocationName(transfer.sourceLocation)} → {getLocationName(transfer.destinationLocation)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {transfer.items.length} items
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center mt-2 sm:mt-0">
                            <div className="text-xs text-muted-foreground mr-4">
                              <Calendar className="inline-block mr-1 h-3 w-3" />
                              {format(new Date(transfer.date), "MMM d, yyyy")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <User className="inline-block mr-1 h-3 w-3" />
                              {transfer.createdBy}
                            </div>
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead>Invoice</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {transfer.items.map((item, idx) => (
                                <TableRow key={`${transfer.id}-${idx}`}>
                                  <TableCell>{item.itemName}</TableCell>
                                  <TableCell className="text-right">{item.quantity}</TableCell>
                                  <TableCell>{item.invoiceNumber || "N/A"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Inventory</DialogTitle>
            <DialogDescription>
              Move items between warehouse and mobile units
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
                      <FormLabel>Source</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
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
                      <FormLabel>Destination</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination" />
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
              
              <div>
                <h4 className="text-sm font-medium mb-3">Items to Transfer</h4>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start space-x-2">
                      <div className="grid grid-cols-5 gap-2 flex-1">
                        <div className="col-span-2">
                          <FormField
                            control={transferForm.control}
                            name={`items.${index}.itemId`}
                            render={({ field }) => (
                              <FormItem>
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
                        </div>
                        
                        <div className="col-span-1">
                          <FormField
                            control={transferForm.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1"
                                    {...field}
                                    onChange={e => field.onChange(Number(e.target.value))} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <FormField
                            control={transferForm.control}
                            name={`items.${index}.invoiceNumber`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    placeholder="Invoice #" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={addItemToTransfer}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>
              
              <DialogFooter>
                <Button type="submit">Transfer Items</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={removalDialog.isOpen} onOpenChange={closeRemovalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Inventory Item</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to remove {removalDialog.itemName} from {
                mobileUnits.find(u => u.id === removalDialog.unitId)?.name || "the mobile unit"
              }.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <h4 className="text-sm font-medium mb-2">Quantity to remove:</h4>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min="1"
                max={removalDialog.currentQuantity}
                value={removalQuantity}
                onChange={(e) => setRemovalQuantity(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">
                of {removalDialog.currentQuantity} available
              </span>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveItems}>
              Remove Items
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Inventory;

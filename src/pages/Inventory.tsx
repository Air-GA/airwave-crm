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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfitRhinoSearch } from "@/components/inventory/ProfitRhinoSearch";

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

// Add Item form schema
const inventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  inStock: z.number().min(0, "Quantity can't be negative"),
  minStock: z.number().min(0, "Minimum stock can't be negative"),
  price: z.number().min(0, "Price can't be negative"),
  supplier: z.string().optional(),
  description: z.string().optional(),
  location: z.string().default("Main Warehouse"),
});

// Edit item schema
const editItemSchema = inventoryItemSchema.partial();

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
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ExtendedInventoryItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ExtendedInventoryItem | null>(null);
  
  // Add Item form
  const addItemForm = useForm<z.infer<typeof inventoryItemSchema>>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      inStock: 0,
      minStock: 0,
      price: 0,
      supplier: "",
      description: "",
      location: "Main Warehouse",
    }
  });

  // Edit Item form
  const editItemForm = useForm<z.infer<typeof editItemSchema>>({
    resolver: zodResolver(editItemSchema),
  });
  
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
  
  const { permissions, userRole } = useAuth();
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

  // Edit min stock level
  const handleEditMinStock = (itemId: string, newValue?: number) => {
    if (!permissions.canEditData) {
      toast.error("Permission denied", {
        description: "You do not have permission to edit inventory settings."
      });
      return;
    }
    
    if (newValue !== undefined) {
      setInventoryItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, minStock: newValue } : item
        )
      );
    }
    
    toast.success("Min stock level updated", {
      description: "The minimum stock level has been updated."
    });
  };

  // Add new inventory item
  const handleAddItem = (data: z.infer<typeof inventoryItemSchema>) => {
    if (!permissions.canEditData) {
      toast.error("Permission denied", {
        description: "You do not have permission to add inventory items."
      });
      return;
    }

    const newItem: ExtendedInventoryItem = {
      id: `INV${String(inventoryItems.length + 1).padStart(3, '0')}`,
      name: data.name,
      sku: data.sku,
      category: data.category,
      inStock: data.inStock,
      minStock: data.minStock,
      price: data.price,
      supplier: data.supplier || "",
      description: data.description || "",
      location: data.location,
      quantity: data.inStock,
      reorderLevel: data.minStock,
      mobileUnits: []
    };

    setInventoryItems(prev => [...prev, newItem]);
    setIsAddItemDialogOpen(false);
    addItemForm.reset();

    toast.success("Item added", {
      description: `${data.name} has been added to inventory.`
    });
  };

  // Open edit item dialog
  const handleOpenEditDialog = (item: ExtendedInventoryItem) => {
    if (!permissions.canEditData) {
      toast.error("Permission denied", {
        description: "You do not have permission to edit inventory items."
      });
      return;
    }

    setItemToEdit(item);
    editItemForm.reset({
      name: item.name,
      sku: item.sku,
      category: item.category,
      inStock: item.inStock,
      minStock: item.minStock,
      price: item.price,
      supplier: item.supplier,
      description: item.description,
      location: item.location
    });
    setIsEditItemDialogOpen(true);
  };

  // Save edited item
  const handleSaveEditedItem = (data: z.infer<typeof editItemSchema>) => {
    if (!itemToEdit) return;

    setInventoryItems(prev => 
      prev.map(item => 
        item.id === itemToEdit.id 
          ? { 
              ...item, 
              ...data,
              quantity: data.inStock !== undefined ? data.inStock : item.quantity,
              reorderLevel: data.minStock !== undefined ? data.minStock : item.reorderLevel
            } 
          : item
      )
    );

    setIsEditItemDialogOpen(false);
    toast.success("Item updated", {
      description: `${itemToEdit.name} has been updated.`
    });
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (item: ExtendedInventoryItem) => {
    if (!permissions.canEditData) {
      toast.error("Permission denied", {
        description: "You do not have permission to delete inventory items."
      });
      return;
    }

    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  // Delete inventory item
  const handleDeleteItem = () => {
    if (!itemToDelete) return;

    setInventoryItems(prev => prev.filter(item => item.id !== itemToDelete.id));
    setIsDeleteDialogOpen(false);

    toast.success("Item deleted", {
      description: `${itemToDelete.name} has been removed from inventory.`
    });
  };

  // Add stock to an item
  const handleAddStock = (item: ExtendedInventoryItem) => {
    if (!permissions.canEditData) {
      toast.error("Permission denied", {
        description: "You do not have permission to modify inventory levels."
      });
      return;
    }

    // This would typically open a dialog to add stock
    // For simplicity, we'll just add 5 units
    const additionalStock = 5;
    
    setInventoryItems(prev => 
      prev.map(i => 
        i.id === item.id 
          ? { 
              ...i, 
              inStock: i.inStock + additionalStock,
              quantity: i.quantity + additionalStock,
              lastRestocked: new Date().toISOString()
            } 
          : i
      )
    );

    toast.success("Stock added", {
      description: `Added ${additionalStock} units of ${item.name} to inventory.`
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

  // View item details or history
  const handleViewItemHistory = (item: ExtendedInventoryItem) => {
    toast.info("Viewing item history", {
      description: `Viewing transaction history for ${item.name}.`
    });
    // This would typically open a detailed view or navigate to a history page
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
            <Button onClick={() => setIsAddItemDialogOpen(true)}>
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
            <TabsTrigger value="profit-rhino">
              <Package className="mr-2 h-4 w-4" /> Parts Catalog
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
                    <DropdownMenuItem

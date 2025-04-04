import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createWorkOrder } from "@/services/workOrderService";
import { WorkOrder } from "@/types";

const workOrderSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  address: z.string().min(5, "Valid address is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  type: z.string().min(1, "Service type is required"),
  priority: z.string().min(1, "Priority is required"),
  scheduledDate: z.date({
    required_error: "Scheduled date is required",
  }),
  preferredTime: z.string().optional(),
  description: z.string().min(10, "Description is required"),
  technicianId: z.string().optional(),
  notes: z.string().optional(),
});

type WorkOrderFormValues = z.infer<typeof workOrderSchema>;

const defaultValues: Partial<WorkOrderFormValues> = {
  type: "maintenance",
  priority: "medium",
  scheduledDate: new Date(),
  preferredTime: "morning",
  notes: "",
};

// Function to extract query parameters
function useQueryParams() {
  return new URLSearchParams(useLocation().search);
}

const CreateWorkOrder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const query = useQueryParams();
  const [parts, setParts] = useState<{ id: string; name: string; quantity: number; price: number }[]>([]);
  const [partName, setPartName] = useState("");
  const [partQuantity, setPartQuantity] = useState(1);
  const [partPrice, setPartPrice] = useState(0);
  
  const customerId = query.get("customerId");
  const customerName = query.get("customerName");
  const customerPhone = query.get("customerPhone");
  const customerEmail = query.get("customerEmail");
  const customerAddress = query.get("customerAddress");
  
  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      ...defaultValues,
      customerName: customerName || defaultValues.customerName || "",
      phoneNumber: customerPhone || "",
      email: customerEmail || "",
      address: customerAddress || "",
    },
  });
  
  useEffect(() => {
    if (customerName) {
      form.setValue("customerName", customerName);
    }
    if (customerPhone) {
      form.setValue("phoneNumber", customerPhone);
    }
    if (customerEmail) {
      form.setValue("email", customerEmail);
    }
    if (customerAddress) {
      form.setValue("address", customerAddress);
    }
  }, [customerId, customerName, customerPhone, customerEmail, customerAddress, form]);
  
  const onSubmit = (data: WorkOrderFormValues) => {
    const formattedParts = parts.map(part => ({
      id: part.id,
      name: part.name,
      quantity: part.quantity,
      cost: part.price
    }));
    
    // Ensure type is correctly cast to a valid WorkOrder type
    const workOrderType = data.type as WorkOrder["type"];
    const workOrderPriority = data.priority as WorkOrder["priority"];
    
    createWorkOrder({
      status: "pending",
      customerId: customerId || undefined,
      customerName: data.customerName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
      type: workOrderType,
      description: data.description,
      priority: workOrderPriority,
      scheduledDate: data.scheduledDate.toISOString(),
      createdAt: new Date().toISOString(),
      partsUsed: formattedParts.length > 0 ? formattedParts : undefined,
    })
    .then((newWorkOrder) => {
      toast({
        title: "Work Order Created",
        description: `Work order #${newWorkOrder.id} has been created successfully.`,
      });
      
      navigate("/work-orders");
    })
    .catch((error) => {
      console.error("Error creating work order:", error);
      toast({
        title: "Error",
        description: "Failed to create work order. Please try again.",
        variant: "destructive",
      });
    });
  };
  
  const addPart = () => {
    if (partName.trim() === "") return;
    
    setParts([
      ...parts,
      {
        id: `part-${Date.now()}`,
        name: partName,
        quantity: partQuantity,
        price: partPrice,
      },
    ]);
    
    setPartName("");
    setPartQuantity(1);
    setPartPrice(0);
  };
  
  const removePart = (partId: string) => {
    setParts(parts.filter((part) => part.id !== partId));
  };
  
  const calculateTotal = () => {
    return parts.reduce((sum, part) => sum + (part.price * part.quantity), 0).toFixed(2);
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Create Work Order</h1>
          <Button onClick={() => navigate("/work-orders")} variant="outline">
            Cancel
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Customer Details</TabsTrigger>
                <TabsTrigger value="service">Service Details</TabsTrigger>
                <TabsTrigger value="parts">Parts & Costs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                    <CardDescription>
                      {customerId 
                        ? "Customer information has been pre-filled. You can make changes if needed." 
                        : "Enter the customer's contact information for this work order"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="customer@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Full service address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="service" className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Information</CardTitle>
                    <CardDescription>
                      Provide details about the service needed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select service type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="installation">Installation</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="repair">Repair</SelectItem>
                                <SelectItem value="inspection">Inspection</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Scheduled Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="preferredTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Time</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select preferred time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                                <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                                <SelectItem value="anytime">Anytime</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the service needed, including any specific issues or requirements"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="technicianId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign Technician (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a technician" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              <SelectItem value="tech1">Mike Johnson</SelectItem>
                              <SelectItem value="tech2">David Chen</SelectItem>
                              <SelectItem value="tech3">Sarah Williams</SelectItem>
                              <SelectItem value="tech4">Robert Thomas</SelectItem>
                              <SelectItem value="tech5">Emily Davis</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="parts" className="space-y-4 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Parts & Materials</CardTitle>
                    <CardDescription>
                      Add parts and materials needed for this job
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row">
                      <div className="flex-1">
                        <label className="text-sm font-medium">Part Name</label>
                        <Input
                          value={partName}
                          onChange={(e) => setPartName(e.target.value)}
                          placeholder="Part name"
                        />
                      </div>
                      <div className="w-24">
                        <label className="text-sm font-medium">Quantity</label>
                        <Input
                          type="number"
                          min="1"
                          value={partQuantity}
                          onChange={(e) => setPartQuantity(parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="w-32">
                        <label className="text-sm font-medium">Price ($)</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={partPrice}
                          onChange={(e) => setPartPrice(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button type="button" onClick={addPart}>
                          <Plus className="h-4 w-4 mr-2" /> Add
                        </Button>
                      </div>
                    </div>
                    
                    <div className="rounded-md border">
                      <div className="grid grid-cols-12 gap-2 border-b p-3 font-medium">
                        <div className="col-span-6">Part</div>
                        <div className="col-span-2">Quantity</div>
                        <div className="col-span-2">Price</div>
                        <div className="col-span-2">Total</div>
                      </div>
                      
                      {parts.length > 0 ? (
                        <div className="divide-y">
                          {parts.map((part) => (
                            <div key={part.id} className="grid grid-cols-12 gap-2 p-3 items-center">
                              <div className="col-span-6">{part.name}</div>
                              <div className="col-span-2">{part.quantity}</div>
                              <div className="col-span-2">${part.price.toFixed(2)}</div>
                              <div className="col-span-1">${(part.price * part.quantity).toFixed(2)}</div>
                              <div className="col-span-1 flex justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removePart(part.id)}
                                >
                                  <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-muted-foreground">
                          No parts added yet. Add parts and materials needed for this job.
                        </div>
                      )}
                      
                      {parts.length > 0 && (
                        <div className="border-t bg-muted/40 p-3">
                          <div className="flex justify-end font-medium">
                            Total: ${calculateTotal()}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional notes about parts, warranty, etc."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate("/work-orders")}>
                Cancel
              </Button>
              <Button type="submit">Create Work Order</Button>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
};

export default CreateWorkOrder;

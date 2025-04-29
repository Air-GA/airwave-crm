// Add useEffect to imports
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/types";

const CreateWorkOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Extract customer details from query parameters
  const queryParams = new URLSearchParams(location.search);
  const customerId = queryParams.get('customerId') || '';
  const customerName = queryParams.get('customerName') || '';
  const customerPhone = queryParams.get('customerPhone') || '';
  const customerEmail = queryParams.get('customerEmail') || '';
  const customerAddress = queryParams.get('customerAddress') || '';

  const [type, setType] = useState("repair");
  const [priority, setPriority] = useState("medium");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState("");

  useEffect(() => {
    // You can perform any additional setup here, like fetching customer details if needed
    console.log("Customer ID from query params:", customerId);
  }, [customerId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form inputs
    if (!scheduledDate) {
      toast({
        title: "Error",
        description: "Please select a scheduled date.",
        variant: "destructive",
      });
      return;
    }

    // Create work order object
    const workOrder = {
      customerId: customerId,
      customerName: customerName,
      customerPhone: customerPhone,
      customerEmail: customerEmail,
      customerAddress: customerAddress,
      type: type,
      priority: priority,
      scheduledDate: scheduledDate.toISOString(),
      description: description,
    };

    // Log the work order details
    console.log("Work Order Details:", workOrder);

    // Show success message
    toast({
      title: "Success",
      description: "Work order created successfully!",
    });

    // Redirect to work orders list
    navigate("/work-orders");
  };

  return (
    <MainLayout pageName="Create Work Order">
      <div className="flex justify-center">
        <Card className="w-[800px]">
          <CardHeader>
            <CardTitle>Create Work Order</CardTitle>
            <CardDescription>
              Fill out the form below to create a new work order.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  type="text"
                  id="customerName"
                  value={customerName}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  type="text"
                  id="customerPhone"
                  value={customerPhone}
                  disabled
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  type="email"
                  id="customerEmail"
                  value={customerEmail}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="customerAddress">Customer Address</Label>
                <Input
                  type="text"
                  id="customerAddress"
                  value={customerAddress}
                  disabled
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="installation">Installation</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Scheduled Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button onClick={handleSubmit}>Create Work Order</Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateWorkOrder;

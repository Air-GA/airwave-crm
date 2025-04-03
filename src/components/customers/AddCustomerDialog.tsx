
import { useState } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserRound, Plus, Trash2 } from "lucide-react";

const serviceAddressSchema = z.object({
  id: z.string(),
  address: z.string().min(1, { message: "Address is required" }),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional(),
});

const customerFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  serviceAddresses: z.array(serviceAddressSchema).min(1, { message: "At least one service address is required" }),
  billAddress: z.string().min(1, { message: "Billing address is required" })
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded: (customer: any) => void;
}

export function AddCustomerDialog({ open, onOpenChange, onCustomerAdded }: AddCustomerDialogProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      serviceAddresses: [
        { id: uuidv4(), address: "", isPrimary: true, notes: "" }
      ],
      billAddress: ""
    }
  });

  // Use the useFieldArray hook directly, not as a method on form
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "serviceAddresses",
  });

  const addServiceAddress = () => {
    append({ 
      id: uuidv4(), 
      address: "", 
      isPrimary: fields.length === 0, // First address is primary by default
      notes: "" 
    });
  };

  const removeServiceAddress = (index: number) => {
    // Don't allow removing if there's only one address
    if (fields.length === 1) {
      toast.error("At least one service address is required");
      return;
    }

    // If removing the primary address, make the first remaining address primary
    const isPrimary = form.getValues(`serviceAddresses.${index}.isPrimary`);
    remove(index);

    if (isPrimary && fields.length > 1) {
      const values = form.getValues();
      const newPrimaryIndex = index === 0 ? 0 : 0; // Make first address primary
      values.serviceAddresses[newPrimaryIndex].isPrimary = true;
      form.reset(values);
    }
  };

  // Handle primary address selection
  const setPrimaryAddress = (index: number) => {
    const values = form.getValues();
    values.serviceAddresses.forEach((_, i) => {
      values.serviceAddresses[i].isPrimary = (i === index);
    });
    form.reset(values);
  };

  function onSubmit(data: CustomerFormValues) {
    // Make sure one address is marked as primary
    const primaryAddress = data.serviceAddresses.find(addr => addr.isPrimary);
    if (!primaryAddress) {
      data.serviceAddresses[0].isPrimary = true;
    }

    // Create a new customer with random ID if not specified
    const newCustomer = {
      id: uuidv4(),
      ...data,
      serviceAddress: data.serviceAddresses.find(addr => addr.isPrimary)?.address || data.serviceAddresses[0].address, // For backward compatibility
      type: "residential", // Always set type as residential
      createdAt: new Date().toISOString()
    };
    
    onCustomerAdded(newCustomer);
    onOpenChange(false);
    form.reset({
      name: "",
      email: "",
      phone: "",
      serviceAddresses: [{ id: uuidv4(), address: "", isPrimary: true, notes: "" }],
      billAddress: ""
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Enter the details for the new customer. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <UserRound className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium">Customer Information</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Customer name" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Service Addresses</h3>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addServiceAddress}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> 
                  Add Address
                </Button>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-md p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      Address {index + 1} 
                      {form.getValues(`serviceAddresses.${index}.isPrimary`) && 
                        <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                          Primary
                        </span>
                      }
                    </h4>
                    <div className="flex gap-2">
                      {!form.getValues(`serviceAddresses.${index}.isPrimary`) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimaryAddress(index)}
                          className="text-xs h-8"
                        >
                          Set as Primary
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeServiceAddress(index)}
                        className="text-red-500 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`serviceAddresses.${index}.address`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Service address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`serviceAddresses.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any notes about this property" 
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
            
            <FormField
              control={form.control}
              name="billAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Billing address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Customer</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

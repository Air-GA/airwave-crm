
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TransferFormData {
  itemId: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  notes?: string;
}

interface TransferFormProps {
  items: Array<{ id: string; name: string; quantity: number; location: string }>;
  onTransferComplete: () => void;
}

export function TransferForm({ items, onTransferComplete }: TransferFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<TransferFormData>();

  const onSubmit = async (data: TransferFormData) => {
    setIsLoading(true);
    try {
      const { error: transferError } = await supabase.from('inventory_transfers').insert({
        item_id: data.itemId,
        from_location: data.fromLocation,
        to_location: data.toLocation,
        quantity: data.quantity,
        notes: data.notes
      });

      if (transferError) throw transferError;

      // Update item location and quantity
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({
          location: data.toLocation,
          quantity: data.quantity
        })
        .eq('id', data.itemId);

      if (updateError) throw updateError;

      toast({
        title: "Transfer successful",
        description: "Item has been transferred successfully."
      });
      
      form.reset();
      onTransferComplete();
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Transfer failed",
        description: "There was an error transferring the item.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="itemId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.location} - {item.quantity} units)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fromLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="mobile-unit">Mobile Unit</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="toLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>To Location</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="mobile-unit">Mobile Unit</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Transferring..." : "Transfer Item"}
        </Button>
      </form>
    </Form>
  );
}

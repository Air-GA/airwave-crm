
import { useState } from 'react';
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import Papa from 'papaparse';
import { Customer } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";

interface CustomerCSVUploadProps {
  onUploadComplete: () => void;
}

export const CustomerCSVUpload = ({ onUploadComplete }: CustomerCSVUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const customers = results.data.map((row: any) => ({
            id: row.id || crypto.randomUUID(),
            name: row.name || '',
            email: row.email || '',
            phone: row.phone || '',
            address: row.address || '',
            billAddress: row.billAddress || row.address || '',
            type: (row.type as Customer['type']) || 'residential',
            status: (row.status as Customer['status']) || 'active',
            serviceAddresses: [{
              id: crypto.randomUUID(),
              address: row.address || '',
              isPrimary: true
            }]
          }));

          const { error } = await supabase
            .from('customers')
            .upsert(customers.map(customer => ({
              id: customer.id,
              name: customer.name,
              type: customer.type,
              status: customer.status
            })));

          if (error) throw error;

          toast({
            title: "Success",
            description: `Imported ${customers.length} customers successfully.`,
          });

          onUploadComplete();
        } catch (error) {
          console.error('Error uploading customers:', error);
          toast({
            title: "Error",
            description: "Failed to import customers. Please check your CSV format.",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
          if (event.target) {
            event.target.value = '';
          }
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        toast({
          title: "Error",
          description: "Failed to parse CSV file. Please check the file format.",
          variant: "destructive",
        });
        setIsUploading(false);
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
        id="csv-upload"
        disabled={isUploading}
      />
      <label htmlFor="csv-upload">
        <Button
          variant="outline"
          className="cursor-pointer"
          disabled={isUploading}
          asChild
        >
          <span>
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Import Customers (CSV)"}
          </span>
        </Button>
      </label>
    </div>
  );
};

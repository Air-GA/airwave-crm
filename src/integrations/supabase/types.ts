export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          address_type: string | null
          city: string
          created_at: string | null
          customer_id: string | null
          id: string
          is_primary: boolean | null
          state: string
          street: string
          updated_at: string | null
          zip_code: string
        }
        Insert: {
          address_type?: string | null
          city: string
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_primary?: boolean | null
          state: string
          street: string
          updated_at?: string | null
          zip_code: string
        }
        Update: {
          address_type?: string | null
          city?: string
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_primary?: boolean | null
          state?: string
          street?: string
          updated_at?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          address_id: string | null
          created_at: string | null
          customer_id: string | null
          equipment_id: string | null
          id: string
          notes: string | null
          scheduled_date: string
          scheduled_time_end: string
          scheduled_time_start: string
          service_type: string
          status: string | null
          technician_id: string | null
          updated_at: string | null
        }
        Insert: {
          address_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          equipment_id?: string | null
          id?: string
          notes?: string | null
          scheduled_date: string
          scheduled_time_end: string
          scheduled_time_start: string
          service_type: string
          status?: string | null
          technician_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          equipment_id?: string | null
          id?: string
          notes?: string | null
          scheduled_date?: string
          scheduled_time_end?: string
          scheduled_time_start?: string
          service_type?: string
          status?: string | null
          technician_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string | null
          customer_id: string
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          original_crm_id: string | null
          phone: string | null
          service_address_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          original_crm_id?: string | null
          phone?: string | null
          service_address_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          original_crm_id?: string | null
          phone?: string | null
          service_address_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_service_address_id_fkey"
            columns: ["service_address_id"]
            isOneToOne: false
            referencedRelation: "service_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          auto_email_statements: boolean | null
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_city: string | null
          billing_county: string | null
          billing_state: string | null
          billing_zip: string | null
          branch_id: string | null
          created_at: string | null
          id: string
          markup_plan_id: string | null
          name: string
          on_hold: boolean | null
          original_crm_id: string | null
          payment_terms: string | null
          quickbooks_synced_at: string | null
          rate_plan_id: string | null
          sales_code_id: string | null
          status: string | null
          third_party_provider: string | null
          third_party_service_fee: number | null
          updated_at: string | null
        }
        Insert: {
          auto_email_statements?: boolean | null
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_county?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          branch_id?: string | null
          created_at?: string | null
          id?: string
          markup_plan_id?: string | null
          name: string
          on_hold?: boolean | null
          original_crm_id?: string | null
          payment_terms?: string | null
          quickbooks_synced_at?: string | null
          rate_plan_id?: string | null
          sales_code_id?: string | null
          status?: string | null
          third_party_provider?: string | null
          third_party_service_fee?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_email_statements?: boolean | null
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_county?: string | null
          billing_state?: string | null
          billing_zip?: string | null
          branch_id?: string | null
          created_at?: string | null
          id?: string
          markup_plan_id?: string | null
          name?: string
          on_hold?: boolean | null
          original_crm_id?: string | null
          payment_terms?: string | null
          quickbooks_synced_at?: string | null
          rate_plan_id?: string | null
          sales_code_id?: string | null
          status?: string | null
          third_party_provider?: string | null
          third_party_service_fee?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_markup_plan_id_fkey"
            columns: ["markup_plan_id"]
            isOneToOne: false
            referencedRelation: "markup_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_rate_plan_id_fkey"
            columns: ["rate_plan_id"]
            isOneToOne: false
            referencedRelation: "rate_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_sales_code_id_fkey"
            columns: ["sales_code_id"]
            isOneToOne: false
            referencedRelation: "sales_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      divisions: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          install_date: string | null
          last_serviced_date: string | null
          location_description: string | null
          model: string | null
          name: string | null
          original_crm_id: string | null
          serial_number: string | null
          service_address_id: string
          type: string | null
          updated_at: string | null
          warranty_info: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          install_date?: string | null
          last_serviced_date?: string | null
          location_description?: string | null
          model?: string | null
          name?: string | null
          original_crm_id?: string | null
          serial_number?: string | null
          service_address_id: string
          type?: string | null
          updated_at?: string | null
          warranty_info?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          install_date?: string | null
          last_serviced_date?: string | null
          location_description?: string | null
          model?: string | null
          name?: string | null
          original_crm_id?: string | null
          serial_number?: string | null
          service_address_id?: string
          type?: string | null
          updated_at?: string | null
          warranty_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_service_address_id_fkey"
            columns: ["service_address_id"]
            isOneToOne: false
            referencedRelation: "service_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          name: string
          quantity: number | null
          sku: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name: string
          quantity?: number | null
          sku?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          quantity?: number | null
          sku?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_transfers: {
        Row: {
          created_at: string | null
          from_location: string
          id: string
          item_id: string
          notes: string | null
          quantity: number
          to_location: string
          transferred_by: string | null
        }
        Insert: {
          created_at?: string | null
          from_location: string
          id?: string
          item_id: string
          notes?: string | null
          quantity: number
          to_location: string
          transferred_by?: string | null
        }
        Update: {
          created_at?: string | null
          from_location?: string
          id?: string
          item_id?: string
          notes?: string | null
          quantity?: number
          to_location?: string
          transferred_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transfers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string | null
          quantity: number
          total_price: number
          unit_price: number
          work_order_item_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
          work_order_item_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
          work_order_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_work_order_item_id_fkey"
            columns: ["work_order_item_id"]
            isOneToOne: false
            referencedRelation: "work_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          customer_id: string | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          paid_at: string | null
          status: string | null
          subtotal: number
          tax: number
          total: number
          updated_at: string | null
          work_order_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date: string
          notes?: string | null
          paid_at?: string | null
          status?: string | null
          subtotal: number
          tax: number
          total: number
          updated_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          paid_at?: string | null
          status?: string | null
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string | null
          work_order_id?: string | null
        }
        Relationships: []
      }
      markup_plans: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profit_rhino_parts: {
        Row: {
          category: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          list_price: number | null
          manufacturer: string | null
          metadata: Json | null
          model_number: string | null
          part_number: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          list_price?: number | null
          manufacturer?: string | null
          metadata?: Json | null
          model_number?: string | null
          part_number: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          list_price?: number | null
          manufacturer?: string | null
          metadata?: Json | null
          model_number?: string | null
          part_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rate_plans: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      regions: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sales_codes: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_addresses: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          auto_invoice_enabled: boolean | null
          city: string | null
          created_at: string | null
          customer_id: string
          id: string
          location_code: string | null
          name: string | null
          original_crm_id: string | null
          phone: string | null
          recurring_pm_enabled: boolean | null
          region_id: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          auto_invoice_enabled?: boolean | null
          city?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          location_code?: string | null
          name?: string | null
          original_crm_id?: string | null
          phone?: string | null
          recurring_pm_enabled?: boolean | null
          region_id?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          auto_invoice_enabled?: boolean | null
          city?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          location_code?: string | null
          name?: string | null
          original_crm_id?: string | null
          phone?: string | null
          recurring_pm_enabled?: boolean | null
          region_id?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_addresses_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          availability_status: string | null
          certification: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          notes: string | null
          specialty: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability_status?: string | null
          certification?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          specialty?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability_status?: string | null
          certification?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          notes?: string | null
          specialty?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technicians_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          notes: string | null
          start_time: string
          technician_id: string | null
          updated_at: string | null
          work_order_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time: string
          technician_id?: string | null
          updated_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string
          technician_id?: string | null
          updated_at?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_login: string | null
          last_name: string | null
          password_hash: string
          role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          password_hash: string
          role: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          password_hash?: string
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      work_order_items: {
        Row: {
          created_at: string | null
          id: string
          inventory_item_id: string | null
          quantity: number
          total_price: number
          unit_price: number
          work_order_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
          work_order_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_order_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_statuses: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      work_order_types: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          auto_created: boolean | null
          created_at: string | null
          customer_id: string
          description: string | null
          division_id: string | null
          id: string
          original_crm_id: string | null
          region_id: string | null
          sales_code_id: string | null
          scheduled_datetime: string | null
          service_address_id: string
          status_id: string | null
          technician_id: string | null
          type_id: string | null
          updated_at: string | null
          work_order_number: string | null
        }
        Insert: {
          auto_created?: boolean | null
          created_at?: string | null
          customer_id: string
          description?: string | null
          division_id?: string | null
          id?: string
          original_crm_id?: string | null
          region_id?: string | null
          sales_code_id?: string | null
          scheduled_datetime?: string | null
          service_address_id: string
          status_id?: string | null
          technician_id?: string | null
          type_id?: string | null
          updated_at?: string | null
          work_order_number?: string | null
        }
        Update: {
          auto_created?: boolean | null
          created_at?: string | null
          customer_id?: string
          description?: string | null
          division_id?: string | null
          id?: string
          original_crm_id?: string | null
          region_id?: string | null
          sales_code_id?: string | null
          scheduled_datetime?: string | null
          service_address_id?: string
          status_id?: string | null
          technician_id?: string | null
          type_id?: string | null
          updated_at?: string | null
          work_order_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_sales_code_id_fkey"
            columns: ["sales_code_id"]
            isOneToOne: false
            referencedRelation: "sales_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_service_address_id_fkey"
            columns: ["service_address_id"]
            isOneToOne: false
            referencedRelation: "service_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "work_order_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "work_order_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

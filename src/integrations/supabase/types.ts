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
      customers: {
        Row: {
          address: string | null
          bill_address: string | null
          created_at: string
          email: string | null
          id: string
          last_service: string | null
          name: string
          phone: string | null
          service_address: string | null
          type: string
        }
        Insert: {
          address?: string | null
          bill_address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_service?: string | null
          name: string
          phone?: string | null
          service_address?: string | null
          type: string
        }
        Update: {
          address?: string | null
          bill_address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_service?: string | null
          name?: string
          phone?: string | null
          service_address?: string | null
          type?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          description: string | null
          id: string
          location: string | null
          name: string
          price: number
          quantity: number
          reorder_level: number
          sku: string | null
          supplier: string | null
          unit_price: number | null
        }
        Insert: {
          category: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          price?: number
          quantity?: number
          reorder_level?: number
          sku?: string | null
          supplier?: string | null
          unit_price?: number | null
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          price?: number
          quantity?: number
          reorder_level?: number
          sku?: string | null
          supplier?: string | null
          unit_price?: number | null
        }
        Relationships: []
      }
      service_addresses: {
        Row: {
          address: string
          customer_id: string
          id: string
          is_primary: boolean
          notes: string | null
        }
        Insert: {
          address: string
          customer_id: string
          id?: string
          is_primary?: boolean
          notes?: string | null
        }
        Update: {
          address?: string
          customer_id?: string
          id?: string
          is_primary?: boolean
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          created_at: string
          current_location_address: string | null
          current_location_lat: number | null
          current_location_lng: number | null
          id: string
          name: string
          specialties: string[] | null
          status: string
        }
        Insert: {
          created_at?: string
          current_location_address?: string | null
          current_location_lat?: number | null
          current_location_lng?: number | null
          id?: string
          name: string
          specialties?: string[] | null
          status: string
        }
        Update: {
          created_at?: string
          current_location_address?: string | null
          current_location_lat?: number | null
          current_location_lng?: number | null
          id?: string
          name?: string
          specialties?: string[] | null
          status?: string
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          address: string
          completed_date: string | null
          created_at: string
          customer_id: string
          customer_name: string
          description: string
          estimated_hours: number | null
          id: string
          notes: string[] | null
          priority: string
          scheduled_date: string
          status: string
          technician_id: string | null
          technician_name: string | null
          type: string
        }
        Insert: {
          address: string
          completed_date?: string | null
          created_at?: string
          customer_id: string
          customer_name: string
          description: string
          estimated_hours?: number | null
          id?: string
          notes?: string[] | null
          priority: string
          scheduled_date: string
          status: string
          technician_id?: string | null
          technician_name?: string | null
          type: string
        }
        Update: {
          address?: string
          completed_date?: string | null
          created_at?: string
          customer_id?: string
          customer_name?: string
          description?: string
          estimated_hours?: number | null
          id?: string
          notes?: string[] | null
          priority?: string
          scheduled_date?: string
          status?: string
          technician_id?: string | null
          technician_name?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

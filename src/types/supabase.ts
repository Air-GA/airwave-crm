
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      technicians: {
        Row: {
          id: string
          name: string
          status: 'available' | 'busy' | 'off-duty'
          specialties: string[] | null
          current_location_address: string | null
          current_location_lat: number | null
          current_location_lng: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          status: 'available' | 'busy' | 'off-duty'
          specialties?: string[] | null
          current_location_address?: string | null
          current_location_lat?: number | null
          current_location_lng?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: 'available' | 'busy' | 'off-duty'
          specialties?: string[] | null
          current_location_address?: string | null
          current_location_lat?: number | null
          current_location_lng?: number | null
          created_at?: string
        }
      }
      work_orders: {
        Row: {
          id: string
          customer_id: string
          customer_name: string
          address: string
          type: 'repair' | 'maintenance' | 'installation' | 'inspection'
          description: string
          priority: 'low' | 'medium' | 'high' | 'emergency'
          status: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
          scheduled_date: string
          created_at: string
          completed_date: string | null
          estimated_hours: number | null
          technician_id: string | null
          technician_name: string | null
          notes: string[] | null
        }
        Insert: {
          id?: string
          customer_id: string
          customer_name: string
          address: string
          type: 'repair' | 'maintenance' | 'installation' | 'inspection'
          description: string
          priority: 'low' | 'medium' | 'high' | 'emergency'
          status: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
          scheduled_date: string
          created_at?: string
          completed_date?: string | null
          estimated_hours?: number | null
          technician_id?: string | null
          technician_name?: string | null
          notes?: string[] | null
        }
        Update: {
          id?: string
          customer_id?: string
          customer_name?: string
          address?: string
          type?: 'repair' | 'maintenance' | 'installation' | 'inspection'
          description?: string
          priority?: 'low' | 'medium' | 'high' | 'emergency'
          status?: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
          scheduled_date?: string
          created_at?: string
          completed_date?: string | null
          estimated_hours?: number | null
          technician_id?: string | null
          technician_name?: string | null
          notes?: string[] | null
        }
      }
    }
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          timezone: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          timezone?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          timezone?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          branch_id: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          middle_name: string | null
          phone: string | null
          role_id: string
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name?: string
          middle_name?: string | null
          phone?: string | null
          role_id: string
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          middle_name?: string | null
          phone?: string | null
          role_id?: string
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string
          id: string
          name: string
        }
        Insert: {
          code: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          branch_id: string
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          metadata: Json
          name: string
        }
        Insert: {
          branch_id: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
        }
        Update: {
          branch_id?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_invites: {
        Row: {
          branch_id: string | null
          created_at: string
          email: string
          role_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          email: string
          role_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          email?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_invites_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_invites_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_counters: {
        Row: {
          branch_id: string
          last_number: number
          service_id: string
          ticket_date: string
        }
        Insert: {
          branch_id: string
          last_number?: number
          service_id: string
          ticket_date: string
        }
        Update: {
          branch_id?: string
          last_number?: number
          service_id?: string
          ticket_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_counters_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_counters_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_logs: {
        Row: {
          action: string
          created_at: string
          from_status: Database["public"]["Enums"]["ticket_status"] | null
          id: number
          metadata: Json
          notes: string | null
          performed_by: string | null
          ticket_id: string
          to_status: Database["public"]["Enums"]["ticket_status"] | null
          window_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["ticket_status"] | null
          id?: never
          metadata?: Json
          notes?: string | null
          performed_by?: string | null
          ticket_id: string
          to_status?: Database["public"]["Enums"]["ticket_status"] | null
          window_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["ticket_status"] | null
          id?: never
          metadata?: Json
          notes?: string | null
          performed_by?: string | null
          ticket_id?: string
          to_status?: Database["public"]["Enums"]["ticket_status"] | null
          window_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_logs_window_id_fkey"
            columns: ["window_id"]
            isOneToOne: false
            referencedRelation: "windows"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          branch_id: string
          called_at: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json
          priority: number
          sequence_number: number
          served_by: string | null
          service_id: string
          skip_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_date: string
          ticket_number: string
          window_id: string | null
        }
        Insert: {
          branch_id: string
          called_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          metadata?: Json
          priority?: number
          sequence_number: number
          served_by?: string | null
          service_id: string
          skip_count?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_date: string
          ticket_number: string
          window_id?: string | null
        }
        Update: {
          branch_id?: string
          called_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          metadata?: Json
          priority?: number
          sequence_number?: number
          served_by?: string | null
          service_id?: string
          skip_count?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_date?: string
          ticket_number?: string
          window_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_served_by_fkey"
            columns: ["served_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_window_id_fkey"
            columns: ["window_id"]
            isOneToOne: false
            referencedRelation: "windows"
            referencedColumns: ["id"]
          },
        ]
      }
      window_services: {
        Row: {
          service_id: string
          window_id: string
        }
        Insert: {
          service_id: string
          window_id: string
        }
        Update: {
          service_id?: string
          window_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "window_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "window_services_window_id_fkey"
            columns: ["window_id"]
            isOneToOne: false
            referencedRelation: "windows"
            referencedColumns: ["id"]
          },
        ]
      }
      windows: {
        Row: {
          branch_id: string
          created_at: string
          current_staff_id: string | null
          id: string
          is_active: boolean
          name: string
          status: Database["public"]["Enums"]["window_status"]
        }
        Insert: {
          branch_id: string
          created_at?: string
          current_staff_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          status?: Database["public"]["Enums"]["window_status"]
        }
        Update: {
          branch_id?: string
          created_at?: string
          current_staff_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          status?: Database["public"]["Enums"]["window_status"]
        }
        Relationships: [
          {
            foreignKeyName: "windows_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "windows_current_staff_id_fkey"
            columns: ["current_staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _issue_ticket: {
        Args: {
          p_branch: string
          p_metadata?: Json
          p_name: string
          p_phone: string
          p_priority: number
          p_service: string
        }
        Returns: {
          branch_id: string
          called_at: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json
          priority: number
          sequence_number: number
          served_by: string | null
          service_id: string
          skip_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_date: string
          ticket_number: string
          window_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _lock_free_window: {
        Args: { p_window: string }
        Returns: {
          branch_id: string
          created_at: string
          current_staff_id: string | null
          id: string
          is_active: boolean
          name: string
          status: Database["public"]["Enums"]["window_status"]
        }
        SetofOptions: {
          from: "*"
          to: "windows"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _lock_ticket: {
        Args: { p_owner_only?: boolean; p_ticket: string }
        Returns: {
          branch_id: string
          called_at: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json
          priority: number
          sequence_number: number
          served_by: string | null
          service_id: string
          skip_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_date: string
          ticket_number: string
          window_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      _log_ticket: {
        Args: {
          p_action: string
          p_from: Database["public"]["Enums"]["ticket_status"]
          p_meta?: Json
          p_notes?: string
          p_ticket: string
          p_to: Database["public"]["Enums"]["ticket_status"]
          p_window: string
        }
        Returns: undefined
      }
      call_next_ticket: {
        Args: { p_window: string }
        Returns: {
          branch_id: string
          called_at: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json
          priority: number
          sequence_number: number
          served_by: string | null
          service_id: string
          skip_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_date: string
          ticket_number: string
          window_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancel_ticket: {
        Args: { p_notes?: string; p_ticket: string }
        Returns: {
          branch_id: string
          called_at: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json
          priority: number
          sequence_number: number
          served_by: string | null
          service_id: string
          skip_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_date: string
          ticket_number: string
          window_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      complete_ticket: {
        Args: { p_notes?: string; p_ticket: string }
        Returns: {
          branch_id: string
          called_at: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json
          priority: number
          sequence_number: number
          served_by: string | null
          service_id: string
          skip_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_date: string
          ticket_number: string
          window_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_ticket: {
        Args: {
          p_branch: string
          p_name?: string
          p_phone?: string
          p_priority?: number
          p_service: string
        }
        Returns: {
          branch_id: string
          called_at: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json
          priority: number
          sequence_number: number
          served_by: string | null
          service_id: string
          skip_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_date: string
          ticket_number: string
          window_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_active_staff: { Args: never; Returns: boolean }
      is_active_user: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_kiosk: { Args: never; Returns: boolean }
      is_manager: { Args: never; Returns: boolean }
      kiosk_issue_ticket: {
        Args: { p_is_pwd?: boolean; p_service: string }
        Returns: {
          branch_id: string
          called_at: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json
          priority: number
          sequence_number: number
          served_by: string | null
          service_id: string
          skip_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_date: string
          ticket_number: string
          window_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      my_branch: { Args: never; Returns: string }
      my_kiosk_branch: { Args: never; Returns: string }
      no_show_ticket: {
        Args: { p_notes?: string; p_ticket: string }
        Returns: {
          branch_id: string
          called_at: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json
          priority: number
          sequence_number: number
          served_by: string | null
          service_id: string
          skip_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_date: string
          ticket_number: string
          window_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      public_display: {
        Args: { p_branch: string }
        Returns: {
          called_at: string
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_number: string
          window_name: string
        }[]
      }
      public_ticket_status: {
        Args: { p_ticket: string }
        Returns: {
          people_ahead: number
          service_name: string
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_number: string
          window_name: string
        }[]
      }
      recall_ticket: {
        Args: { p_ticket: string; p_window?: string }
        Returns: {
          branch_id: string
          called_at: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json
          priority: number
          sequence_number: number
          served_by: string | null
          service_id: string
          skip_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_date: string
          ticket_number: string
          window_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_window_status: {
        Args: {
          p_status: Database["public"]["Enums"]["window_status"]
          p_window: string
        }
        Returns: {
          branch_id: string
          created_at: string
          current_staff_id: string | null
          id: string
          is_active: boolean
          name: string
          status: Database["public"]["Enums"]["window_status"]
        }
        SetofOptions: {
          from: "*"
          to: "windows"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      skip_ticket: {
        Args: { p_notes?: string; p_ticket: string }
        Returns: {
          branch_id: string
          called_at: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json
          priority: number
          sequence_number: number
          served_by: string | null
          service_id: string
          skip_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_date: string
          ticket_number: string
          window_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      start_serving: {
        Args: { p_ticket: string }
        Returns: {
          branch_id: string
          called_at: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json
          priority: number
          sequence_number: number
          served_by: string | null
          service_id: string
          skip_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_date: string
          ticket_number: string
          window_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      transfer_ticket: {
        Args: { p_notes?: string; p_ticket: string; p_to_service: string }
        Returns: {
          branch_id: string
          called_at: string | null
          completed_at: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          id: string
          metadata: Json
          priority: number
          sequence_number: number
          served_by: string | null
          service_id: string
          skip_count: number
          started_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_date: string
          ticket_number: string
          window_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      ticket_status:
        | "waiting"
        | "called"
        | "serving"
        | "completed"
        | "skipped"
        | "no_show"
        | "cancelled"
        | "transferred"
      user_status: "active" | "inactive" | "suspended"
      window_status: "open" | "closed" | "on_break"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ticket_status: [
        "waiting",
        "called",
        "serving",
        "completed",
        "skipped",
        "no_show",
        "cancelled",
        "transferred",
      ],
      user_status: ["active", "inactive", "suspended"],
      window_status: ["open", "closed", "on_break"],
    },
  },
} as const

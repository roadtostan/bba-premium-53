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
      branches: {
        Row: {
          created_at: string
          id: string
          manager_id: string | null
          name: string
          subdistrict_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          manager_id?: string | null
          name: string
          subdistrict_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          manager_id?: string | null
          name?: string
          subdistrict_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branches_subdistrict_id_fkey"
            columns: ["subdistrict_id"]
            isOneToOne: false
            referencedRelation: "subdistricts"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          created_at: string
          id: string
          report_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          report_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          report_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      other_expenses: {
        Row: {
          amount: number
          description: string
          expense_info_id: string
          id: string
        }
        Insert: {
          amount: number
          description: string
          expense_info_id: string
          id?: string
        }
        Update: {
          amount?: number
          description?: string
          expense_info_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "other_expenses_expense_info_id_fkey"
            columns: ["expense_info_id"]
            isOneToOne: false
            referencedRelation: "report_expense_info"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          branch: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: string
          subdistrict: string | null
          updated_at: string
        }
        Insert: {
          branch?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          role?: string
          subdistrict?: string | null
          updated_at?: string
        }
        Update: {
          branch?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: string
          subdistrict?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      report_expense_info: {
        Row: {
          cooking_oil: number
          employee_bonus: number
          employee_salary: number
          id: string
          lpg_gas: number
          plastic_bags: number
          report_id: string
          soap: number
          tissue: number
          total_expenses: number
        }
        Insert: {
          cooking_oil: number
          employee_bonus: number
          employee_salary: number
          id?: string
          lpg_gas: number
          plastic_bags: number
          report_id: string
          soap: number
          tissue: number
          total_expenses: number
        }
        Update: {
          cooking_oil?: number
          employee_bonus?: number
          employee_salary?: number
          id?: string
          lpg_gas?: number
          plastic_bags?: number
          report_id?: string
          soap?: number
          tissue?: number
          total_expenses?: number
        }
        Relationships: [
          {
            foreignKeyName: "report_expense_info_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: true
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_income_info: {
        Row: {
          cash_receipts: number
          id: string
          remaining_income: number
          report_id: string
          total_income: number
          transfer_receipts: number
        }
        Insert: {
          cash_receipts: number
          id?: string
          remaining_income: number
          report_id: string
          total_income: number
          transfer_receipts: number
        }
        Update: {
          cash_receipts?: number
          id?: string
          remaining_income?: number
          report_id?: string
          total_income?: number
          transfer_receipts?: number
        }
        Relationships: [
          {
            foreignKeyName: "report_income_info_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: true
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_location_info: {
        Row: {
          branch_manager: string
          branch_name: string
          city_name: string
          district_name: string
          id: string
          report_id: string
        }
        Insert: {
          branch_manager: string
          branch_name: string
          city_name: string
          district_name: string
          id?: string
          report_id: string
        }
        Update: {
          branch_manager?: string
          branch_name?: string
          city_name?: string
          district_name?: string
          id?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_location_info_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: true
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_product_info: {
        Row: {
          id: string
          initial_stock: number
          rejects: number
          remaining_stock: number
          report_id: string
          sold: number
          testers: number
        }
        Insert: {
          id?: string
          initial_stock: number
          rejects: number
          remaining_stock: number
          report_id: string
          sold: number
          testers: number
        }
        Update: {
          id?: string
          initial_stock?: number
          rejects?: number
          remaining_stock?: number
          report_id?: string
          sold?: number
          testers?: number
        }
        Relationships: [
          {
            foreignKeyName: "report_product_info_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: true
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          branch_id: string
          content: string | null
          created_at: string
          created_by: string
          date: string
          id: string
          rejection_reason: string | null
          status: string
          title: string
          total_sales: number
          updated_at: string
        }
        Insert: {
          branch_id: string
          content?: string | null
          created_at?: string
          created_by: string
          date: string
          id?: string
          rejection_reason?: string | null
          status?: string
          title: string
          total_sales?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string
          content?: string | null
          created_at?: string
          created_by?: string
          date?: string
          id?: string
          rejection_reason?: string | null
          status?: string
          title?: string
          total_sales?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subdistricts: {
        Row: {
          city_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          city_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          city_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subdistricts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_branch_manager: {
        Args: {
          branch_id: string
        }
        Returns: boolean
      }
      is_city_admin: {
        Args: {
          city_id: string
        }
        Returns: boolean
      }
      is_subdistrict_admin: {
        Args: {
          subdistrict_id: string
        }
        Returns: boolean
      }
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

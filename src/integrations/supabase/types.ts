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
          name: string
          subdistrict_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          subdistrict_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          subdistrict_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_subdistrict_id_fkey"
            columns: ["subdistrict_id"]
            isOneToOne: false
            referencedRelation: "subdistricts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_branches_subdistrict"
            columns: ["subdistrict_id"]
            isOneToOne: false
            referencedRelation: "subdistricts"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          created_at: string
          id: string
          report_id: string | null
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          report_id?: string | null
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          report_id?: string | null
          text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "report_details"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          branch_id: string | null
          branch_manager: string | null
          cash_receipts: number | null
          city_id: string | null
          content: string | null
          cooking_oil: number | null
          created_at: string | null
          date: string
          employee_bonus: number | null
          employee_salary: number | null
          id: string
          initial_stock: number | null
          lpg_gas: number | null
          other_expenses: Json | null
          plastic_bags: number | null
          rejection_reason: string | null
          rejects: number | null
          remaining_income: number | null
          remaining_stock: number | null
          soap: number | null
          sold: number | null
          status: string
          subdistrict_id: string | null
          testers: number | null
          tissue: number | null
          title: string
          total_expenses: number | null
          total_income: number | null
          transfer_receipts: number | null
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          branch_manager?: string | null
          cash_receipts?: number | null
          city_id?: string | null
          content?: string | null
          cooking_oil?: number | null
          created_at?: string | null
          date: string
          employee_bonus?: number | null
          employee_salary?: number | null
          id?: string
          initial_stock?: number | null
          lpg_gas?: number | null
          other_expenses?: Json | null
          plastic_bags?: number | null
          rejection_reason?: string | null
          rejects?: number | null
          remaining_income?: number | null
          remaining_stock?: number | null
          soap?: number | null
          sold?: number | null
          status: string
          subdistrict_id?: string | null
          testers?: number | null
          tissue?: number | null
          title: string
          total_expenses?: number | null
          total_income?: number | null
          transfer_receipts?: number | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          branch_manager?: string | null
          cash_receipts?: number | null
          city_id?: string | null
          content?: string | null
          cooking_oil?: number | null
          created_at?: string | null
          date?: string
          employee_bonus?: number | null
          employee_salary?: number | null
          id?: string
          initial_stock?: number | null
          lpg_gas?: number | null
          other_expenses?: Json | null
          plastic_bags?: number | null
          rejection_reason?: string | null
          rejects?: number | null
          remaining_income?: number | null
          remaining_stock?: number | null
          soap?: number | null
          sold?: number | null
          status?: string
          subdistrict_id?: string | null
          testers?: number | null
          tissue?: number | null
          title?: string
          total_expenses?: number | null
          total_income?: number | null
          transfer_receipts?: number | null
          updated_at?: string | null
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
            foreignKeyName: "reports_branch_manager_fkey"
            columns: ["branch_manager"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_subdistrict_id_fkey"
            columns: ["subdistrict_id"]
            isOneToOne: false
            referencedRelation: "subdistricts"
            referencedColumns: ["id"]
          },
        ]
      }
      subdistricts: {
        Row: {
          city_id: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          city_id?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_subdistricts_city"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subdistricts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          branch: string | null
          city: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          subdistrict: string | null
        }
        Insert: {
          branch?: string | null
          city?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          subdistrict?: string | null
        }
        Update: {
          branch?: string | null
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          subdistrict?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      report_details: {
        Row: {
          branch_id: string | null
          branch_manager_name: string | null
          branch_name: string | null
          cash_receipts: number | null
          city_id: string | null
          city_name: string | null
          content: string | null
          cooking_oil: number | null
          created_at: string | null
          created_by: string | null
          date: string | null
          employee_bonus: number | null
          employee_salary: number | null
          id: string | null
          initial_stock: number | null
          lpg_gas: number | null
          other_expenses: Json | null
          plastic_bags: number | null
          rejection_reason: string | null
          rejects: number | null
          remaining_income: number | null
          remaining_stock: number | null
          soap: number | null
          sold: number | null
          status: string | null
          subdistrict_id: string | null
          subdistrict_name: string | null
          testers: number | null
          tissue: number | null
          title: string | null
          total_expenses: number | null
          total_income: number | null
          transfer_receipts: number | null
          updated_at: string | null
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
            foreignKeyName: "reports_branch_manager_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_subdistrict_id_fkey"
            columns: ["subdistrict_id"]
            isOneToOne: false
            referencedRelation: "subdistricts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_report_comment: {
        Args: {
          p_report_id: string
          p_user_id: string
          p_text: string
        }
        Returns: {
          comment_id: string
          report_id: string
          user_id: string
          text: string
          created_at: string
        }[]
      }
      approve_report: {
        Args: {
          p_report_id: string
          p_new_status: string
        }
        Returns: Json
      }
      can_create_new_report: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      can_edit_report: {
        Args: {
          p_user_id: string
          p_report_id: string
        }
        Returns: boolean
      }
      check_can_create_report: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      create_report: {
        Args: {
          p_title: string
          p_content: string
          p_date: string
          p_status: string
          p_branch_id: string
          p_subdistrict_id: string
          p_city_id: string
          p_branch_manager: string
          p_initial_stock: number
          p_remaining_stock: number
          p_testers: number
          p_rejects: number
          p_sold: number
          p_employee_salary: number
          p_employee_bonus: number
          p_cooking_oil: number
          p_lpg_gas: number
          p_plastic_bags: number
          p_tissue: number
          p_soap: number
          p_other_expenses: Json
          p_total_expenses: number
          p_cash_receipts: number
          p_transfer_receipts: number
          p_total_income: number
          p_remaining_income: number
        }
        Returns: Json
      }
      get_pending_action_reports: {
        Args: {
          p_user_id: string
        }
        Returns: Json[]
      }
      get_report_comments: {
        Args: {
          p_report_id: string
        }
        Returns: {
          id: string
          text: string
          user_id: string
          user_name: string
          created_at: string
        }[]
      }
      get_report_detail: {
        Args: {
          p_report_id: string
        }
        Returns: Json
      }
      get_user_data: {
        Args: {
          user_email: string
        }
        Returns: {
          branch: string | null
          city: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          subdistrict: string | null
        }
      }
      get_user_names: {
        Args: {
          p_user_ids: string[]
        }
        Returns: {
          id: string
          name: string
        }[]
      }
      get_user_reports: {
        Args: {
          p_user_id: string
        }
        Returns: Json[]
      }
      get_users_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          created_at: string
          email: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          branch: string
          subdistrict: string
          city: string
        }[]
      }
      reject_report: {
        Args: {
          p_report_id: string
          p_rejection_reason: string
        }
        Returns: Json
      }
      update_report: {
        Args: {
          p_report_id: string
          p_title: string
          p_content: string
          p_date: string
          p_status: string
          p_branch_id: string
          p_subdistrict_id: string
          p_city_id: string
          p_branch_manager: string
          p_initial_stock: number
          p_remaining_stock: number
          p_testers: number
          p_rejects: number
          p_sold: number
          p_employee_salary: number
          p_employee_bonus: number
          p_cooking_oil: number
          p_lpg_gas: number
          p_plastic_bags: number
          p_tissue: number
          p_soap: number
          p_other_expenses: Json
          p_total_expenses: number
          p_cash_receipts: number
          p_transfer_receipts: number
          p_total_income: number
          p_remaining_income: number
        }
        Returns: Json
      }
      update_user_data: {
        Args: {
          p_user_id: string
          p_name: string
          p_role: string
          p_branch?: string
          p_subdistrict?: string
          p_city?: string
        }
        Returns: Json
      }
    }
    Enums: {
      report_status:
        | "draft"
        | "pending_subdistrict"
        | "pending_city"
        | "approved"
        | "rejected"
      user_role:
        | "branch_user"
        | "subdistrict_admin"
        | "city_admin"
        | "super_admin"
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

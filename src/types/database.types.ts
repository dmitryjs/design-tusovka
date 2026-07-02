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
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      entitlements: {
        Row: {
          granted_at: string
          id: string
          metadata: Json
          product_id: string
          revoked_at: string | null
          source_id: string
          source_type: Database["public"]["Enums"]["entitlement_source_type"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          metadata?: Json
          product_id: string
          revoked_at?: string | null
          source_id: string
          source_type: Database["public"]["Enums"]["entitlement_source_type"]
          user_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          metadata?: Json
          product_id?: string
          revoked_at?: string | null
          source_id?: string
          source_type?: Database["public"]["Enums"]["entitlement_source_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      material_chapters: {
        Row: {
          content: Json
          created_at: string
          id: string
          material_product_id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          material_product_id: string
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          material_product_id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_chapters_material_product_id_fkey"
            columns: ["material_product_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["product_id"]
          },
        ]
      }
      materials: {
        Row: {
          created_at: string
          format: Database["public"]["Enums"]["material_format"]
          level: Database["public"]["Enums"]["designer_level"]
          product_id: string
          section_product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          format: Database["public"]["Enums"]["material_format"]
          level?: Database["public"]["Enums"]["designer_level"]
          product_id: string
          section_product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          format?: Database["public"]["Enums"]["material_format"]
          level?: Database["public"]["Enums"]["designer_level"]
          product_id?: string
          section_product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_section_product_id_fkey"
            columns: ["section_product_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_tags: {
        Row: {
          created_at: string
          product_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          body: string
          created_at: string
          id: string
          is_hidden: boolean
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_kopecks: number
          product_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_kopecks: number
          product_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_kopecks?: number
          product_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          entitlement_grant_error: string | null
          id: string
          idempotency_key: string | null
          paid_at: string | null
          payment_confirmation_url: string | null
          payment_error: string | null
          payment_provider: string | null
          payment_status: string | null
          provider_payment_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_kopecks: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entitlement_grant_error?: string | null
          id?: string
          idempotency_key?: string | null
          paid_at?: string | null
          payment_confirmation_url?: string | null
          payment_error?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_kopecks: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entitlement_grant_error?: string | null
          id?: string
          idempotency_key?: string | null
          paid_at?: string | null
          payment_confirmation_url?: string | null
          payment_error?: string | null
          payment_provider?: string | null
          payment_status?: string | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_kopecks?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          cover_path: string | null
          created_at: string
          description: string
          id: string
          kind: Database["public"]["Enums"]["product_kind"]
          price_kopecks: number
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at: string
        }
        Insert: {
          cover_path?: string | null
          created_at?: string
          description?: string
          id?: string
          kind: Database["public"]["Enums"]["product_kind"]
          price_kopecks?: number
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at?: string
        }
        Update: {
          cover_path?: string | null
          created_at?: string
          description?: string
          id?: string
          kind?: Database["public"]["Enums"]["product_kind"]
          price_kopecks?: number
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          deactivated_at: string | null
          designer_level: Database["public"]["Enums"]["designer_level"]
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["profile_role"]
          telegram_username: string | null
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          deactivated_at?: string | null
          designer_level?: Database["public"]["Enums"]["designer_level"]
          display_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["profile_role"]
          telegram_username?: string | null
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          deactivated_at?: string | null
          designer_level?: Database["public"]["Enums"]["designer_level"]
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["profile_role"]
          telegram_username?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      section_update_materials: {
        Row: {
          created_at: string
          material_product_id: string
          section_update_product_id: string
        }
        Insert: {
          created_at?: string
          material_product_id: string
          section_update_product_id: string
        }
        Update: {
          created_at?: string
          material_product_id?: string
          section_update_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_update_materials_material_product_id_fkey"
            columns: ["material_product_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "section_update_materials_section_update_product_id_fkey"
            columns: ["section_update_product_id"]
            isOneToOne: false
            referencedRelation: "section_updates"
            referencedColumns: ["product_id"]
          },
        ]
      }
      section_updates: {
        Row: {
          created_at: string
          product_id: string
          release_number: number
          section_product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          product_id: string
          release_number: number
          section_product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          product_id?: string
          release_number?: number
          section_product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_updates_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_updates_section_product_id_fkey"
            columns: ["section_product_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["product_id"]
          },
        ]
      }
      sections: {
        Row: {
          created_at: string
          for_whom: Json
          position: number
          product_id: string
          updated_at: string
          what_you_get: Json
        }
        Insert: {
          created_at?: string
          for_whom?: Json
          position?: number
          product_id: string
          updated_at?: string
          what_you_get?: Json
        }
        Update: {
          created_at?: string
          for_whom?: Json
          position?: number
          product_id?: string
          updated_at?: string
          what_you_get?: Json
        }
        Relationships: [
          {
            foreignKeyName: "sections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_ai_criteria: {
        Row: {
          created_at: string
          description: string
          id: string
          position: number
          task_product_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          position?: number
          task_product_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          position?: number
          task_product_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_ai_criteria_task_product_id_fkey"
            columns: ["task_product_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["product_id"]
          },
        ]
      }
      task_content: {
        Row: {
          brief: Json
          created_at: string
          submission_requirements: Json
          task_product_id: string
          updated_at: string
        }
        Insert: {
          brief?: Json
          created_at?: string
          submission_requirements?: Json
          task_product_id: string
          updated_at?: string
        }
        Update: {
          brief?: Json
          created_at?: string
          submission_requirements?: Json
          task_product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_content_task_product_id_fkey"
            columns: ["task_product_id"]
            isOneToOne: true
            referencedRelation: "tasks"
            referencedColumns: ["product_id"]
          },
        ]
      }
      tasks: {
        Row: {
          ai_review_available: boolean
          created_at: string
          level: Database["public"]["Enums"]["designer_level"]
          manual_review_available: boolean
          manual_review_price_kopecks: number | null
          product_id: string
          updated_at: string
        }
        Insert: {
          ai_review_available?: boolean
          created_at?: string
          level?: Database["public"]["Enums"]["designer_level"]
          manual_review_available?: boolean
          manual_review_price_kopecks?: number | null
          product_id: string
          updated_at?: string
        }
        Update: {
          ai_review_available?: boolean
          created_at?: string
          level?: Database["public"]["Enums"]["designer_level"]
          manual_review_available?: boolean
          manual_review_price_kopecks?: number | null
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_to_cart: { Args: { p_slug: string }; Returns: Json }
      can_review_product: { Args: { p_product_id: string }; Returns: boolean }
      claim_free_product: { Args: { p_slug: string }; Returns: Json }
      cancel_pending_order: { Args: { p_order_id: string }; Returns: Json }
      create_pending_order_from_cart: { Args: Record<PropertyKey, never>; Returns: Json }
      delete_my_product_review: { Args: { p_product_id: string }; Returns: Json }
      fulfill_paid_order: { Args: { p_order_id: string }; Returns: Json }
      get_material_h1_outline: {
        Args: { p_material_product_id: string }
        Returns: {
          anchor_id: string
          level: number
          sort_order: number
          title: string
        }[]
      }
      get_material_toc: {
        Args: { p_material_product_id: string }
        Returns: {
          id: string
          material_product_id: string
          position: number
          title: string
        }[]
      }
      get_product_review_stats: {
        Args: { p_product_id: string }
        Returns: {
          average_rating: number
          review_count: number
        }[]
      }
      has_product_access: { Args: { product_id: string }; Returns: boolean }
      is_valid_slug: { Args: { slug: string }; Returns: boolean }
      list_product_reviews: { Args: { p_product_id: string }; Returns: Json }
      remove_from_cart: { Args: { p_cart_item_id: string }; Returns: Json }
      update_my_profile: {
        Args: {
          avatar_path: string
          designer_level: Database["public"]["Enums"]["designer_level"]
          display_name: string
          telegram_username: string
        }
        Returns: undefined
      }
      upsert_product_review: {
        Args: { p_body: string; p_product_id: string; p_rating: number }
        Returns: Json
      }
    }
    Enums: {
      designer_level: "junior" | "middle" | "senior" | "all"
      profile_role: "user" | "admin"
      entitlement_source_type:
        | "direct_order"
        | "zero_order"
        | "section_order"
        | "section_update"
        | "manual"
        | "free_task_submission"
        | "all_materials_owned"
      material_format:
        | "mini_guide"
        | "full_guide"
        | "notes"
        | "checklist"
        | "template"
        | "cheat_sheet"
        | "lesson"
        | "practice"
      order_status: "pending_payment" | "paid" | "cancelled" | "failed"
      product_kind: "material" | "task" | "section" | "section_update"
      product_status: "draft" | "published" | "hidden"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      designer_level: ["junior", "middle", "senior", "all"],
      entitlement_source_type: [
        "direct_order",
        "zero_order",
        "section_order",
        "section_update",
        "manual",
        "free_task_submission",
        "all_materials_owned",
      ],
      material_format: [
        "mini_guide",
        "full_guide",
        "notes",
        "checklist",
        "template",
        "cheat_sheet",
        "lesson",
        "practice",
      ],
      product_kind: ["material", "task", "section", "section_update"],
      product_status: ["draft", "published", "hidden"],
      order_status: ["pending_payment", "paid", "cancelled", "failed"],
      profile_role: ["user", "admin"],
    },
  },
} as const


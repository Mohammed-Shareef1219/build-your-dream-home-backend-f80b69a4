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
      consultations: {
        Row: {
          budget: string | null
          company: string | null
          created_at: string
          description: string | null
          email: string
          id: string
          ip_address: string | null
          message: string
          name: string
          notes: string | null
          phone: string | null
          project_type: string | null
          service: string | null
          status: string
          timeline: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          budget?: string | null
          company?: string | null
          created_at?: string
          description?: string | null
          email: string
          id?: string
          ip_address?: string | null
          message: string
          name: string
          notes?: string | null
          phone?: string | null
          project_type?: string | null
          service?: string | null
          status?: string
          timeline?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          budget?: string | null
          company?: string | null
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          name?: string
          notes?: string | null
          phone?: string | null
          project_type?: string | null
          service?: string | null
          status?: string
          timeline?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          property_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          property_id?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          property_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          profile_image: string | null
          updated_at: string
        }
        Insert: {
          account_type?: string
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          profile_image?: string | null
          updated_at?: string
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          profile_image?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          category: string
          created_at: string
          currency: string
          description: string | null
          featured: boolean
          features: string[]
          id: string
          image_urls: string[]
          listing_type: string
          location: string | null
          price: number
          status: Database["public"]["Enums"]["property_status"]
          title: string
          type: Database["public"]["Enums"]["property_type"]
          updated_at: string
        }
        Insert: {
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          featured?: boolean
          features?: string[]
          id?: string
          image_urls?: string[]
          listing_type?: string
          location?: string | null
          price: number
          status?: Database["public"]["Enums"]["property_status"]
          title: string
          type: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Update: {
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          featured?: boolean
          features?: string[]
          id?: string
          image_urls?: string[]
          listing_type?: string
          location?: string | null
          price?: number
          status?: Database["public"]["Enums"]["property_status"]
          title?: string
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
        }
        Relationships: []
      }
      sync_runs: {
        Row: {
          consultations_synced: number
          created_at: string
          error: string | null
          finished_at: string | null
          id: string
          inquiries_synced: number
          started_at: string
          status: string
          users_synced: number
        }
        Insert: {
          consultations_synced?: number
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          inquiries_synced?: number
          started_at?: string
          status?: string
          users_synced?: number
        }
        Update: {
          consultations_synced?: number
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          inquiries_synced?: number
          started_at?: string
          status?: string
          users_synced?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "user"
      property_status: "available" | "sold" | "pending"
      property_type:
        | "villa"
        | "apartment"
        | "duplex"
        | "country_house"
        | "studio"
        | "smart_home"
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
      app_role: ["admin", "user"],
      property_status: ["available", "sold", "pending"],
      property_type: [
        "villa",
        "apartment",
        "duplex",
        "country_house",
        "studio",
        "smart_home",
      ],
    },
  },
} as const

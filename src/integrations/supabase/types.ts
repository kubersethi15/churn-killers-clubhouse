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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          analysis_type: string
          created_at: string
          group_id: string | null
          id: string
          input_text: string
          results: Json
          title: string
          user_id: string
        }
        Insert: {
          analysis_type: string
          created_at?: string
          group_id?: string | null
          id?: string
          input_text: string
          results: Json
          title: string
          user_id: string
        }
        Update: {
          analysis_type?: string
          created_at?: string
          group_id?: string | null
          id?: string
          input_text?: string
          results?: Json
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyses_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "analysis_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_groups: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cs_analyzer_feedback: {
        Row: {
          additional_comments: string | null
          analysis_accuracy: number | null
          analysis_id: string | null
          bugs_encountered: string | null
          created_at: string
          ease_of_use: number | null
          id: string
          improvement_suggestions: string | null
          most_useful_feature: string | null
          user_id: string
          would_recommend: number | null
        }
        Insert: {
          additional_comments?: string | null
          analysis_accuracy?: number | null
          analysis_id?: string | null
          bugs_encountered?: string | null
          created_at?: string
          ease_of_use?: number | null
          id?: string
          improvement_suggestions?: string | null
          most_useful_feature?: string | null
          user_id: string
          would_recommend?: number | null
        }
        Update: {
          additional_comments?: string | null
          analysis_accuracy?: number | null
          analysis_id?: string | null
          bugs_encountered?: string | null
          created_at?: string
          ease_of_use?: number | null
          id?: string
          improvement_suggestions?: string | null
          most_useful_feature?: string | null
          user_id?: string
          would_recommend?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cs_analyzer_feedback_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          id: string
          title: string
          description: string
          pdf_path: string | null
          notion_link: string | null
          newsletter_slug: string | null
          newsletter_title: string | null
          published_date: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          pdf_path?: string | null
          notion_link?: string | null
          newsletter_slug?: string | null
          newsletter_title?: string | null
          published_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          pdf_path?: string | null
          notion_link?: string | null
          newsletter_slug?: string | null
          newsletter_title?: string | null
          published_date?: string
          created_at?: string
        }
        Relationships: []
      }
      newsletters: {
        Row: {
          category: string | null
          content: string
          excerpt: string
          id: string
          published_date: string
          read_time: string
          slug: string
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          excerpt: string
          id?: string
          published_date?: string
          read_time: string
          slug: string
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          excerpt?: string
          id?: string
          published_date?: string
          read_time?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["cs_role"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["cs_role"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["cs_role"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          subscribed: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          subscribed?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          subscribed?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          role: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_newsletter_invoke_function: { Args: never; Returns: undefined }
      enable_pg_cron: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invoke_newsletter_function: { Args: never; Returns: string }
      setup_newsletter_cron_job: { Args: never; Returns: undefined }
      setup_newsletter_once: {
        Args: { cron_schedule: string; job_name: string }
        Returns: undefined
      }
      setup_newsletter_test_cron_job: { Args: never; Returns: undefined }
      setup_newsletter_weekly: { Args: never; Returns: undefined }
      setup_newsletter_weekly_11pm: { Args: never; Returns: undefined }
      sql: { Args: { query: string }; Returns: undefined }
      unschedule_job: { Args: { job_name: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
      cs_role: "csm" | "cs_manager" | "cs_director" | "vp_cs" | "cro" | "other"
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
      app_role: ["admin", "user"],
      cs_role: ["csm", "cs_manager", "cs_director", "vp_cs", "cro", "other"],
    },
  },
} as const

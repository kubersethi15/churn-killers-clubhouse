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
          is_public: boolean
          public_share_id: string
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
          is_public?: boolean
          public_share_id?: string
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
          is_public?: boolean
          public_share_id?: string
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
      email_events: {
        Row: {
          email: string
          event_type: string
          id: string
          newsletter_slug: string | null
          occurred_at: string | null
          payload: Json | null
          received_at: string | null
          resend_message_id: string | null
          subject: string | null
        }
        Insert: {
          email: string
          event_type: string
          id?: string
          newsletter_slug?: string | null
          occurred_at?: string | null
          payload?: Json | null
          received_at?: string | null
          resend_message_id?: string | null
          subject?: string | null
        }
        Update: {
          email?: string
          event_type?: string
          id?: string
          newsletter_slug?: string | null
          occurred_at?: string | null
          payload?: Json | null
          received_at?: string | null
          resend_message_id?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      function_logs: {
        Row: {
          created_at: string
          duration_ms: number | null
          function_name: string
          id: string
          message: string | null
          metadata: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          function_name: string
          id?: string
          message?: string | null
          metadata?: Json | null
          status: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          function_name?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          status?: string
        }
        Relationships: []
      }
      internal_config: {
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
      newsletter_send_log: {
        Row: {
          error_message: string | null
          id: string
          newsletter_id: string | null
          resend_message_id: string | null
          send_status: string | null
          sent_at: string | null
          subject_variant: string
          subscriber_email: string
          variant_index: number
        }
        Insert: {
          error_message?: string | null
          id?: string
          newsletter_id?: string | null
          resend_message_id?: string | null
          send_status?: string | null
          sent_at?: string | null
          subject_variant: string
          subscriber_email: string
          variant_index: number
        }
        Update: {
          error_message?: string | null
          id?: string
          newsletter_id?: string | null
          resend_message_id?: string | null
          send_status?: string | null
          sent_at?: string | null
          subject_variant?: string
          subscriber_email?: string
          variant_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_send_log_newsletter_id_fkey"
            columns: ["newsletter_id"]
            isOneToOne: false
            referencedRelation: "newsletters"
            referencedColumns: ["id"]
          },
        ]
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
          subject_variants: Json | null
          theme: string | null
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
          subject_variants?: Json | null
          theme?: string | null
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
          subject_variants?: Json | null
          theme?: string | null
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
          external_referrer: string | null
          id: string
          last_subject_variant: string | null
          source_page: string | null
          subscribed: boolean
        }
        Insert: {
          created_at?: string
          email: string
          external_referrer?: string | null
          id?: string
          last_subject_variant?: string | null
          source_page?: string | null
          subscribed?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          external_referrer?: string | null
          id?: string
          last_subject_variant?: string | null
          source_page?: string | null
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
      function_health_24h: {
        Row: {
          avg_duration_ms: number | null
          failures: number | null
          function_name: string | null
          last_run: string | null
          successes: number | null
          total_runs: number | null
        }
        Relationships: []
      }
      recent_function_failures: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          function_name: string | null
          metadata: Json | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          function_name?: string | null
          metadata?: Json | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          function_name?: string | null
          metadata?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      subject_line_performance: {
        Row: {
          delivered_count: number | null
          failed_count: number | null
          newsletter: string | null
          open_rate_pct: number | null
          opens: number | null
          sent_count: number | null
          slug: string | null
          subject_variant: string | null
          variant_index: number | null
        }
        Relationships: []
      }
      subscriber_acquisition_summary: {
        Row: {
          first_seen: string | null
          last_seen: string | null
          source: string | null
          subscribers: number | null
        }
        Relationships: []
      }
      subscriber_growth_weekly: {
        Row: {
          new_subscribers: number | null
          total_subscribers: number | null
          week: string | null
        }
        Relationships: []
      }
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

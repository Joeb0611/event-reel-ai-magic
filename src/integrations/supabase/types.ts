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
      archived_content: {
        Row: {
          archived_at: string
          content_type: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          original_path: string | null
          project_id: string
          r2_object_key: string | null
          recovery_expires_at: string | null
          stream_video_id: string | null
          user_id: string
        }
        Insert: {
          archived_at?: string
          content_type: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          original_path?: string | null
          project_id: string
          r2_object_key?: string | null
          recovery_expires_at?: string | null
          stream_video_id?: string | null
          user_id: string
        }
        Update: {
          archived_at?: string
          content_type?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          original_path?: string | null
          project_id?: string
          r2_object_key?: string | null
          recovery_expires_at?: string | null
          stream_video_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          project_id: string | null
          tags: string[] | null
          upload_date: string | null
          user_id: string
        }
        Insert: {
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          project_id?: string | null
          tags?: string[] | null
          upload_date?: string | null
          user_id: string
        }
        Update: {
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          project_id?: string | null
          tags?: string[] | null
          upload_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      per_wedding_purchases: {
        Row: {
          amount: number
          created_at: string
          id: string
          project_id: string
          status: string
          stripe_payment_intent_id: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          project_id: string
          status?: string
          stripe_payment_intent_id?: string | null
          tier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          project_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "per_wedding_purchases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_jobs: {
        Row: {
          ai_insights: Json | null
          completed_at: string | null
          created_at: string
          detected_moments: Json | null
          error_message: string | null
          id: string
          local_video_path: string | null
          progress: number
          project_id: string
          r2_object_key: string | null
          r2_public_url: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_insights?: Json | null
          completed_at?: string | null
          created_at?: string
          detected_moments?: Json | null
          error_message?: string | null
          id?: string
          local_video_path?: string | null
          progress?: number
          project_id: string
          r2_object_key?: string | null
          r2_public_url?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_insights?: Json | null
          completed_at?: string | null
          created_at?: string
          detected_moments?: Json | null
          error_message?: string | null
          id?: string
          local_video_path?: string | null
          progress?: number
          project_id?: string
          r2_object_key?: string | null
          r2_public_url?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processing_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          archived_at: string | null
          bride_name: string | null
          budget: number | null
          created_at: string | null
          description: string | null
          edited_video_url: string | null
          expires_at: string | null
          groom_name: string | null
          guest_count: number | null
          id: string
          local_video_path: string | null
          location: string | null
          name: string | null
          privacy_settings: Json | null
          qr_code: string | null
          retention_policy: Json | null
          storage_tier: string | null
          title: string
          updated_at: string | null
          user_id: string
          venue: string | null
          wedding_date: string | null
        }
        Insert: {
          archived_at?: string | null
          bride_name?: string | null
          budget?: number | null
          created_at?: string | null
          description?: string | null
          edited_video_url?: string | null
          expires_at?: string | null
          groom_name?: string | null
          guest_count?: number | null
          id?: string
          local_video_path?: string | null
          location?: string | null
          name?: string | null
          privacy_settings?: Json | null
          qr_code?: string | null
          retention_policy?: Json | null
          storage_tier?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          venue?: string | null
          wedding_date?: string | null
        }
        Update: {
          archived_at?: string | null
          bride_name?: string | null
          budget?: number | null
          created_at?: string | null
          description?: string | null
          edited_video_url?: string | null
          expires_at?: string | null
          groom_name?: string | null
          guest_count?: number | null
          id?: string
          local_video_path?: string | null
          location?: string | null
          name?: string | null
          privacy_settings?: Json | null
          qr_code?: string | null
          retention_policy?: Json | null
          storage_tier?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          venue?: string | null
          wedding_date?: string | null
        }
        Relationships: []
      }
      storage_notifications: {
        Row: {
          created_at: string
          email_sent: boolean | null
          id: string
          notification_type: string
          project_id: string
          sent_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_sent?: boolean | null
          id?: string
          notification_type: string
          project_id: string
          sent_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_sent?: boolean | null
          id?: string
          notification_type?: string
          project_id?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          birthday: string | null
          created_at: string | null
          id: string
          partner_name: string | null
          updated_at: string | null
          user_name: string
        }
        Insert: {
          birthday?: string | null
          created_at?: string | null
          id: string
          partner_name?: string | null
          updated_at?: string | null
          user_name: string
        }
        Update: {
          birthday?: string | null
          created_at?: string | null
          id?: string
          partner_name?: string | null
          updated_at?: string | null
          user_name?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          projects_limit: number
          projects_used: number
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          projects_limit?: number
          projects_used?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          projects_limit?: number
          projects_used?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          edited: boolean | null
          file_path: string
          guest_message: string | null
          guest_name: string | null
          id: string
          name: string
          project_id: string
          size: number
          stream_playback_url: string | null
          stream_status: string | null
          stream_video_id: string | null
          uploaded_at: string
          uploaded_by_guest: boolean | null
          user_id: string
        }
        Insert: {
          edited?: boolean | null
          file_path: string
          guest_message?: string | null
          guest_name?: string | null
          id?: string
          name: string
          project_id: string
          size?: number
          stream_playback_url?: string | null
          stream_status?: string | null
          stream_video_id?: string | null
          uploaded_at?: string
          uploaded_by_guest?: boolean | null
          user_id: string
        }
        Update: {
          edited?: boolean | null
          file_path?: string
          guest_message?: string | null
          guest_name?: string | null
          id?: string
          name?: string
          project_id?: string
          size?: number
          stream_playback_url?: string | null
          stream_status?: string | null
          stream_video_id?: string | null
          uploaded_at?: string
          uploaded_by_guest?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_expired_content: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_project_by_qr: {
        Args: { qr_code_param: string }
        Returns: {
          id: string
          name: string
          bride_name: string
          groom_name: string
          wedding_date: string
          location: string
          privacy_settings: Json
        }[]
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

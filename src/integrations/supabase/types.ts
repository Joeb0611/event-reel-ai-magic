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
      processing_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          detected_moments: Json | null
          error_message: string | null
          id: string
          progress: number | null
          project_id: string
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          detected_moments?: Json | null
          error_message?: string | null
          id?: string
          progress?: number | null
          project_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          detected_moments?: Json | null
          error_message?: string | null
          id?: string
          progress?: number | null
          project_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          bride_name: string | null
          created_at: string | null
          description: string | null
          edited_video_url: string | null
          groom_name: string | null
          id: string
          location: string | null
          name: string
          privacy_settings: Json | null
          qr_code: string | null
          theme: string | null
          user_id: string
          wedding_date: string | null
        }
        Insert: {
          bride_name?: string | null
          created_at?: string | null
          description?: string | null
          edited_video_url?: string | null
          groom_name?: string | null
          id?: string
          location?: string | null
          name: string
          privacy_settings?: Json | null
          qr_code?: string | null
          theme?: string | null
          user_id: string
          wedding_date?: string | null
        }
        Update: {
          bride_name?: string | null
          created_at?: string | null
          description?: string | null
          edited_video_url?: string | null
          groom_name?: string | null
          id?: string
          location?: string | null
          name?: string
          privacy_settings?: Json | null
          qr_code?: string | null
          theme?: string | null
          user_id?: string
          wedding_date?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          ai_analysis: Json | null
          edited: boolean | null
          file_path: string
          guest_message: string | null
          guest_name: string | null
          id: string
          name: string
          processing_job_id: string | null
          project_id: string
          size: number
          uploaded_at: string | null
          uploaded_by_guest: boolean | null
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          edited?: boolean | null
          file_path: string
          guest_message?: string | null
          guest_name?: string | null
          id?: string
          name: string
          processing_job_id?: string | null
          project_id: string
          size: number
          uploaded_at?: string | null
          uploaded_by_guest?: boolean | null
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          edited?: boolean | null
          file_path?: string
          guest_message?: string | null
          guest_name?: string | null
          id?: string
          name?: string
          processing_job_id?: string | null
          project_id?: string
          size?: number
          uploaded_at?: string | null
          uploaded_by_guest?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_processing_job_id_fkey"
            columns: ["processing_job_id"]
            isOneToOne: false
            referencedRelation: "processing_jobs"
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

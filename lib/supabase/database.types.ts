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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      calibrations: {
        Row: {
          created_at: string
          id: string
          pages: number
          seconds: number
          source: string
          subject_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pages: number
          seconds: number
          source: string
          subject_id?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          pages?: number
          seconds?: number
          source?: string
          subject_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calibrations_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_books: {
        Row: {
          authors: string
          created_at: string
          edition: string
          id: string
          publisher: string | null
          slug: string
          source_note: string | null
          title: string
          total_pages: number | null
          updated_at: string
          verified: boolean
          year: number | null
        }
        Insert: {
          authors: string
          created_at?: string
          edition: string
          id?: string
          publisher?: string | null
          slug: string
          source_note?: string | null
          title: string
          total_pages?: number | null
          updated_at?: string
          verified?: boolean
          year?: number | null
        }
        Update: {
          authors?: string
          created_at?: string
          edition?: string
          id?: string
          publisher?: string | null
          slug?: string
          source_note?: string | null
          title?: string
          total_pages?: number | null
          updated_at?: string
          verified?: boolean
          year?: number | null
        }
        Relationships: []
      }
      catalog_chapters: {
        Row: {
          book_id: string
          id: string
          position: number
          title: string
        }
        Insert: {
          book_id: string
          id?: string
          position: number
          title: string
        }
        Update: {
          book_id?: string
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "catalog_books"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_topics: {
        Row: {
          chapter_id: string
          id: string
          page_end: number
          page_start: number
          position: number
          title: string
        }
        Insert: {
          chapter_id: string
          id?: string
          page_end: number
          page_start: number
          position: number
          title: string
        }
        Update: {
          chapter_id?: string
          id?: string
          page_end?: number
          page_start?: number
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "catalog_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          id: string
          position: number
          subject_id: string
          title: string
        }
        Insert: {
          id?: string
          position: number
          subject_id: string
          title: string
        }
        Update: {
          id?: string
          position?: number
          subject_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bartle_primary: string | null
          bartle_scores: Json | null
          break_min: number
          created_at: string
          display_name: string | null
          focus_min: number
          freezes: number
          id: string
          is_admin: boolean
          is_demo: boolean
          last_closed_day: string | null
          league_opt_in: boolean | null
          level: number
          long_break_min: number
          min_per_page: number | null
          public_profile: boolean
          reminder_time: string | null
          streak_best: number
          streak_current: number
          theme: string
          timezone: string
          username: string | null
          xp_total: number
        }
        Insert: {
          avatar_url?: string | null
          bartle_primary?: string | null
          bartle_scores?: Json | null
          break_min?: number
          created_at?: string
          display_name?: string | null
          focus_min?: number
          freezes?: number
          id: string
          is_admin?: boolean
          is_demo?: boolean
          last_closed_day?: string | null
          league_opt_in?: boolean | null
          level?: number
          long_break_min?: number
          min_per_page?: number | null
          public_profile?: boolean
          reminder_time?: string | null
          streak_best?: number
          streak_current?: number
          theme?: string
          timezone?: string
          username?: string | null
          xp_total?: number
        }
        Update: {
          avatar_url?: string | null
          bartle_primary?: string | null
          bartle_scores?: Json | null
          break_min?: number
          created_at?: string
          display_name?: string | null
          focus_min?: number
          freezes?: number
          id?: string
          is_admin?: boolean
          is_demo?: boolean
          last_closed_day?: string | null
          league_opt_in?: boolean | null
          level?: number
          long_break_min?: number
          min_per_page?: number | null
          public_profile?: boolean
          reminder_time?: string | null
          streak_best?: number
          streak_current?: number
          theme?: string
          timezone?: string
          username?: string | null
          xp_total?: number
        }
        Relationships: []
      }
      subjects: {
        Row: {
          archived: boolean
          catalog_book_id: string | null
          color: string
          created_at: string
          daily_goal: number | null
          goal_date: string | null
          id: string
          min_per_page: number | null
          source: string
          title: string
          user_id: string
          video_speed: number
          youtube_playlist_id: string | null
        }
        Insert: {
          archived?: boolean
          catalog_book_id?: string | null
          color?: string
          created_at?: string
          daily_goal?: number | null
          goal_date?: string | null
          id?: string
          min_per_page?: number | null
          source: string
          title: string
          user_id?: string
          video_speed?: number
          youtube_playlist_id?: string | null
        }
        Update: {
          archived?: boolean
          catalog_book_id?: string | null
          color?: string
          created_at?: string
          daily_goal?: number | null
          goal_date?: string | null
          id?: string
          min_per_page?: number | null
          source?: string
          title?: string
          user_id?: string
          video_speed?: number
          youtube_playlist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_catalog_book_id_fkey"
            columns: ["catalog_book_id"]
            isOneToOne: false
            referencedRelation: "catalog_books"
            referencedColumns: ["id"]
          },
        ]
      }
      telemetry_events: {
        Row: {
          anon_id: string | null
          created_at: string
          id: number
          name: string
          props: Json
          user_id: string | null
        }
        Insert: {
          anon_id?: string | null
          created_at?: string
          id?: never
          name: string
          props?: Json
          user_id?: string | null
        }
        Update: {
          anon_id?: string | null
          created_at?: string
          id?: never
          name?: string
          props?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      topics: {
        Row: {
          chapter_id: string
          done_at: string | null
          duration_sec: number | null
          id: string
          page_end: number | null
          page_start: number | null
          position: number
          title: string
          youtube_video_id: string | null
        }
        Insert: {
          chapter_id: string
          done_at?: string | null
          duration_sec?: number | null
          id?: string
          page_end?: number | null
          page_start?: number | null
          position: number
          title: string
          youtube_video_id?: string | null
        }
        Update: {
          chapter_id?: string
          done_at?: string | null
          duration_sec?: number | null
          id?: string
          page_end?: number | null
          page_start?: number | null
          position?: number
          title?: string
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_manual_subject: {
        Args: {
          p_chapters: Json
          p_color: string
          p_daily_goal?: number
          p_goal_date?: string
          p_title: string
        }
        Returns: string
      }
      create_subject_from_catalog: {
        Args: {
          p_book_id: string
          p_color: string
          p_daily_goal?: number
          p_goal_date?: string
          p_title: string
          p_topic_ids: string[]
        }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      is_valid_timezone: { Args: { tz: string }; Returns: boolean }
      move_chapter: {
        Args: { p_chapter_id: string; p_direction: number }
        Returns: undefined
      }
      move_topic: {
        Args: { p_direction: number; p_topic_id: string }
        Returns: undefined
      }
      record_calibration: {
        Args: {
          p_pages: number
          p_seconds: number
          p_set_default?: boolean
          p_source: string
          p_subject_id?: string
        }
        Returns: number
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
    Enums: {},
  },
} as const

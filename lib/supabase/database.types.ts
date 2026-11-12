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
      badges: {
        Row: {
          code: string
          hidden: boolean
          position: number
          rarity: string
          weight: number
        }
        Insert: {
          code: string
          hidden?: boolean
          position: number
          rarity: string
          weight: number
        }
        Update: {
          code?: string
          hidden?: boolean
          position?: number
          rarity?: string
          weight?: number
        }
        Relationships: []
      }
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
      feature_flags: {
        Row: {
          enabled: boolean
          key: string
          rollout: Json
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          key: string
          rollout?: Json
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          key?: string
          rollout?: Json
          updated_at?: string
        }
        Relationships: []
      }
      feed_events: {
        Row: {
          created_at: string
          dedupe_key: string
          id: string
          payload: Json
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dedupe_key: string
          id?: string
          payload?: Json
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          dedupe_key?: string
          id?: string
          payload?: Json
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          followee_id: string
          follower_id: string
        }
        Insert: {
          created_at?: string
          followee_id: string
          follower_id: string
        }
        Update: {
          created_at?: string
          followee_id?: string
          follower_id?: string
        }
        Relationships: []
      }
      league_groups: {
        Row: {
          band_max: number
          band_min: number
          created_at: string
          division: string
          id: string
          week_start: string
        }
        Insert: {
          band_max: number
          band_min: number
          created_at?: string
          division: string
          id?: string
          week_start: string
        }
        Update: {
          band_max?: number
          band_min?: number
          created_at?: string
          division?: string
          id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_groups_week_start_fkey"
            columns: ["week_start"]
            isOneToOne: false
            referencedRelation: "league_weeks"
            referencedColumns: ["week_start"]
          },
        ]
      }
      league_members: {
        Row: {
          final_rank: number | null
          group_id: string
          joined_at: string
          outcome: string | null
          result_seen_at: string | null
          user_id: string
          week_start: string
          xp_week: number
        }
        Insert: {
          final_rank?: number | null
          group_id: string
          joined_at?: string
          outcome?: string | null
          result_seen_at?: string | null
          user_id: string
          week_start: string
          xp_week?: number
        }
        Update: {
          final_rank?: number | null
          group_id?: string
          joined_at?: string
          outcome?: string | null
          result_seen_at?: string | null
          user_id?: string
          week_start?: string
          xp_week?: number
        }
        Relationships: [
          {
            foreignKeyName: "league_members_group_id_week_start_fkey"
            columns: ["group_id", "week_start"]
            isOneToOne: false
            referencedRelation: "league_groups"
            referencedColumns: ["id", "week_start"]
          },
        ]
      }
      league_weeks: {
        Row: {
          closed_at: string | null
          opened_at: string
          week_start: string
        }
        Insert: {
          closed_at?: string | null
          opened_at?: string
          week_start: string
        }
        Update: {
          closed_at?: string | null
          opened_at?: string
          week_start?: string
        }
        Relationships: []
      }
      pomodoro_sessions: {
        Row: {
          cancel_reason: string | null
          ended_at: string | null
          id: string
          pages_logged: number | null
          paused_at: string | null
          paused_sec: number
          pauses: number
          planned_focus_sec: number
          started_at: string
          status: string
          subject_id: string | null
          topic_id: string | null
          user_id: string
          xp_awarded: number
        }
        Insert: {
          cancel_reason?: string | null
          ended_at?: string | null
          id?: string
          pages_logged?: number | null
          paused_at?: string | null
          paused_sec?: number
          pauses?: number
          planned_focus_sec: number
          started_at?: string
          status?: string
          subject_id?: string | null
          topic_id?: string | null
          user_id?: string
          xp_awarded?: number
        }
        Update: {
          cancel_reason?: string | null
          ended_at?: string | null
          id?: string
          pages_logged?: number | null
          paused_at?: string | null
          paused_sec?: number
          pauses?: number
          planned_focus_sec?: number
          started_at?: string
          status?: string
          subject_id?: string | null
          topic_id?: string | null
          user_id?: string
          xp_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "pomodoro_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pomodoro_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bartle_answers: Json | null
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
          league_division: string
          league_invite_dismissed_at: string | null
          league_opt_in: boolean | null
          level: number
          level_seen: number
          long_break_min: number
          min_per_page: number | null
          onboarding_step: string
          public_profile: boolean
          reactions_seen_at: string | null
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
          bartle_answers?: Json | null
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
          league_division?: string
          league_invite_dismissed_at?: string | null
          league_opt_in?: boolean | null
          level?: number
          level_seen?: number
          long_break_min?: number
          min_per_page?: number | null
          onboarding_step?: string
          public_profile?: boolean
          reactions_seen_at?: string | null
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
          bartle_answers?: Json | null
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
          league_division?: string
          league_invite_dismissed_at?: string | null
          league_opt_in?: boolean | null
          level?: number
          level_seen?: number
          long_break_min?: number
          min_per_page?: number | null
          onboarding_step?: string
          public_profile?: boolean
          reactions_seen_at?: string | null
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
      reactions: {
        Row: {
          created_at: string
          event_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "feed_events"
            referencedColumns: ["id"]
          },
        ]
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
          pace_ema: number | null
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
          pace_ema?: number | null
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
          pace_ema?: number | null
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
      themes: {
        Row: {
          code: string
          unlock_rule: string
        }
        Insert: {
          code: string
          unlock_rule: string
        }
        Update: {
          code?: string
          unlock_rule?: string
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
      user_cohorts: {
        Row: {
          assigned_at: string
          cohort: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          cohort: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          cohort?: string
          user_id?: string
        }
        Relationships: []
      }
      user_daily_badges: {
        Row: {
          badge_code: string
          created_at: string
          day: string
          seen_at: string | null
          user_id: string
        }
        Insert: {
          badge_code: string
          created_at?: string
          day: string
          seen_at?: string | null
          user_id: string
        }
        Update: {
          badge_code?: string
          created_at?: string
          day?: string
          seen_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_badges_badge_code_fkey"
            columns: ["badge_code"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["code"]
          },
        ]
      }
      user_themes: {
        Row: {
          seen_at: string | null
          source_week: string | null
          tab_seen_at: string | null
          theme_code: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          seen_at?: string | null
          source_week?: string | null
          tab_seen_at?: string | null
          theme_code: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          seen_at?: string | null
          source_week?: string | null
          tab_seen_at?: string | null
          theme_code?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_themes_theme_code_fkey"
            columns: ["theme_code"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["code"]
          },
        ]
      }
      weekly_harvests: {
        Row: {
          days: number
          tier: string
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          days: number
          tier: string
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          days?: number
          tier?: string
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          amount: number
          created_at: string
          dedupe_key: string
          id: number
          ref_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          dedupe_key: string
          id?: never
          ref_id?: string | null
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          dedupe_key?: string
          id?: never
          ref_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_pace_suggestion: {
        Args: { p_subject_id: string }
        Returns: number
      }
      apply_day_close: {
        Args: {
          p_badges: Json
          p_expected: string
          p_freezes: number
          p_harvests: Json
          p_last_closed: string
          p_streak: number
          p_streak_best: number
          p_themes: Json
          p_user: string
        }
        Returns: boolean
      }
      apply_league_close: {
        Args: { p_results: Json; p_week: string }
        Returns: boolean
      }
      apply_league_open: {
        Args: { p_groups: Json; p_week: string }
        Returns: boolean
      }
      apply_xp: {
        Args: { p_events: Json; p_user: string }
        Returns: {
          inserted: string[]
          new_total: number
          old_total: number
        }[]
      }
      cancel_pomodoro: {
        Args: { p_id: string; p_reason?: string }
        Returns: undefined
      }
      complete_pomodoro: {
        Args: { p_id: string }
        Returns: {
          focus_sec: number
          fruits_today: number
        }[]
      }
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
      create_youtube_subject: {
        Args: {
          p_chapter_title: string
          p_color: string
          p_playlist_id: string
          p_speed: number
          p_title: string
          p_user: string
          p_videos: Json
        }
        Returns: string
      }
      dismiss_pace_suggestion: {
        Args: { p_subject_id: string }
        Returns: undefined
      }
      follow_user: { Args: { p_username: string }; Returns: boolean }
      friends_feed: {
        Args: never
        Returns: {
          created_at: string
          id: string
          is_demo: boolean
          payload: Json
          reacted: boolean
          type: string
          username: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_valid_timezone: { Args: { tz: string }; Returns: boolean }
      landing_stats: {
        Args: never
        Returns: {
          focus_sec_week: number
          gardeners: number
          pomodoros_week: number
        }[]
      }
      league_focus_seconds: {
        Args: { p_from: string; p_to: string; p_users: string[] }
        Returns: {
          focus_sec: number
          user_id: string
        }[]
      }
      league_standings: {
        Args: never
        Returns: {
          band_max: number
          band_min: number
          division: string
          group_id: string
          is_demo: boolean
          is_me: boolean
          last_xp_at: string
          public_profile: boolean
          username: string
          week_start: string
          xp: number
        }[]
      }
      league_suggestions: {
        Args: never
        Returns: {
          following: boolean
          is_demo: boolean
          level: number
          username: string
        }[]
      }
      league_week_xp: {
        Args: { p_week: string }
        Returns: {
          division: string
          group_id: string
          last_xp_at: string
          user_id: string
          username: string
          xp: number
        }[]
      }
      log_pomodoro_pages: {
        Args: { p_finish_topic?: boolean; p_id: string; p_pages: number }
        Returns: {
          current_pace: number
          ema: number
          observed: number
          suggest: boolean
        }[]
      }
      move_chapter: {
        Args: { p_chapter_id: string; p_direction: number }
        Returns: undefined
      }
      move_topic: {
        Args: { p_direction: number; p_topic_id: string }
        Returns: undefined
      }
      pause_pomodoro: {
        Args: { p_id: string }
        Returns: {
          cancel_reason: string | null
          ended_at: string | null
          id: string
          pages_logged: number | null
          paused_at: string | null
          paused_sec: number
          pauses: number
          planned_focus_sec: number
          started_at: string
          status: string
          subject_id: string | null
          topic_id: string | null
          user_id: string
          xp_awarded: number
        }
        SetofOptions: {
          from: "*"
          to: "pomodoro_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      pomodoro_completion_ratio: { Args: never; Returns: number }
      pomodoro_paused_total: {
        Args: { s: Database["public"]["Tables"]["pomodoro_sessions"]["Row"] }
        Returns: number
      }
      public_profile: { Args: { p_username: string }; Returns: Json }
      received_reactions: {
        Args: never
        Returns: {
          created_at: string
          event_id: string
          from_username: string
          payload: Json
          type: string
        }[]
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
      resume_pomodoro: {
        Args: { p_id: string }
        Returns: {
          cancel_reason: string | null
          ended_at: string | null
          id: string
          pages_logged: number | null
          paused_at: string | null
          paused_sec: number
          pauses: number
          planned_focus_sec: number
          started_at: string
          status: string
          subject_id: string | null
          topic_id: string | null
          user_id: string
          xp_awarded: number
        }
        SetofOptions: {
          from: "*"
          to: "pomodoro_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      search_profiles: {
        Args: { p_prefix: string }
        Returns: {
          following: boolean
          is_demo: boolean
          level: number
          username: string
        }[]
      }
      send_reaction: { Args: { p_event: string }; Returns: boolean }
      start_pomodoro: {
        Args: { p_subject_id?: string; p_topic_id?: string }
        Returns: {
          cancel_reason: string | null
          ended_at: string | null
          id: string
          pages_logged: number | null
          paused_at: string | null
          paused_sec: number
          pauses: number
          planned_focus_sec: number
          started_at: string
          status: string
          subject_id: string | null
          topic_id: string | null
          user_id: string
          xp_awarded: number
        }
        SetofOptions: {
          from: "*"
          to: "pomodoro_sessions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      unfollow_user: { Args: { p_username: string }; Returns: undefined }
      username_available: { Args: { p_username: string }; Returns: boolean }
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

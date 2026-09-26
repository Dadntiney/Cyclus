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
      buddy_conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      buddy_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message: string
          role: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message: string
          role: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "buddy_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "buddy_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_logs: {
        Row: {
          created_at: string
          date: string
          flow: string | null
          id: string
          menstruation: boolean
          notes: string | null
          symptoms: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          flow?: string | null
          id?: string
          menstruation?: boolean
          notes?: string | null
          symptoms?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          flow?: string | null
          id?: string
          menstruation?: boolean
          notes?: string | null
          symptoms?: string[]
          user_id?: string
        }
        Relationships: []
      }
      cycle_profiles: {
        Row: {
          average_cycle_length: number | null
          created_at: string
          has_cycle: boolean
          id: string
          last_period_start: string | null
          perimenopause_information: string | null
          regularity: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_cycle_length?: number | null
          created_at?: string
          has_cycle?: boolean
          id?: string
          last_period_start?: string | null
          perimenopause_information?: string | null
          regularity?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_cycle_length?: number | null
          created_at?: string
          has_cycle?: boolean
          id?: string
          last_period_start?: string | null
          perimenopause_information?: string | null
          regularity?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          created_at: string
          date: string
          energy: number | null
          id: string
          mood: number | null
          need: string | null
          notes: string | null
          sleep: number | null
          stress: number | null
          symptoms: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          energy?: number | null
          id?: string
          mood?: number | null
          need?: string | null
          notes?: string | null
          sleep?: number | null
          stress?: number | null
          symptoms?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          energy?: number | null
          id?: string
          mood?: number | null
          need?: string | null
          notes?: string | null
          sleep?: number | null
          stress?: number | null
          symptoms?: string[]
          user_id?: string
        }
        Relationships: []
      }
      daily_tips: {
        Row: {
          category: string
          created_at: string
          fun_fact: string | null
          id: string
          practical_example: string
          quiz_answer_explanation: string | null
          quiz_options: Json | null
          quiz_question: string | null
          short_explanation: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          fun_fact?: string | null
          id?: string
          practical_example: string
          quiz_answer_explanation?: string | null
          quiz_options?: Json | null
          quiz_question?: string | null
          short_explanation: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          fun_fact?: string | null
          id?: string
          practical_example?: string
          quiz_answer_explanation?: string | null
          quiz_options?: Json | null
          quiz_question?: string | null
          short_explanation?: string
          title?: string
        }
        Relationships: []
      }
      exercise_favorites: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_favorites_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          common_mistakes: string | null
          demo_image_url: string | null
          demo_video_url: string | null
          fun_fact: string | null
          id: string
          instructions: string | null
          muscle_group: string | null
          name: string
          order_index: number
          reps: string | null
          sets: number | null
          steps: Json | null
          why_it_helps: string | null
          workout_id: string
        }
        Insert: {
          common_mistakes?: string | null
          demo_image_url?: string | null
          demo_video_url?: string | null
          fun_fact?: string | null
          id?: string
          instructions?: string | null
          muscle_group?: string | null
          name: string
          order_index?: number
          reps?: string | null
          sets?: number | null
          steps?: Json | null
          why_it_helps?: string | null
          workout_id: string
        }
        Update: {
          common_mistakes?: string | null
          demo_image_url?: string | null
          demo_video_url?: string | null
          fun_fact?: string | null
          id?: string
          instructions?: string | null
          muscle_group?: string | null
          name?: string
          order_index?: number
          reps?: string | null
          sets?: number | null
          steps?: Json | null
          why_it_helps?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          breakfast: string | null
          created_at: string
          date: string
          dinner: string | null
          id: string
          lunch: string | null
          snack: string | null
          user_id: string
        }
        Insert: {
          breakfast?: string | null
          created_at?: string
          date: string
          dinner?: string | null
          id?: string
          lunch?: string | null
          snack?: string | null
          user_id: string
        }
        Update: {
          breakfast?: string | null
          created_at?: string
          date?: string
          dinner?: string | null
          id?: string
          lunch?: string | null
          snack?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_breakfast_fkey"
            columns: ["breakfast"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_dinner_fkey"
            columns: ["dinner"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_lunch_fkey"
            columns: ["lunch"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plans_snack_fkey"
            columns: ["snack"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          medication_id: string
          taken: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          medication_id: string
          taken?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          medication_id?: string
          taken?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          category: string
          created_at: string
          dosage: string | null
          end_date: string | null
          form: string | null
          hormone_type: string | null
          id: string
          name: string
          notes: string | null
          reminder_enabled: boolean
          schedule_days: number[] | null
          schedule_days_off: number | null
          schedule_days_on: number | null
          schedule_type: string
          start_date: string | null
          time_of_day: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          form?: string | null
          hormone_type?: string | null
          id?: string
          name: string
          notes?: string | null
          reminder_enabled?: boolean
          schedule_days?: number[] | null
          schedule_days_off?: number | null
          schedule_days_on?: number | null
          schedule_type: string
          start_date?: string | null
          time_of_day?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          form?: string | null
          hormone_type?: string | null
          id?: string
          name?: string
          notes?: string | null
          reminder_enabled?: boolean
          schedule_days?: number[] | null
          schedule_days_off?: number | null
          schedule_days_on?: number | null
          schedule_type?: string
          start_date?: string | null
          time_of_day?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          buddy_message_frequency: string | null
          buddy_styles: string[]
          created_at: string
          goal_weight_kg: number | null
          goals: string[]
          health_conditions: string[]
          height_cm: number | null
          hormonal_medication_status: string | null
          id: string
          mental_wellbeing_categories: string[]
          mental_wellbeing_enabled: boolean | null
          morning_reminder_content_type: string
          morning_reminder_days: number[]
          morning_reminder_enabled: boolean | null
          morning_reminder_time: string
          motivation: string | null
          movement_enabled: boolean
          movement_limitations: string[]
          name: string | null
          nutrition_enabled: boolean
          nutrition_preferences: string[]
          nutrition_style: string
          onboarding_completed: boolean
          personal_note: string | null
          show_medication_on_dashboard: boolean
          sleep_tracking_enabled: boolean | null
          track_flow_intensity: boolean
          training_frequency: number | null
          training_preferences: string[]
          updated_at: string
          weight_kg: number | null
          wellness_preference: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          buddy_message_frequency?: string | null
          buddy_styles?: string[]
          created_at?: string
          goal_weight_kg?: number | null
          goals?: string[]
          health_conditions?: string[]
          height_cm?: number | null
          hormonal_medication_status?: string | null
          id: string
          mental_wellbeing_categories?: string[]
          mental_wellbeing_enabled?: boolean | null
          morning_reminder_content_type?: string
          morning_reminder_days?: number[]
          morning_reminder_enabled?: boolean | null
          morning_reminder_time?: string
          motivation?: string | null
          movement_enabled?: boolean
          movement_limitations?: string[]
          name?: string | null
          nutrition_enabled?: boolean
          nutrition_preferences?: string[]
          nutrition_style?: string
          onboarding_completed?: boolean
          personal_note?: string | null
          show_medication_on_dashboard?: boolean
          sleep_tracking_enabled?: boolean | null
          track_flow_intensity?: boolean
          training_frequency?: number | null
          training_preferences?: string[]
          updated_at?: string
          weight_kg?: number | null
          wellness_preference?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          buddy_message_frequency?: string | null
          buddy_styles?: string[]
          created_at?: string
          goal_weight_kg?: number | null
          goals?: string[]
          health_conditions?: string[]
          height_cm?: number | null
          hormonal_medication_status?: string | null
          id?: string
          mental_wellbeing_categories?: string[]
          mental_wellbeing_enabled?: boolean | null
          morning_reminder_content_type?: string
          morning_reminder_days?: number[]
          morning_reminder_enabled?: boolean | null
          morning_reminder_time?: string
          motivation?: string | null
          movement_enabled?: boolean
          movement_limitations?: string[]
          name?: string | null
          nutrition_enabled?: boolean
          nutrition_preferences?: string[]
          nutrition_style?: string
          onboarding_completed?: boolean
          personal_note?: string | null
          show_medication_on_dashboard?: boolean
          sleep_tracking_enabled?: boolean | null
          track_flow_intensity?: boolean
          training_frequency?: number | null
          training_preferences?: string[]
          updated_at?: string
          weight_kg?: number | null
          wellness_preference?: string | null
        }
        Relationships: []
      }
      push_notification_log: {
        Row: {
          date: string
          id: string
          sent_at: string
          source_id: string
          source_type: string
          user_id: string
        }
        Insert: {
          date: string
          id?: string
          sent_at?: string
          source_id: string
          source_type: string
          user_id: string
        }
        Update: {
          date?: string
          id?: string
          sent_at?: string
          source_id?: string
          source_type?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          last_seen_at: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          last_seen_at?: string
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_seen_at?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          category: string[]
          created_at: string
          description: string | null
          difficulty: string | null
          id: string
          image_url: string | null
          ingredients: Json
          instructions: string | null
          is_budget: boolean
          low_carb_variant: string | null
          meal_prep_tip: string | null
          nutrition_information: Json
          optional_ingredients: Json | null
          preparation_time: number | null
          servings: number | null
          steps: Json | null
          storage_tip: string | null
          title: string
        }
        Insert: {
          category?: string[]
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: string | null
          is_budget?: boolean
          low_carb_variant?: string | null
          meal_prep_tip?: string | null
          nutrition_information?: Json
          optional_ingredients?: Json | null
          preparation_time?: number | null
          servings?: number | null
          steps?: Json | null
          storage_tip?: string | null
          title: string
        }
        Update: {
          category?: string[]
          created_at?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          ingredients?: Json
          instructions?: string | null
          is_budget?: boolean
          low_carb_variant?: string | null
          meal_prep_tip?: string | null
          nutrition_information?: Json
          optional_ingredients?: Json | null
          preparation_time?: number | null
          servings?: number | null
          steps?: Json | null
          storage_tip?: string | null
          title?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          days: number[]
          enabled: boolean
          id: string
          label: string | null
          time: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days?: number[]
          enabled?: boolean
          id?: string
          label?: string | null
          time?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days?: number[]
          enabled?: boolean
          id?: string
          label?: string | null
          time?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sleep_entries: {
        Row: {
          bedtime: string | null
          created_at: string
          date: string
          id: string
          sleep_quality: string | null
          updated_at: string
          user_id: string
          wake_count: number | null
          wake_feeling: string | null
          wake_time: string | null
        }
        Insert: {
          bedtime?: string | null
          created_at?: string
          date: string
          id?: string
          sleep_quality?: string | null
          updated_at?: string
          user_id: string
          wake_count?: number | null
          wake_feeling?: string | null
          wake_time?: string | null
        }
        Update: {
          bedtime?: string | null
          created_at?: string
          date?: string
          id?: string
          sleep_quality?: string | null
          updated_at?: string
          user_id?: string
          wake_count?: number | null
          wake_feeling?: string | null
          wake_time?: string | null
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          completed: boolean
          created_at: string
          date: string
          id: string
          user_id: string
          workout_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          date?: string
          id?: string
          user_id: string
          workout_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          date?: string
          id?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string
          duration: number
          id: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty: string
          duration: number
          id?: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string
          duration?: number
          id?: string
          title?: string
          type?: string
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

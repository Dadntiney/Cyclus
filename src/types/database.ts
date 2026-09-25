export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          id: string
          menstruation: boolean
          notes: string | null
          symptoms: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          menstruation?: boolean
          notes?: string | null
          symptoms?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
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
          notes?: string | null
          sleep?: number | null
          stress?: number | null
          symptoms?: string[]
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          id: string
          instructions: string | null
          muscle_group: string | null
          name: string
          order_index: number
          reps: string | null
          sets: number | null
          workout_id: string
        }
        Insert: {
          id?: string
          instructions?: string | null
          muscle_group?: string | null
          name: string
          order_index?: number
          reps?: string | null
          sets?: number | null
          workout_id: string
        }
        Update: {
          id?: string
          instructions?: string | null
          muscle_group?: string | null
          name?: string
          order_index?: number
          reps?: string | null
          sets?: number | null
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
      profiles: {
        Row: {
          age: number | null
          created_at: string
          goals: string[]
          id: string
          name: string | null
          nutrition_preferences: string[]
          onboarding_completed: boolean
          training_frequency: number | null
          training_preferences: string[]
          updated_at: string
          wellness_preference: string | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          goals?: string[]
          id: string
          name?: string | null
          nutrition_preferences?: string[]
          onboarding_completed?: boolean
          training_frequency?: number | null
          training_preferences?: string[]
          updated_at?: string
          wellness_preference?: string | null
        }
        Update: {
          age?: number | null
          created_at?: string
          goals?: string[]
          id?: string
          name?: string | null
          nutrition_preferences?: string[]
          onboarding_completed?: boolean
          training_frequency?: number | null
          training_preferences?: string[]
          updated_at?: string
          wellness_preference?: string | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          category: string[]
          created_at: string
          description: string | null
          id: string
          ingredients: Json
          instructions: string | null
          nutrition_information: Json
          preparation_time: number | null
          title: string
        }
        Insert: {
          category?: string[]
          created_at?: string
          description?: string | null
          id?: string
          ingredients?: Json
          instructions?: string | null
          nutrition_information?: Json
          preparation_time?: number | null
          title: string
        }
        Update: {
          category?: string[]
          created_at?: string
          description?: string | null
          id?: string
          ingredients?: Json
          instructions?: string | null
          nutrition_information?: Json
          preparation_time?: number | null
          title?: string
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

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]

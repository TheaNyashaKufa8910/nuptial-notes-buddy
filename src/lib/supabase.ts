import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type Wedding = {
  id: string;
  user_id: string;
  partner_email?: string;
  wedding_date?: string;
  location?: string;
  theme?: string;
  total_budget?: number;
  created_at: string;
  updated_at: string;
};

export type BudgetCategory = {
  id: string;
  wedding_id: string;
  name: string;
  icon?: string;
  budgeted: number;
  spent: number;
  created_at: string;
  updated_at: string;
};

export type Guest = {
  id: string;
  wedding_id: string;
  name: string;
  email?: string;
  category?: string;
  rsvp_status: 'invited' | 'confirmed' | 'declined';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  wedding_id: string;
  title: string;
  due_date?: string;
  assigned_to?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type Milestone = {
  id: string;
  wedding_id: string;
  title: string;
  description?: string;
  timeframe: string;
  progress: number;
  created_at: string;
  updated_at: string;
};

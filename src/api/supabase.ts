import { createClient } from '@supabase/supabase-js';

// 环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl;
}

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// 数据库表名
export const TABLES = {
  RESOURCES: 'resources',
  COURSES: 'courses',
  COURSE_SETS: 'course_sets',
  SKILLS: 'skills',
  USERS: 'users',
  EVALUATIONS: 'evaluations',
  USER_INTERACTIONS: 'user_interactions',
  CONTENT_QUEUE: 'content_queue'
} as const;

// 辅助函数
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });
  return { data, error };
}

export async function signOut() {
  return supabase.auth.signOut();
}
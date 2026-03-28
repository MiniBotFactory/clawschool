import { supabase } from './supabase';
import { auth as localAuth } from './storage';

const DEFAULT_ADMIN_EMAIL = 'wmango@hotmail.com';

export type AdminRole = 'super_admin' | 'admin' | 'editor';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
  lastLogin?: string;
}

function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url;
}

async function getUserEmail(): Promise<string | null> {
  const localUser = localAuth.getCurrentUser();
  if (localUser?.email) return localUser.email;

  if (isSupabaseConfigured()) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.email || null;
    } catch {
      return null;
    }
  }

  return null;
}

async function supabaseIsAdmin(email: string): Promise<boolean> {
  if (email === DEFAULT_ADMIN_EMAIL) return true;
  try {
    const { data } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();
    return !!data;
  } catch {
    return false;
  }
}

async function supabaseGetRole(email: string): Promise<AdminRole | null> {
  if (email === DEFAULT_ADMIN_EMAIL) return 'super_admin';
  try {
    const { data } = await supabase
      .from('admins')
      .select('role')
      .eq('email', email)
      .single();
    return (data?.role as AdminRole) || null;
  } catch {
    return null;
  }
}

async function supabaseGetAllAdmins(): Promise<AdminUser[]> {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(admin => ({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      createdAt: admin.created_at,
      lastLogin: admin.last_login
    }));
  } catch {
    return [];
  }
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const email = await getUserEmail();
  if (!email) return false;
  if (email === DEFAULT_ADMIN_EMAIL) return true;

  if (isSupabaseConfigured()) {
    return supabaseIsAdmin(email);
  }
  return false;
}

export async function isAdmin(_userId?: string): Promise<boolean> {
  return isCurrentUserAdmin();
}

export async function getAdminRole(_userId?: string): Promise<AdminRole | null> {
  const email = await getUserEmail();
  if (!email) return null;
  if (email === DEFAULT_ADMIN_EMAIL) return 'super_admin';

  if (isSupabaseConfigured()) {
    return supabaseGetRole(email);
  }
  return null;
}

export async function getAllAdmins(): Promise<AdminUser[]> {
  if (isSupabaseConfigured()) {
    return supabaseGetAllAdmins();
  }
  return [];
}

export async function addAdmin(email: string, name: string, role: AdminRole = 'admin'): Promise<{ success: boolean; error?: string }> {
  const currentRole = await getAdminRole();
  if (currentRole !== 'super_admin') {
    return { success: false, error: '只有超级管理员可以添加管理员' };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase 未配置' };
  }

  const { error } = await supabase.from('admins').insert({ email, name, role });
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function updateAdminRole(adminId: string, role: AdminRole): Promise<{ success: boolean; error?: string }> {
  const currentRole = await getAdminRole();
  if (currentRole !== 'super_admin') {
    return { success: false, error: '只有超级管理员可以修改管理员角色' };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase 未配置' };
  }

  const { error } = await supabase.from('admins').update({ role }).eq('id', adminId);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function removeAdmin(adminId: string): Promise<{ success: boolean; error?: string }> {
  const currentRole = await getAdminRole();
  if (currentRole !== 'super_admin') {
    return { success: false, error: '只有超级管理员可以删除管理员' };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase 未配置' };
  }

  const { error } = await supabase.from('admins').delete().eq('id', adminId);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function checkPermission(action: 'read' | 'write' | 'delete' | 'manage_admins'): Promise<boolean> {
  const role = await getAdminRole();
  if (!role) return false;

  switch (action) {
    case 'read':
      return ['super_admin', 'admin', 'editor'].includes(role);
    case 'write':
      return ['super_admin', 'admin'].includes(role);
    case 'delete':
      return ['super_admin', 'admin'].includes(role);
    case 'manage_admins':
      return role === 'super_admin';
    default:
      return false;
  }
}
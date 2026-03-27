// 管理员权限系统

import { supabase } from './supabase';

// 默认管理员邮箱
const DEFAULT_ADMIN_EMAIL = 'wmango@hotmail.com';

// 管理员角色
export type AdminRole = 'super_admin' | 'admin' | 'editor';

// 管理员信息
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
  lastLogin?: string;
}

// 检查是否是管理员
export async function isAdmin(userId?: string): Promise<boolean> {
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    userId = user.id;
  }

  // 检查是否是默认管理员
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email === DEFAULT_ADMIN_EMAIL) return true;

  // 检查数据库中的管理员记录
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', userId)
    .single();

  return !error && !!data;
}

// 获取当前用户是否是管理员
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  // 默认管理员
  if (user.email === DEFAULT_ADMIN_EMAIL) return true;
  
  return isAdmin(user.id);
}

// 获取管理员角色
export async function getAdminRole(userId?: string): Promise<AdminRole | null> {
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    userId = user.id;
  }

  // 默认管理员是 super_admin
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email === DEFAULT_ADMIN_EMAIL) return 'super_admin';

  const { data, error } = await supabase
    .from('admins')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data.role as AdminRole;
}

// 获取所有管理员
export async function getAllAdmins(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admins:', error);
    return [];
  }

  return data.map(admin => ({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    createdAt: admin.created_at,
    lastLogin: admin.last_login
  }));
}

// 添加管理员
export async function addAdmin(email: string, name: string, role: AdminRole = 'admin'): Promise<{ success: boolean; error?: string }> {
  // 检查当前用户是否是 super_admin
  const currentRole = await getAdminRole();
  if (currentRole !== 'super_admin') {
    return { success: false, error: '只有超级管理员可以添加管理员' };
  }

  // 检查是否已存在
  const { data: existing } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single();

  if (existing) {
    return { success: false, error: '该邮箱已经是管理员' };
  }

  // 添加管理员
  const { error } = await supabase
    .from('admins')
    .insert({
      email,
      name,
      role,
      created_at: new Date().toISOString()
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 更新管理员角色
export async function updateAdminRole(adminId: string, role: AdminRole): Promise<{ success: boolean; error?: string }> {
  const currentRole = await getAdminRole();
  if (currentRole !== 'super_admin') {
    return { success: false, error: '只有超级管理员可以修改管理员角色' };
  }

  const { error } = await supabase
    .from('admins')
    .update({ role })
    .eq('id', adminId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 删除管理员
export async function removeAdmin(adminId: string): Promise<{ success: boolean; error?: string }> {
  const currentRole = await getAdminRole();
  if (currentRole !== 'super_admin') {
    return { success: false, error: '只有超级管理员可以删除管理员' };
  }

  const { error } = await supabase
    .from('admins')
    .delete()
    .eq('id', adminId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 检查权限
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
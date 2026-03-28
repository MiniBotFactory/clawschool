import { supabase } from './supabase';
import { auth as localAuth } from './storage';

const DEFAULT_ADMIN_EMAIL = 'wmango@hotmail.com';

const ADMIN_EMAILS_KEY = 'clawschool_admin_emails';

export type AdminRole = 'super_admin' | 'admin' | 'editor';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: string;
  lastLogin?: string;
}

function getLocalAdmins(): AdminUser[] {
  try {
    const data = localStorage.getItem(ADMIN_EMAILS_KEY);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }

  const defaultAdmin: AdminUser = {
    id: 'default_super_admin',
    email: DEFAULT_ADMIN_EMAIL,
    name: 'Super Admin',
    role: 'super_admin',
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(ADMIN_EMAILS_KEY, JSON.stringify([defaultAdmin]));
  return [defaultAdmin];
}

function saveLocalAdmins(admins: AdminUser[]) {
  localStorage.setItem(ADMIN_EMAILS_KEY, JSON.stringify(admins));
}

function getCurrentUserEmail(): string | null {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    const user = localAuth.getCurrentUser();
    return user?.email || null;
  }
  return null;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const localEmail = getCurrentUserEmail();
  if (localEmail) {
    if (localEmail === DEFAULT_ADMIN_EMAIL) return true;
    const admins = getLocalAdmins();
    return admins.some(a => a.email === localEmail);
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    if (user.email === DEFAULT_ADMIN_EMAIL) return true;

    const { data } = await supabase
      .from('admins')
      .select('id')
      .eq('email', user.email)
      .single();
    return !!data;
  } catch {
    return false;
  }
}

export async function isAdmin(_userId?: string): Promise<boolean> {
  return isCurrentUserAdmin();
}

export async function getAdminRole(_userId?: string): Promise<AdminRole | null> {
  const localEmail = getCurrentUserEmail();
  if (localEmail) {
    if (localEmail === DEFAULT_ADMIN_EMAIL) return 'super_admin';
    const admins = getLocalAdmins();
    const admin = admins.find(a => a.email === localEmail);
    return admin?.role || null;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    if (user.email === DEFAULT_ADMIN_EMAIL) return 'super_admin';

    const { data } = await supabase
      .from('admins')
      .select('role')
      .eq('email', user.email)
      .single();
    return (data?.role as AdminRole) || null;
  } catch {
    return null;
  }
}

export async function getAllAdmins(): Promise<AdminUser[]> {
  const localEmail = getCurrentUserEmail();
  if (localEmail) {
    return getLocalAdmins();
  }

  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return getLocalAdmins();

    return data.map(admin => ({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      createdAt: admin.created_at,
      lastLogin: admin.last_login
    }));
  } catch {
    return getLocalAdmins();
  }
}

export async function addAdmin(email: string, name: string, role: AdminRole = 'admin'): Promise<{ success: boolean; error?: string }> {
  const currentRole = await getAdminRole();
  if (currentRole !== 'super_admin') {
    return { success: false, error: '只有超级管理员可以添加管理员' };
  }

  const admins = getLocalAdmins();
  if (admins.some(a => a.email === email)) {
    return { success: false, error: '该邮箱已经是管理员' };
  }

  admins.push({
    id: `admin_${Date.now()}`,
    email,
    name,
    role,
    createdAt: new Date().toISOString()
  });
  saveLocalAdmins(admins);

  try {
    await supabase.from('admins').insert({ email, name, role });
  } catch { /* Supabase not available, local only */ }

  return { success: true };
}

export async function updateAdminRole(adminId: string, role: AdminRole): Promise<{ success: boolean; error?: string }> {
  const currentRole = await getAdminRole();
  if (currentRole !== 'super_admin') {
    return { success: false, error: '只有超级管理员可以修改管理员角色' };
  }

  const admins = getLocalAdmins();
  const index = admins.findIndex(a => a.id === adminId);
  if (index >= 0) {
    admins[index].role = role;
    saveLocalAdmins(admins);
  }

  try {
    await supabase.from('admins').update({ role }).eq('id', adminId);
  } catch { /* ignore */ }

  return { success: true };
}

export async function removeAdmin(adminId: string): Promise<{ success: boolean; error?: string }> {
  const currentRole = await getAdminRole();
  if (currentRole !== 'super_admin') {
    return { success: false, error: '只有超级管理员可以删除管理员' };
  }

  const admins = getLocalAdmins();
  const filtered = admins.filter(a => a.id !== adminId);
  saveLocalAdmins(filtered);

  try {
    await supabase.from('admins').delete().eq('id', adminId);
  } catch { /* ignore */ }

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
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { supabase, isSupabaseConfigured } from '../api/supabase';
import { auth as localAuth } from '../api/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function supabaseUserToAppUser(sbUser: any): User {
  return {
    id: sbUser.id,
    email: sbUser.email,
    name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || '',
    avatar: sbUser.user_metadata?.avatar_url,
    createdAt: sbUser.created_at,
    stats: {
      coursesCompleted: 0,
      resourcesLiked: 0,
      resourcesCollected: 0,
      evaluationsSubmitted: 0,
      courseSetsSubscribed: 0
    }
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event: string, session: any) => {
          if (session?.user) {
            setUser(supabaseUserToAppUser(session.user));
          } else {
            const localUser = localAuth.getCurrentUser();
            setUser(localUser);
          }
          setIsLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    } else {
      const localUser = localAuth.getCurrentUser();
      setUser(localUser);
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          setUser(supabaseUserToAppUser(data.user));
          return { success: true };
        }
        return { success: false, error: '登录失败' };
      }

      const result = await localAuth.login(email, password);
      if (result.success && result.data) {
        setUser(result.data);
        return { success: true };
      }
      return { success: false, error: result.error || '登录失败' };
    } catch {
      return { success: false, error: '登录失败' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } }
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          setUser(supabaseUserToAppUser(data.user));
          return { success: true };
        }
        return { success: false, error: '注册失败' };
      }

      const result = await localAuth.register(email, password, name);
      if (result.success && result.data) {
        setUser(result.data);
        return { success: true };
      }
      return { success: false, error: result.error || '注册失败' };
    } catch {
      return { success: false, error: '注册失败' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localAuth.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    if (isSupabaseConfigured()) {
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      if (sbUser) {
        setUser(supabaseUserToAppUser(sbUser));
        return;
      }
    }
    const localUser = localAuth.getCurrentUser();
    setUser(localUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
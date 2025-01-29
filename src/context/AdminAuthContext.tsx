import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super-admin';
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAdminAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (mounted) {
          if (session?.user) {
            const { data: adminData } = await supabase
              .from('admins')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (adminData) {
              setAdminUser({
                id: session.user.id,
                email: session.user.email!,
                role: 'admin'
              });
            } else {
              setAdminUser(null);
            }
          } else {
            setAdminUser(null);
          }
          setLoading(false);
        }

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (mounted) {
            if (session?.user) {
              const { data: adminData } = await supabase
                .from('admins')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (adminData) {
                setAdminUser({
                  id: session.user.id,
                  email: session.user.email!,
                  role: 'admin'
                });
              } else {
                setAdminUser(null);
              }
            } else {
              setAdminUser(null);
            }
            setLoading(false);
          }
        });

        return () => {
          subscription.unsubscribe();
          mounted = false;
        };
      } catch (error) {
        console.error('Error initializing admin auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAdminAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean): Promise<boolean> => {
    try {
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('adminRememberMe', 'true');
      } else {
        localStorage.removeItem('adminRememberMe');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (adminError || !adminData) {
          await supabase.auth.signOut();
          return false;
        }

        setAdminUser({
          id: data.user.id,
          email: data.user.email!,
          role: 'admin'
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setAdminUser(null);
    } catch (error) {
      console.error('Admin logout error:', error);
      throw error;
    }
  };

  const value = {
    adminUser,
    isAuthenticated: !!adminUser,
    login,
    logout,
    loading
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}; 
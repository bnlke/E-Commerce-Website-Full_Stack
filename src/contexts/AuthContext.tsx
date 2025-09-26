import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  resetPassword: (email: string, redirectUrl?: string) => Promise<void>;
  updatePassword: (password: string, accessToken?: string | null) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { username?: string, avatar_url?: string }) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use async function for better error handling
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, updated_at, created_at')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data);
    } else {
      console.error('Error fetching profile:', error);
    }
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      await fetchProfile(data.user.id);
    }
  }

  async function signIn(email: string, password: string, rememberMe = false) {
    const { error } = await supabase.auth.signInWithPassword(
      { email, password },
      { data: { remember_me: rememberMe } }
    );
    if (error) throw error;
  }

  async function resetPassword(email: string, redirectUrl?: string) {
    // Use the provided redirectUrl, environment variable, or fallback to origin
    const redirectTo = redirectUrl || 
                      import.meta.env.VITE_NEXT_PUBLIC_REDIRECT_URL ||
                      `${window.location.origin}/reset-password#recovery`;
                      
    console.log('Using redirect URL:', redirectTo);
    console.log('Sending password reset email to:', email);

    // Call Supabase to send the reset email
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });
    
    console.log('Reset password response:', data ? 'Success' : 'No data', error ? `Error: ${error.message}` : 'No error');
    
    if (error) throw error;
  }

  async function updatePassword(password: string, accessToken?: string | null) {
    try {
      if (accessToken) {
        console.log('Using provided access token for password update', accessToken.substring(0, 5) + '...');
        try {
          // Set the session with the access token
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: '', 
          });

          if (sessionError) {
            console.error('Session error with token:', sessionError.message);
            throw sessionError;
          }

          if (!session) {
            console.error('No session returned after setSession with token');
            throw new Error('Unable to establish a session with the provided token. Please request a new reset link.');
          }

          // Update the password using the established session
          const { data, error: updateError } = await supabase.auth.updateUser({ password });
          if (updateError) {
            console.error('Error updating password with token:', updateError.message);
            throw updateError;
          }
          
          console.log('Password updated successfully with token');
          return data;
        } catch (error) {
          console.error('Error in token-based password update:', error);
          throw error;
        }
      } else {
        console.log('Using current session to update password');
        try {
          // Check if we have an active session first
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session || !session.user) {
            console.error('No active session found');
            throw new Error('Your session has expired. Please request a new password reset link.');
          }
          
          console.log('Using existing session for user:', session.user.email);
          
          // If no access token, use the current session
          const { data, error: updateError } = await supabase.auth.updateUser({ password });
          if (updateError) throw updateError;
          
          console.log('Password updated successfully');
          return data;
        } catch (error) {
          console.error('Error using current session:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error in updatePassword function:', error);
      throw error;
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function updateProfile(updates: { username?: string; avatar_url?: string }) {
    if (!user) return;
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) throw error;
    await fetchProfile(user.id);
  }

  const value = {
    user,
    profile,
    signUp,
    signIn,
    updatePassword,
    signOut,
    resetPassword,
    updateProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
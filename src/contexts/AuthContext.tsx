import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  authLoading: boolean;
  signIn: () => void;
  signOut: () => void;
  setMockRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'visitor',
  authLoading: true,
  signIn: () => {},
  signOut: () => {},
  setMockRole: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('visitor');
  const [authLoading, setAuthLoading] = useState(true);

  const setMockRole = (mockRole: UserRole) => {
    setRole(mockRole);
    if (mockRole === 'visitor') {
      setUser(null);
    } else {
      setUser({
        id: `mock-${mockRole}-id`,
        name: `Mock ${mockRole === 'student' ? 'Student' : 'Mentor'}`,
        email: `${mockRole}@test.com`,
        role: mockRole,
        created_at: new Date().toISOString()
      });
    }
    setAuthLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setRole('visitor');
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profile) {
      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        created_at: profile.created_at
      });
      setRole(profile.role);
    }
    setAuthLoading(false);
  };

  const signIn = () => {};
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, authLoading, signIn, signOut, setMockRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

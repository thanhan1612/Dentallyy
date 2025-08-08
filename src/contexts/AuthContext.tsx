'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { account } from '@/appwrite-config/appwrite.config';
import { doctorService } from '@/api/doctors';

export type UserRole = 'super_admin' | 'branch_admin' | 'staff' | 'doctor';
interface AuthContextType {
  isAuthenticated: boolean;
  //accessToken: string | null;
  user: any;
  isLoading: boolean;
  //isLoading: boolean;
  login: (userId: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const result = await account.get();
      
      try {
        const doctorData = await doctorService.getDoctorDocuments({
          fieldId: 'id',
          value: result.$id,
        });

        if (doctorData && doctorData?.data?.length > 0) {
          setUser(doctorData.data);
          setIsAuthenticated(true);
        } else {
          setUser(result);
          setIsAuthenticated(true);
        }
      } catch (error) {
        setUser(result);
        setIsAuthenticated(true);
      }

    } catch (error) {
      logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userId: string) => {
    try {
      localStorage.setItem('userId', userId);
      await fetchProfile();
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('userId');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    setIsAuthenticated(true);
    fetchProfile();
  }, []);

  useEffect(() => {
    if (isAuthenticated && !user && !isLoading) {
      fetchProfile();
    }
  }, [isAuthenticated, user, isLoading]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout, refreshProfile: fetchProfile }}>
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
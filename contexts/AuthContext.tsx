import {
  Factor,
  UserAppMetadata,
  UserIdentity,
  UserMetadata,
} from "@supabase/supabase-js";
import React, { createContext, useContext } from "react";

export interface SessionUser {
  id: string;
  app_metadata: UserAppMetadata;
  user_metadata: UserMetadata;
  aud: string;
  confirmation_sent_at?: string;
  recovery_sent_at?: string;
  email_change_sent_at?: string;
  new_email?: string;
  new_phone?: string;
  invited_at?: string;
  action_link?: string;
  email?: string;
  phone?: string;
  created_at: string;
  confirmed_at?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
  role?: string;
  updated_at?: string;
  identities?: UserIdentity[];
  is_anonymous?: boolean;
  factors?: Factor[];
}

export interface SupaUser {
  id?: string;
  name?: string;
  email?: string;
  image?: string | null;
  bio?: string;
  address?: string;
  phoneNumber?: string;
  createdAt?: string;
}

export interface User {
  authInfo?: SessionUser;
  userData?: SupaUser;
}

interface AuthContextType {
  user: User | null;
  setAuth: (authUser: Pick<User, "authInfo"> | null) => void;
  setUserData: (data: Partial<Omit<User, "authInfo">>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);

  const setAuth = (authUser: Pick<User, "authInfo"> | null) => {
    console.log('Auth Context - Updating user session data')
    if (authUser === null) {
      setUser(null);
    } else {
      setUser((prev) => ({
        ...prev,
        authInfo: authUser.authInfo,
      }));
    }
  };

  const setUserData = (data: Partial<Omit<User, "authInfo">>) => {
    setUser((prev) =>
      prev
        ? { ...prev, userData: { ...prev.userData, ...data.userData } }
        : prev
    );
    console.log('Auth Context - Updating user supabase data')
  };
  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

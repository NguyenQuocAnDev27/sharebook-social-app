import {
  User as SessionUser,
} from "@supabase/supabase-js";
import React, { createContext, useContext } from "react";

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
  setAuth: (authUser: SessionUser | null) => void;
  setUserData: (data: SupaUser) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);

  const setAuth = (authUser: SessionUser | null) => {
    if (authUser === null) {
      console.log("Auth Context - Removing user");
      setUser(null);
    } else {
      console.log("Auth Context - Updating user session data");
      setUser((prev) => ({
        ...prev,
        authInfo: authUser,
      }));
    }
  };

  const setUserData = (newUserData: SupaUser) => {
    setUser((prev) =>
      prev ? { ...prev, userData: { ...prev.userData, ...newUserData } } : prev
    );
    console.log("Auth Context - Updating user supabase data");
  };
  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

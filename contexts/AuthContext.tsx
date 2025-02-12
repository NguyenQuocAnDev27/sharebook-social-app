import React, { createContext, useContext } from "react";

interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  bio?: string;
  address?: string;
  phoneNumber?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  setAuth: (authUser: Pick<User, "id" | "name" | "email"> | null) => void;
  setUserData: (data: Omit<User, "id" | "name" | "email">) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);

  const setAuth = (authUser: Pick<User, "id" | "name" | "email"> | null) => {
    if (authUser === null) {
      setUser(null);
    } else {
      setUser((prev) => ({
        ...prev,
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
      }));
    }
  };

  const setUserData = (data: Omit<User, "id" | "name" | "email">) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

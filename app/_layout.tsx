import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";

const _layout = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

const MainLayout = () => {
  const authContext = useAuth();
  const router = useRouter();

  if (!authContext) {
    console.error("AuthContext is not found");
    return null;
  }

  const { setAuth } = authContext;

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      console.log(`Session user: ${session?.user?.id}`);

      if (session) {
        setAuth({
          id: session.user.id,
          name: session.user.user_metadata.full_name,
          email: session.user.email,
        });
        router.replace("/home");
      } else {
        setAuth(null);
        router.replace("/welcome");
      }
    });
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
};
export default _layout;

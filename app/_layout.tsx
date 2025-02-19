import { AuthProvider, SupaUser, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getUserData } from "@/services/userService";
import { User as SessionUser } from "@supabase/supabase-js";
import { Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { AppState } from "react-native";

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

  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });

  if (!authContext) {
    console.error("AuthContext is not found");
    return null;
  }

  const { setAuth, setUserData } = authContext;

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      console.log(`Session user: ${session?.user?.id}`);

      if (session) {
        setAuth(session?.user);
        updateUserData(session?.user);
        router.replace("/home");
      } else {
        setAuth(null);
        router.replace("/welcome");
      }
    });
  }, []);

  const updateUserData = async (user: SessionUser) => {
    let res = await getUserData(user?.id as string);

    if (res.success) {
      setUserData(res.data);
    }
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signUp" />
      <Stack.Screen name="welcome" />
    </Stack>
  );
};
export default _layout;

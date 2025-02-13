import Icon from "@/assets/icons";
import Avatar from "@/components/Avatar";
import ScreenWarpper from "@/components/ScreenWrapper";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { hp, wp } from "@/helpers/common";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";

const home = () => {
  const authContext = useAuth();
  const router = useRouter();

  if (!authContext) {
    console.error("AuthContext is not found");
    return null;
  }
  const { user, setAuth } = authContext;

  // const onLogout = async () => {
  //   setAuth(null);
  //   const { error } = await supabase.auth.signOut();

  //   if (error) {
  //     console.warn("Error logging out", error);
  //     Alert.alert("Error", "Error signing out!");
  //   }
  // };

  return (
    <ScreenWarpper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>LinkUp</Text>
          <View style={styles.icons}>
            <Pressable onPress={() => router.push("/notifications")}>
              <Icon
                name="heart"
                size={hp(3.2)}
                strokeWidth={1.5}
                color={theme.colors.text}
              />
            </Pressable>
            <Pressable onPress={() => router.push("/newPosts")}>
              <Icon
                name="plus"
                size={hp(3.2)}
                strokeWidth={1.5}
                color={theme.colors.text}
              />
            </Pressable>
            <Pressable onPress={() => router.push("/profile")}>
              <Avatar
                uri={user?.userData?.image}
                size={hp(4.3)}
                rounded={theme.radius.sm}
                style={{ borderWidth: 2 }}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWarpper>
  );
};

export default home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: wp(4),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },
  avatarImage: {
    height: hp(4.3),
    width: wp(4.3),
    borderRadius: theme.radius.sm,
    borderColor: theme.colors.gray,
    borderWidth: 3,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  listStyle: {
    paddingTop: 10,
    paddingHorizontal: wp(4),
  },
  noPost: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  pill: {
    position: "absolute",
    right: -10,
    top: -4,
    height: hp(2.2),
    width: wp(2.2),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: theme.colors.rose,
  },
  pillText: {
    color: "white",
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
  },
});

import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="newPosts" />
      <Stack.Screen name="editProfile" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="postDetails" options={{ presentation: "modal" }} />
    </Stack>
  );
}

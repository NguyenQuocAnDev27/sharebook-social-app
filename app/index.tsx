import ScreenWarpper from "@/components/ScreenWrapper";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, Button } from "react-native";

const index = () => {
  const router = useRouter();
  return (
    <ScreenWarpper>
      <Text>Home Screen</Text>
      <Button title="welcome" onPress={() => router.push("/welcome")} />
    </ScreenWarpper>
  );
};

export default index;

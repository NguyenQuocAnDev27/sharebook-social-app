import React from "react";
import { StatusBar } from "react-native";
import { View, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";

interface ScreenWrapperProps {
  children: React.ReactNode;
  bg?: string;
}

const StatusBarHeight = Constants.statusBarHeight;

const ScreenWarpper: React.FC<ScreenWrapperProps> = ({
  children,
  bg = "white",
}) => {
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 5 : 30;

  if (Platform.OS === "android") {
    return (
      <View style={{ flex: 1, paddingTop: StatusBarHeight, backgroundColor: bg }}>
        <StatusBar
          barStyle="dark-content"
          hidden={false}
          networkActivityIndicatorVisible={true}
        />
        {children}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop, backgroundColor: bg }}>{children}</View>
  );
};

export default ScreenWarpper;

import React from "react";
import { Keyboard, StatusBar, TouchableWithoutFeedback } from "react-native";
import { View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";

interface ScreenWrapperProps {
  children: React.ReactNode;
  bg?: string;
  autoDismissKeyboard?: boolean;
}

const StatusBarHeight = Constants.statusBarHeight;

const ScreenWarpper: React.FC<ScreenWrapperProps> = ({
  children,
  bg = "white",
  autoDismissKeyboard = true,
}) => {
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 5 : 30;

  if (Platform.OS === "android") {
    return (
      <View
        style={{ flex: 1, paddingTop: StatusBarHeight, backgroundColor: bg }}
      >
        <StatusBar
          barStyle="dark-content"
          hidden={false}
          networkActivityIndicatorVisible={true}
        />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} disabled={!autoDismissKeyboard}>
          <View style={{ flex: 1 }}>{children}</View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop, backgroundColor: bg }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>{children}</View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default ScreenWarpper;

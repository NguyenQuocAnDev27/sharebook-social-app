import ScreenWarpper from "@/components/ScreenWrapper";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import Button from "@/components/Button";

const welcome = () => {
  const router = useRouter();

  return (
    <ScreenWarpper autoDismissKeyboard={false}>
      <View style={styles.container}>
        <Image
          style={styles.welcomeImage}
          source={require("../assets/images/welcome.png")}
          resizeMode="contain"
        />

        <View style={{ gap: 20 }}>
          <Text style={styles.title}>ShareBook!</Text>
          <Text style={styles.punchLine}>
            Mỗi ý tưởng đều có chốn dừng chân, mỗi hình ảnh đều chứa đựng một
            câu chuyện ✨✨✨
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            title="Bắt đầu nào!"
            buttonStyle={{ marginHorizontal: wp(3) }}
            onPress={() => router.push("/signUp")}
          />
          <View style={styles.bottomTextContainer}>
            <Text style={styles.loginText}>Đã có tài khoản?</Text>
            <Pressable onPress={() => router.push("/login")}>
              <Text
                style={
                  (styles.loginText,
                  {
                    color: theme.colors.primaryDark,
                    fontWeight: theme.fonts.semibold,
                  })
                }
              >
                Đăng nhập
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWarpper>
  );
};

export default welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: wp(4),
  },
  welcomeImage: {
    height: hp(30),
    width: wp(100),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(4),
    textAlign: "center",
    fontWeight: theme.fonts.extraBold,
  },
  punchLine: {
    textAlign: "center",
    paddingHorizontal: wp(10),
    fontSize: hp(1.7),
    color: theme.colors.textLight,
  },
  footer: {
    gap: 30,
    width: wp(100),
  },
  bottomTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  loginText: {
    textAlign: "center",
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
});

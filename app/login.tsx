import React, { useRef, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import ScreenWarpper from "@/components/ScreenWrapper";
import { theme } from "@/constants/theme";
import Icon from "@/assets/icons";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import BackButton from "@/components/BackButton";
import { useRouter } from "expo-router";
import { hp, wp } from "@/helpers/common";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";

const login = () => {
  const router = useRouter();
  const mailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!mailRef.current || !passwordRef.current) {
      Alert.alert("Login", "Please fill all the fields");
      return;
    }

    let email = mailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // failed login then show error
    if (error) {
      Alert.alert("Sign Up", error.message);
      setLoading(false);
      return;
    }

    // success login then do something
    console.log(`User ${email} logged in successfully`);
    setLoading(false);
    router.push("/home");
  };

  return (
    <ScreenWarpper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton
          onPress={() => {
            router.back();
          }}
        />

        {/* Welcome Text */}
        <View>
          <Text style={styles.welcomeText}>Hey,</Text>
          <Text style={styles.welcomeText}>Welcome Back</Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Please login to continue
          </Text>
          {/* email field */}
          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your email"
            onChangeText={(text) => (mailRef.current = text)}
          />
          {/* password field */}
          <Input
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            placeholder="Enter your password"
            onChangeText={(text) => (passwordRef.current = text)}
          />
          {/* forgot password */}
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
          {/* button */}
          <Button title="Login" loading={loading} onPress={onSubmit} />
          {/* footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Pressable onPress={() => router.push("/signUp")}>
              <Text
                style={[
                  styles.footerText,
                  {
                    color: theme.colors.primaryDark,
                    fontWeight: theme.fonts.semibold,
                  },
                ]}
              >
                Sign up
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWarpper>
  );
};

export default login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    textAlign: "center",
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
});

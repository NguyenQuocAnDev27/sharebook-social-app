import Header from "@/components/Header";
import Loading from "@/components/Loading";
import NotificationItem from "@/components/NotificationItem";
import ScreenWarpper from "@/components/ScreenWrapper";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { hp, wp } from "@/helpers/common";
import {
  getNotifications,
  Notification,
  removeNotification,
} from "@/services/notificationService";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, Alert, ScrollView, StyleSheet } from "react-native";

const notifications = () => {
  const router = useRouter();
  const authConext = useAuth();

  if (!authConext) {
    Alert.alert("Thông báo", "You are not authenticated");
    router.push("/login");
    return null;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = authConext;
  const [loading, setLoading] = useState(false);

  const gettingNotifications = async () => {
    setLoading(true);
    const res = await getNotifications(user?.authInfo?.id || "");
    if (res.success) {
      setNotifications(res.data);
    } else {
      Alert.alert("Thông báo", res.message);
    }
    setLoading(false);
  };

  const removingNotification = async (notificationId: string) => {
    let res = await removeNotification(notificationId);
    if (res.success) {
      setNotifications((prev) => prev.filter((_) => _.id !== notificationId));
    } else {
      Alert.alert("Thông báo", res.message);
    }
  };

  useEffect(() => {
    gettingNotifications();
  }, []);

  return (
    <ScreenWarpper bg={theme.colors.lightGray} autoDismissKeyboard={false}>
      <View style={styles.container}>
        <Header title="Thông báo" />
        {loading ? (
          <View style={styles.listStyle}>
            <Loading />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listStyle}
          >
            {notifications.length === 0 ? (
              <View style={null}>
                <Text style={styles.noData}>Bạn chưa nhận thông báo nào cả</Text>
              </View>
            ) : (
              notifications.map((notification) => {
                return (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    router={router}
                    onDeleteNotification={(id) => removingNotification(id)}
                  />
                );
              })
            )}
          </ScrollView>
        )}
      </View>
    </ScreenWarpper>
  );
};

export default notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  listStyle: {
    paddingVertical: 20,
    gap: 20,
  },
  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: "center",
  },
});

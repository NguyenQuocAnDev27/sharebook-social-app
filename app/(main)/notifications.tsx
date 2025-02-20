import Header from "@/components/Header";
import Loading from "@/components/Loading";
import NotificationItem from "@/components/NotificationItem";
import ScreenWarpper from "@/components/ScreenWrapper";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { hp, wp } from "@/helpers/common";
import { getNotifications, Notification } from "@/services/notificationService";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, Alert, ScrollView, StyleSheet } from "react-native";

const notifications = () => {
  const router = useRouter();
  const authConext = useAuth();

  if (!authConext) {
    Alert.alert("Notification", "You are not authenticated");
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
      Alert.alert("Notification", res.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    gettingNotifications();
  }, []);

  return (
    <ScreenWarpper bg={theme.colors.lightGray}>
      <View style={styles.container}>
        <Header title="Notifications" />
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
                <Text style={styles.noData}>No notification</Text>
              </View>
            ) : (
              notifications.map((notification) => {
                return (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    router={router}
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

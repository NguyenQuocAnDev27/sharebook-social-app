import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect } from "react";
import {
  Notification,
  updateStatusNotification,
} from "@/services/notificationService";
import { theme } from "@/constants/theme";
import { Router } from "expo-router";
import Avatar from "./Avatar";
import { getFormattedDate, hp } from "@/helpers/common";
import Icon from "@/assets/icons";
import Animated, {
  withTiming,
  withDelay,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

interface NotificationItemProps {
  notification: Notification;
  router: Router;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  router,
}) => {
  const { postId, commentId } = JSON.parse(notification.data);
  const [openMenu, setOpenMenu] = React.useState(false);

  const onOpenPostDetail = async () => {
    router.push({ pathname: "/postDetails", params: { postId, commentId } });
    await updateStatusNotification(notification);
  };

  const onSeenNotification = async () => {};

  const onDeleteNotification = async () => {};

  const closeMenu = () => {
    flexValue.value = withTiming(0, { duration: 200 });
    setTimeout(() => setOpenMenu(false), 130);
  };

  const flexValue = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      flex: flexValue.value,
    };
  });

  useEffect(() => {
    flexValue.value = withTiming(openMenu ? 1 : 0, { duration: 200 }); // 200ms animation
  }, [openMenu]);

  return (
    <TouchableOpacity
      onPress={onOpenPostDetail}
      disabled={openMenu}
      style={[
        styles.container,
        notification.seen
          ? { backgroundColor: theme.colors.gray, borderWidth: 0 }
          : null,
      ]}
    >
      <Avatar uri={notification.sender.image} rounded={18} />
      <View style={styles.nameTitle}>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.text}>
            {notification.sender.name || "Unknown"}
          </Text>
          <Text style={[styles.text, { fontWeight: theme.fonts.extraBold }]}>
            {" "}
            -{" "}
          </Text>
          <Text style={[styles.text, { color: theme.colors.textLight }]}>
            {getFormattedDate(notification?.created_at)}
          </Text>
        </View>
        <Text
          style={[
            styles.text,
            { color: theme.colors.textDark, fontWeight: theme.fonts.bold },
          ]}
        >
          {notification.title}
        </Text>
      </View>
      <View style={styles.moreIconContainer}>
        {openMenu ? (
          <Animated.View
            style={[
              {
                flexDirection: "row",
                gap: 10,
                backgroundColor: "white",
                alignItems: "center",
                borderRadius: theme.radius.xxl,
                borderCurve: "continuous",
                padding: 5,
              },
              animatedStyle,
            ]}
          >
            <Pressable onPress={onSeenNotification}>
              <Icon name="eyeOff" color={theme.colors.dark} strokeWidth={2} />
            </Pressable>
            <Pressable onPress={onDeleteNotification}>
              <Icon
                name="delete"
                color={theme.colors.roseLight}
                strokeWidth={2}
              />
            </Pressable>
            <Pressable onPress={closeMenu}>
              <Icon name="cancel" color={theme.colors.dark} strokeWidth={2} />
            </Pressable>
          </Animated.View>
        ) : (
          <Pressable
            onPress={() => setOpenMenu(true)}
            style={{ marginRight: 5 }}
          >
            <Icon
              name="threeDotsHorizontal"
              color={theme.colors.dark}
              strokeWidth={4}
            />
          </Pressable>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    padding: 15,
    borderRadius: theme.radius.xxl,
    borderCurve: "continuous",
  },
  nameTitle: {
    flex: 1,
    gap: 2,
  },
  text: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  moreIconContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

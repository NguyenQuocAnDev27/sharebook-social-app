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
  onDeleteNotification: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  router,
  onDeleteNotification,
}) => {
  const { postId, commentId } = JSON.parse(notification.data);
  const [openMenu, setOpenMenu] = React.useState(false);
  const [isSeen, setIsSeen] = React.useState(notification.seen);
  const [showIconMenu, setShowIconMenu] = React.useState(false);

  const onOpenPostDetail = async () => {
    router.push({ pathname: "/postDetails", params: { postId, commentId } });
    if (!notification.seen) {
      await updateStatusNotification(notification);
    }
  };

  const onSeenNotification = async () => {
    await updateStatusNotification(notification);
    setOpenMenu(false);
    setIsSeen(true);
  };

  const closeMenu = () => {
    const timeAnimation = 300;
    setTimeout(() => {
      setShowIconMenu(false);
    }, 120);
    flexValue.value = withTiming(0, { duration: timeAnimation });
    padHozValue.value = withTiming(0, { duration: timeAnimation });
    padVerValue.value = withTiming(0, { duration: timeAnimation });
    gapValue.value = withTiming(0, { duration: timeAnimation });
    heightValue.value = withTiming(0, { duration: timeAnimation });
    setTimeout(() => setOpenMenu(false), timeAnimation - 30);
  };

  const onOpenMenu = () => {
    setOpenMenu(true);
    setShowIconMenu(true);
  };

  const flexValue = useSharedValue(0);
  const padHozValue = useSharedValue(0);
  const padVerValue = useSharedValue(0);
  const gapValue = useSharedValue(0);
  const heightValue = useSharedValue(75);

  const animatedConatinerStyle = useAnimatedStyle(() => {
    return {
      flex: flexValue.value,
      paddingVertical: padVerValue.value,
      paddingHorizontal: padHozValue.value,
      gap: gapValue.value,
      height: `${heightValue.value}%`,
    };
  });

  useEffect(() => {
    const timeAnimation = 200; // 200ms animation
    flexValue.value = withTiming(openMenu ? 1 : 0, { duration: timeAnimation });
    padHozValue.value = withTiming(openMenu ? 15 : 0, {
      duration: timeAnimation,
    });
    padVerValue.value = withTiming(openMenu ? 10 : 0, {
      duration: timeAnimation,
    });
    gapValue.value = withTiming(openMenu ? 12 : 0, { duration: timeAnimation });
    heightValue.value = withTiming(openMenu ? 100 : 75, {
      duration: timeAnimation,
    });
  }, [openMenu]);

  return (
    <TouchableOpacity
      onPress={onOpenPostDetail}
      disabled={openMenu}
      style={[
        styles.container,
        isSeen ? { backgroundColor: theme.colors.gray, borderWidth: 0 } : null,
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
          {notification.title === "commented on your post"
            ? "đã bình luận về bài viết của bạn"
            : "unknown action"}
        </Text>
      </View>
      <View style={styles.moreIconContainer}>
        {openMenu ? (
          <Animated.View
            style={[
              {
                flexDirection: "row",
                backgroundColor: isSeen ? "white" : theme.colors.lightGray2,
                alignItems: "center",
                justifyContent: "space-evenly",
                borderRadius: theme.radius.xxl,
                borderCurve: "continuous",
                position: "absolute",
                right: 0,
              },
              animatedConatinerStyle,
            ]}
          >
            {!isSeen && (
              <Pressable onPress={onSeenNotification}>
                {showIconMenu ? (
                  <Icon
                    name="eyeOff"
                    color={theme.colors.dark}
                    strokeWidth={2}
                  />
                ) : (
                  <View style={{ width: 20, height: 20 }}></View>
                )}
              </Pressable>
            )}
            <Pressable onPress={() => onDeleteNotification(notification.id)}>
              {showIconMenu ? (
                <Icon
                  name="delete"
                  color={theme.colors.roseLight}
                  strokeWidth={2}
                />
              ) : (
                <View style={{ width: 20, height: 20 }}></View>
              )}
            </Pressable>
            <TouchableOpacity onPress={closeMenu}>
              {showIconMenu ? (
                <Icon name="cancel" color={theme.colors.dark} strokeWidth={2} />
              ) : (
                <View style={{ width: 20, height: 20 }}></View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <TouchableOpacity onPress={onOpenMenu} style={{ marginRight: 5 }}>
            <Icon
              name="threeDotsHorizontal"
              color={theme.colors.dark}
              strokeWidth={4}
            />
          </TouchableOpacity>
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

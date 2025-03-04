import Icon from "@/assets/icons";
import Avatar from "@/components/Avatar";
import ScreenWarpper from "@/components/ScreenWrapper";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { hp, wp } from "@/helpers/common";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  FlatList,
} from "react-native";
import { getPosts, PostViewer } from "@/services/postService";
import PostCard from "@/components/PostCard";
import Loading from "@/components/Loading";
import { supabase } from "@/lib/supabase";
import { getUserData } from "@/services/userService";
import { getNotifications, usePushNotifications } from "@/services/notificationService";

var page = 0;
const home = () => {
  const authContext = useAuth();
  const router = useRouter();

  if (!authContext) {
    console.error("AuthContext is not found");
    return null;
  }

  const { user } = authContext;

  const [posts, setPosts] = useState<PostViewer[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [nofiCount, setNotiCount] = useState(0);

  const gettingPosts = async () => {
    if (!hasMore) return;

    page += 1;
    // 🔄️ get posts
    let res = await getPosts(page, user?.authInfo?.id || "");

    if (res.success) {
      console.log(`Home Screen - ${res.message}`);
      if (res?.data?.length > 0) {
        setPosts((prev) => [...prev, ...res.data]);
      } else {
        setHasMore(false);
      }
    } else {
      Alert.alert("Home", "Error while getting posts");
    }
  };

  const gettingNotifications = async () => {
    const res = await getNotifications(user?.authInfo?.id || "", false);
    if (res.success) {
      setNotiCount(res.data.length);
    } else {
      Alert.alert("Notification", res.message);
    }
  };

  const handlePostEvent = async (payload: any) => {
    console.log(`Got new post ${JSON.stringify(payload)}`);
    if (payload?.eventType == "INSERT" && payload?.new?.id) {
      let newPost: PostViewer = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.user = res.success ? res.data : {};
      newPost.comments = [];
      newPost.postLikes = [];
      newPost.isLikeOwner = false;
      // console.log(`New post ${JSON.stringify(newPost)}`);
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }
  };

  const handleNotifcationEvent = async (payload: any) => {
    // console.log(`Got new notification ${JSON.stringify(payload)}`);
    if (payload?.eventType == "INSERT" && payload?.new?.id) {
      setNotiCount((prev) => prev + 1);
    } else if (payload?.eventType == "UPDATE" && payload?.new?.seen) {
      setNotiCount((prev) => {
        if (prev > 0) {
          return prev - 1;
        } else {
          return prev;
        }
      });
    }
  };

  useEffect(() => {
    page = 0;

    gettingNotifications();

    let postsChannel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        handlePostEvent
      )
      .subscribe();

    let notificationChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `receiverId=eq.${user?.authInfo?.id}`,
        },
        handleNotifcationEvent
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, []);

  // const onLogout = async () => {
  //   setAuth(null);
  //   const { error } = await supabase.auth.signOut();

  //   if (error) {
  //     console.warn("Error logging out", error);
  //     Alert.alert("Error", "Error signing out!");
  //   }
  // };


  return (
    <ScreenWarpper autoDismissKeyboard={false}>
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <Text style={styles.title}>ShareBook</Text>
          <View style={styles.icons}>
            <Pressable onPress={() => router.push("/notifications")}>
              <Icon
                name="notification"
                size={hp(3.2)}
                strokeWidth={1.5}
                color={theme.colors.text}
              />
              {nofiCount > 0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{nofiCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => router.push("/newPosts")}>
              <Icon
                name="plus"
                size={hp(3.2)}
                strokeWidth={1.5}
                color={theme.colors.text}
              />
            </Pressable>
            <Pressable onPress={() => router.push("/profile")}>
              <Avatar
                uri={user?.userData?.image}
                size={hp(4.3)}
                rounded={theme.radius.sm}
                style={{ borderWidth: 2 }}
              />
            </Pressable>
          </View>
        </View>

        {/* posts */}
        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard item={item} currentUser={user?.userData} router={router} />
          )}
          ListFooterComponent={
            !hasMore ? (
              <View style={{ marginVertical: 30 }}>
                <Text style={styles.noPost}>Bạn đã xem hết các bài viết</Text>
              </View>
            ) : (
              <View style={{ marginVertical: posts?.length === 0 ? 200 : 30 }}>
                <Loading />
              </View>
            )
          }
          onEndReachedThreshold={0}
          onEndReached={() => {
            gettingPosts();
            console.log("Reaching the end of posts");
          }}
        />
      </View>
    </ScreenWarpper>
  );
};

export default home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: wp(4),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },
  avatarImage: {
    height: hp(4.3),
    width: wp(4.3),
    borderRadius: theme.radius.sm,
    borderColor: theme.colors.gray,
    borderWidth: 3,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  listStyle: {
    paddingTop: 10,
    paddingHorizontal: wp(4),
  },
  noPost: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  pill: {
    position: "absolute",
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: theme.colors.roseLight,
    borderColor: theme.colors.gray,
    borderWidth: 1,
  },
  pillText: {
    color: "white",
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold,
  },
});

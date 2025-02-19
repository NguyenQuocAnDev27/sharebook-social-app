import Icon from "@/assets/icons";
import Avatar from "@/components/Avatar";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import PostCard from "@/components/PostCard";
import ScreenWarpper from "@/components/ScreenWrapper";
import { theme } from "@/constants/theme";
import { useAuth, User } from "@/contexts/AuthContext";
import { hp, wp } from "@/helpers/common";
import { supabase } from "@/lib/supabase";
import { getPosts, getYourPosts, PostViewer } from "@/services/postService";
import { Router, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
  FlatList,
} from "react-native";

var page = 0;
const Profile = () => {
  const router = useRouter();

  const AuthContext = useAuth();
  if (!AuthContext) {
    console.warn("AuthContext is not found");
    return null;
  }
  const { user, setAuth } = AuthContext;
  const [posts, setPosts] = useState<PostViewer[]>([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    page = 0;
    gettingPosts();
  }, []);

  const gettingPosts = async () => {
    if (!hasMore) return;

    page += 1;
    // 🔄️ get posts
    let res = await getYourPosts(page, user?.authInfo?.id || "");

    if (res.success) {
      console.log(`Profile Screen - ${res.message}`);
      if (res?.data?.length > 0) {
        setPosts((prev) => [...prev, ...res.data]);
      } else {
        setHasMore(false);
      }
    } else {
      Alert.alert("Profile", "Error while getting your posts");
    }
  };

  const onLogout = async () => {
    setAuth(null);
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.warn("Error logging out", error);
      Alert.alert("Error", "Error signing out!");
    }
  };

  const handleLogout = () => {
    Alert.alert("Profile", "Are you sure want to logout?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: () => onLogout(),
        style: "destructive",
      },
    ]);
  };

  return (
    <ScreenWarpper>
      {/* posts */}
      <FlatList
        data={posts}
        ListHeaderComponent={
          <UserHeader
            user={user}
            router={router}
            handleLogoutBtn={handleLogout}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard item={item} currentUser={user} router={router} />
        )}
        ListFooterComponent={
          !hasMore ? (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPosts}> No more posts</Text>
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
    </ScreenWarpper>
  );
};

const UserHeader = ({
  user,
  router,
  handleLogoutBtn,
}: {
  user: User | null;
  router: Router;
  handleLogoutBtn: () => void;
}) => {
  return (
    <View
      style={{ flex: 1, backgroundColor: "white", paddingHorizontal: wp(4) }}
    >
      <View style={styles.headerContainer}>
        <Header title="Profile" marginBottom={30} />
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogoutBtn}>
          <Icon name="logout" color={theme.colors.rose} strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={user?.userData?.image}
              size={hp(12)}
              rounded={theme.radius.xxl * 1.4}
            />
            <Pressable
              style={styles.editIcon}
              onPress={() => router.push("/editProfile")}
            >
              <Icon name="edit" strokeWidth={2.5} size={20} />
            </Pressable>
          </View>

          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={styles.userName}>
              {user?.userData?.name || "Your name here"}
            </Text>
            <Text>{user?.userData?.address || ""}</Text>
          </View>

          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>{user?.authInfo?.email}</Text>
            </View>
            {user?.userData?.phoneNumber && (
              <View style={styles.info}>
                <Icon name="call" size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>
                  {user?.userData?.phoneNumber}
                </Text>
              </View>
            )}
            {user?.userData?.bio && (
              <View style={styles.info}>
                <Text style={styles.infoText}>{user?.userData?.bio}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View
        style={{
          height: hp(10),
          borderColor: theme.colors.dark,
          borderTopWidth: 0.6,
          marginTop: hp(2.6),
          padding: hp(2.6),
        }}
      >
        <Text
          style={{
            alignSelf: "center",
            fontSize: hp(2.6),
            fontWeight: theme.fonts.medium,
          }}
        >
          Your latest posts
        </Text>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: wp(4),
    marginBottom: 20,
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textDark,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  logoutBtn: {
    position: "absolute",
    right: 0,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.mistyRose,
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
});

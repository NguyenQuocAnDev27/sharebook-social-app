import Icon from "@/assets/icons";
import Avatar from "@/components/Avatar";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import PostCard from "@/components/PostCard";
import ScreenWarpper from "@/components/ScreenWrapper";
import { theme } from "@/constants/theme";
import { useAuth, User } from "@/contexts/AuthContext";
import { hp, maskGmail, maskPhoneNumber, wp } from "@/helpers/common";
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
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    setAuth(null);
    const { error } = await supabase.auth.signOut();
    setIsLoading(false);

    if (error) {
      console.warn("Error logging out", error);
      Alert.alert("Error", "Error signing out!");
    }
  };

  const handleLogout = () => {
    Alert.alert("Trang cá nhân", "Bạn đang đăng xuất đúng chứ>", [
      {
        text: "Không phải",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Đúng vậy",
        onPress: () => onLogout(),
        style: "destructive",
      },
    ]);
  };

  if (isLoading) {
    return (
      <ScreenWarpper autoDismissKeyboard={false}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text
            style={{
              color: theme.colors.primary,
              fontSize: hp(4),
              textAlign: "center",
              fontWeight: theme.fonts.extraBold,
              marginBottom: hp(10),
            }}
          >
            ShareBook
          </Text>
          <Loading size={60} />
        </View>
      </ScreenWarpper>
    );
  }

  return (
    <ScreenWarpper autoDismissKeyboard={false}>
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
              <Text style={styles.noPosts}>
                {posts.length > 0
                  ? "Bạn đã xem hết các bài viết"
                  : "Hãy tạo bài viết đầu tiên nào!"}
              </Text>
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
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.headerContainer}>
        <Header title="Trang cá nhân" marginBottom={30} />
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
              {user?.userData?.name || "Chưa cập nhật tên"}
            </Text>
            <Text>{user?.userData?.address || ""}</Text>
          </View>

          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>
                {maskGmail(user?.authInfo?.email || "")}
              </Text>
            </View>
            {user?.userData?.phoneNumber && (
              <View style={styles.info}>
                <Icon name="call" size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>
                  {maskPhoneNumber(user?.userData?.phoneNumber)}
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
          Các bài viết của bạn
        </Text>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  headerContainer: {
    // marginHorizontal: wp(4),
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

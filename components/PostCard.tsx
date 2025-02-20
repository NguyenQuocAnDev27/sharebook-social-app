import { Router } from "expo-router";
import {
  Alert,
  Share,
  ShareContent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  createPostLike,
  PostLikeBody,
  PostViewer,
  removePost,
  removePostLike,
} from "@/services/postService";
import { User } from "@/contexts/AuthContext";
import { getFormattedDate, getSupabaseFileUrl, hp, stripHtmlTags, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import Avatar from "./Avatar";
import Icon from "@/assets/icons";
import RenderHtml from "react-native-render-html";
import { SUPABASE_FOLDER_NAME } from "@/constants";
import { Image } from "expo-image";
import { ResizeMode, Video } from "expo-av";
import { downloadFile, downloadFileAsync } from "@/services/imageService";
import Loading from "./Loading";

interface PostCardProps {
  item: PostViewer;
  currentUser: User | null;
  router: Router;
  hasShadow?: boolean;
  disableMoreIcon?: boolean;
  disableBackIcon?: boolean;
  isEdit?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  item,
  currentUser,
  router,
  hasShadow = true,
  disableMoreIcon = false,
  disableBackIcon = true,
  isEdit = false,
}) => {
  // const [isLikeOwner, setIsLikeOwner] = useState<boolean>(
  //   item?.postLikes?.filter(
  //     (like) => like?.userId === currentUser?.userData?.id
  //   )[0]
  //     ? true
  //     : false
  // );

  const [isLikeOwner, setIsLikeOwner] = useState<boolean>(
    item.isLikeOwner || false
  );

  const isPostOwner = item.userId === currentUser?.userData?.id;
  const [isEditPost, setIsEditPost] = useState<boolean>(false);

  const [likes, setLikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingDeletingPost, setLoadingDeletingPost] =
    useState<boolean>(false);

  const ShadowStyles = {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  };

  const textStyles = {
    color: theme.colors.dark,
    fontSize: hp(1.75),
  };

  const tagsStyles = {
    div: textStyles,
    p: textStyles,
    ol: textStyles,
    h1: {
      color: theme.colors.dark,
    },
    h4: {
      color: theme.colors.dark,
    },
  };

  useEffect(() => {
    setLikes(item?.postLikes);
    setComments(item?.comments);
  }, []);

  const openPostDetails = () => {};

  // console.log(`Post - File ${item?.file})`);
  // if(item?.file && item?.file?.includes(SUPABASE_FOLDER_NAME.VIDEO) ) {
  //   console.log(`Post ${item?.id} has video | ${getSupabaseFileUrl(item?.file)?.uri}`)
  // }
  // if(item?.file && item?.file?.includes(SUPABASE_FOLDER_NAME.IMAGE) ) {
  //   console.log(`Post ${item?.id} has image | ${getSupabaseFileUrl(item?.file)?.uri}`)
  // }

  const onLike = async () => {
    if (currentUser?.userData?.id == null) {
      Alert.alert(`User is not authenticated`);
      return;
    }

    setIsLikeOwner(true);

    let data: PostLikeBody = {
      userId: currentUser?.userData?.id,
      postId: item?.id,
    };

    let res = await createPostLike(data);

    setLikes((prev) => [
      ...prev,
      { id: res?.data?.id, userId: res?.data?.userId },
    ]);

    if (!res.success) {
      Alert.alert("Post", "Something went wrong");
    }
  };

  const onRemoveLike = async () => {
    if (currentUser?.userData?.id == null) {
      Alert.alert(`User is not authenticated`);
      return;
    }

    setIsLikeOwner(false);
    setLikes(likes.filter((like) => like?.userId != currentUser?.userData?.id));

    let data: PostLikeBody = {
      userId: currentUser?.userData?.id,
      postId: item?.id,
    };

    let res = await removePostLike(data);

    if (!res.success) {
      Alert.alert("Post", "Something went wrong");
    }
  };

  const onComment = () => {
    router.push({
      pathname: "/postDetails",
      params: { postId: item.id },
    });
  };

  const onShare = async () => {
    let uri = "";
    if (item?.file) {
      setLoading(true);
      uri =
        (await downloadFile(getSupabaseFileUrl(item?.file)?.uri || "")) || "";
      setLoading(false);
    }

    console.log("Content post", item?.body);
    const content: ShareContent = {
      message: stripHtmlTags(item?.body),
      url: uri,
    };
    console.log("Content share", JSON.stringify(content));
    Share.share(content);
  };

  const onDownload = async () => {
    if (item?.file) {
      setLoading(true);
      const savedPath = await downloadFileAsync(
        getSupabaseFileUrl(item?.file)?.uri || ""
      );
      setLoading(false);
      console.log("Downloaded file path:", savedPath);
    } else {
      Alert.alert("Post", "Not have file media included");
    }
  };

  const onDeletingPost = async () => {
    setLoadingDeletingPost(true);
    let res = await removePost(item.id);
    if (res.success) {
      router.push("/home");
    } else {
      Alert.alert("Post", res.message);
    }
    setLoadingDeletingPost(false);
  };

  const onDeletePost = async () => {
    Alert.alert("Post", "This post will be deleted forever!", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: onDeletingPost,
        style: "destructive",
      },
    ]);
  };

  const onUpdatePost = async () => {};

  return (
    <View style={[styles.container, hasShadow && ShadowStyles]}>
      <View style={styles.header}>
        {/* user info */}
        <View style={styles.userInfo}>
          <Avatar
            size={hp(4.5)}
            uri={item?.user?.image}
            rounded={theme.radius.md}
          />
          <View style={{ gap: 2 }}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            <Text style={styles.postTime}>
              {getFormattedDate(item?.created_at)}
            </Text>
          </View>
        </View>

        {disableBackIcon ? (
          <TouchableOpacity onPress={openPostDetails}>
            <Icon
              name="threeDotsHorizontal"
              size={hp(3.4)}
              strokeWidth={3}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        ) : (
          <>
            {isEditPost ? (
              <View style={styles.actions}>
                {loadingDeletingPost ? (
                  <View>
                    <Loading size="small" />
                  </View>
                ) : (
                  <>
                    <TouchableOpacity onPress={onDeletePost}>
                      <Icon
                        name="delete"
                        size={hp(3.4)}
                        strokeWidth={2}
                        color={theme.colors.rose}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/newPosts",
                          params: { postId: item.id },
                        })
                      }
                    >
                      <Icon
                        name="edit"
                        size={hp(3.4)}
                        strokeWidth={2}
                        color={theme.colors.text}
                      />
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity
                  onPress={() => {
                    setIsEditPost(false);
                  }}
                >
                  <Icon
                    name="backward"
                    size={hp(3.4)}
                    strokeWidth={2}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.actions}>
                {isPostOwner && (
                  <TouchableOpacity
                    onPress={() => {
                      setIsEditPost(true);
                    }}
                  >
                    <Icon
                      name="threeDotsHorizontal"
                      size={hp(3.4)}
                      strokeWidth={2}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => router.push("/home")}>
                  <Icon
                    name="backward"
                    size={hp(3.4)}
                    strokeWidth={2}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* post body & media */}
      <View style={styles.content}>
        <View style={styles.postBody}>
          <RenderHtml
            contentWidth={wp(100)}
            source={{ html: item?.body || "" }}
            tagsStyles={tagsStyles}
          />
        </View>

        {/* post image */}
        {item?.file && item?.file?.includes(SUPABASE_FOLDER_NAME.IMAGE) && (
          <Image
            source={getSupabaseFileUrl(item?.file)}
            transition={100}
            style={styles.postMedia}
            contentFit="cover"
          />
        )}

        {/* post video */}
        {item?.file && item?.file?.includes(SUPABASE_FOLDER_NAME.VIDEO) && (
          <Video
            style={[styles.postMedia, { height: hp(30) }]}
            source={{ uri: getSupabaseFileUrl(item?.file)?.uri || "" }}
            useNativeControls
            isLooping
            resizeMode={ResizeMode.COVER}
          />
        )}
      </View>

      {/* like, cmt, share */}
      <View style={styles.footer}>
        {/* like */}
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={isLikeOwner ? onRemoveLike : onLike}>
            <Icon
              name="heart"
              size={24}
              color={isLikeOwner ? theme.colors.rose : theme.colors.dark}
              fill={isLikeOwner ? theme.colors.rose : "transparent"}
            />
          </TouchableOpacity>
          <Text style={styles.count}>{likes?.length || 0}</Text>
        </View>
        {/* comment */}
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={onComment} disabled={disableMoreIcon}>
            <Icon name="comment" size={24} color={theme.colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.count}>{comments?.length || 0}</Text>
        </View>
        {/* share and download */}
        {loading ? (
          <View style={styles.footerButton}>
            <Loading size="small" />
          </View>
        ) : (
          <>
            <View style={styles.footerButton}>
              <TouchableOpacity onPress={onShare}>
                <Icon name="share" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>
            <View style={styles.footerButton}>
              <TouchableOpacity onPress={onDownload}>
                <Icon
                  name="download"
                  strokeWidth={4}
                  size={32}
                  color={theme.colors.textLight}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl * 1.1,
    borderCurve: "continuous",
    padding: 10,
    paddingVertical: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  username: {
    fontSize: hp(1.7),
    color: theme.colors.dark,
    fontWeight: theme.fonts.medium,
  },
  postTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  content: {
    gap: 10,
  },
  postMedia: {
    height: hp(40),
    width: "100%",
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  footerButton: {
    marginLeft: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  },
});

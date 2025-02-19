import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import {
  Comment,
  CommentPostBody,
  createCommentPost,
  getPostDetails,
  PostViewer,
  removeCommentPost,
} from "@/services/postService";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "@/components/PostCard";
import Loading from "@/components/Loading";
import Input from "@/components/Input";
import Icon from "@/assets/icons";
import CommentItem from "@/components/CommentItem";

const postDetails = () => {
  const router = useRouter();
  const { postId } = useLocalSearchParams();
  const authContext = useAuth();

  if (!postId || !authContext) {
    router.push("/home");
    return;
  }

  const { user } = authContext;
  const [post, setPost] = useState<PostViewer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingSendComment, setLoadingSendComment] = useState<boolean>(false);
  const inputRef = useRef<TextInput>(null);
  const commentRef = useRef("");
  const [isKeyboardShow, setIsKeyboardShow] = useState(false);

  const gettingPostDetails = async () => {
    let res = await getPostDetails(postId as string, user?.authInfo?.id || "");

    if (res.success) {
      setPost(res.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    gettingPostDetails();

    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardShow(true);
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardShow(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }

  if (!post) {
    return (
      <View
        style={[styles.center, { justifyContent: "center", marginTop: 100 }]}
      >
        <Text style={styles.notFound}>Post not found!</Text>
      </View>
    );
  }

  const onNewComment = async () => {
    if (!commentRef.current) return;

    setLoadingSendComment(true);

    let data: CommentPostBody = {
      userId: user?.authInfo?.id || "",
      postId: postId as string,
      text: commentRef.current,
    };

    let res = await createCommentPost(data);
    
    if (res.success) {
      inputRef.current?.clear();
      commentRef.current = "";

      // setPost((prevPost) => {
      //   if (!prevPost) return prevPost;
      //   let updatedPost: PostViewer = { ...prevPost };
      //   updatedPost.comments = [res.data, ...updatedPost.comments]
      //   return updatedPost;
      // });

      setPost((prevPost) => {
        if (!prevPost) return prevPost;
        return {
          ...prevPost,
          comments: [res.data, ...prevPost.comments],
        };
      });
      
    } else {
      Alert.alert("Comment", res.message);
    }

    setLoadingSendComment(false);
  };

  const onRemovingComment = async (comment: Comment) => {
    let res = await removeCommentPost(comment.id);
    if (res.success) {
      setPost((prevPost) => {
        if (!prevPost) return prevPost;
        let updatedPost: PostViewer = { ...prevPost };
        updatedPost.comments = updatedPost.comments?.filter(
          (_) => _.id != comment.id
        );
        return updatedPost;
      });
    } else {
      Alert.alert("Comment", res.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {post && (
            <PostCard
              item={post}
              currentUser={user}
              router={router}
              hasShadow={false}
              disableMoreIcon={true}
              disableBackIcon={false}
            />
          )}
          <View style={styles.inputContainer}>
            <Input
              inputRef={inputRef}
              placeholder="Type comment..."
              onChangeText={(value) => (commentRef.current = value)}
              placeholderTextColor={theme.colors.textLight}
              containerStyle={{
                flex: 1,
                height: hp(6.2),
                borderRadius: theme.radius.xl,
              }}
            />
            {loadingSendComment ? (
              <View style={styles.loading}>
                <Loading size="small" />
              </View>
            ) : (
              <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
                <Icon name="send" color={theme.colors.primaryDark} />
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>

        {/* commenst */}
        {!isKeyboardShow && (
          <View style={{ marginVertical: 15, gap: 17, paddingBottom: 40 }}>
            {post?.comments &&
              post.comments.map((comment) => (
                <CommentItem
                  key={comment.id.toString()}
                  comment={comment}
                  isCommentOwner={
                    user?.authInfo?.id == comment.user.id ||
                    user?.authInfo?.id == post.id
                  }
                  removingComment={onRemovingComment}
                />
              ))}

            {post?.comments.length === 0 && (
              <Text style={{ color: theme.colors.text, marginLeft: 5 }}>
                Write the first comment!
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default postDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: wp(7),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  list: {
    paddingHorizontal: wp(4),
  },
  sendIcon: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    height: hp(5.8),
    width: hp(5.8),
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  loading: {
    height: hp(5.8),
    width: hp(5.8),
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 1.3 }],
  },
});

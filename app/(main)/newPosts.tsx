import Icon from "@/assets/icons";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import Header from "@/components/Header";
import RichTextEditor from "@/components/RichTextEditor";
import ScreenWarpper from "@/components/ScreenWrapper";
import { theme } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { getFilePath, getSupabaseFileUrl, hp, wp } from "@/helpers/common";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Video, ResizeMode } from "expo-av";
import {
  createOrUpdatePost,
  getPostDetails,
  Post,
  PostViewer,
} from "@/services/postService";
import { RichEditorProps } from "react-native-pell-rich-editor";

const newPosts = () => {
  const AuthContext = useAuth();
  if (!AuthContext) {
    console.warn("AuthContext is not found");
    return null;
  }
  const { user } = AuthContext;
  const bodyRef = useRef("");
  const editorRef = useRef<RichEditorProps | any>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<ImagePicker.ImagePickerAsset | string>();
  const params = useLocalSearchParams();
  const [post, setPost] = useState<PostViewer | null>(null);

  const gettingPostDetails = async (postId: string) => {
    const res = await getPostDetails(postId, user?.authInfo?.id || "");
    if (res.success) {
      const postDetail = res.data as PostViewer;
      setPost(postDetail);
      bodyRef.current = postDetail.body;
      setFile(postDetail.file);
      editorRef?.current?.setContentHTML(postDetail.body);
    } else {
      Alert.alert("Post", res.message);
      router.push("/home");
    }
  };

  const onPickFile = async (isImage: boolean) => {
    const mediaPickImageConfig: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      quality: 0.7,
    };
    const mediaPickVideoConfig: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["videos"],
      allowsEditing: true,
      quality: 0.5,
    };
    let result = await ImagePicker.launchImageLibraryAsync(
      isImage ? mediaPickImageConfig : mediaPickVideoConfig
    );

    if (!result.canceled) {
      const fileSize = result.assets[0].fileSize
        ? result.assets[0].fileSize
        : 0;
      if (fileSize <= 10485760 * 4) {
        setFile(result.assets[0]);
      } else {
        Alert.alert("Post", "File size must be less than or equal to 40MB");
      }
    }
  };

  const onSubmit = async () => {
    // console.log("Content", bodyRef.current);
    // console.log("File", file);

    if (!bodyRef.current) {
      Alert.alert("Post", "Please fill in the content you wannt to post");
      return;
    }
    if (!file) {
      Alert.alert("Post", "Please choose an image or video you want to post");
      return;
    }

    let data: Post = {
      userId: user?.authInfo?.id || '',
      body: bodyRef.current,
      file,
    };

    if (post && post.id) data.id = post.id;

    setLoading(true);
    // 🔄️
    let res = await createOrUpdatePost(data);
    setLoading(false);

    if (res.success) {
      console.log(`Uploading Post Result -> ${res.data}`);
      setFile(undefined);
      bodyRef.current = "";
      editorRef.current = null;
      if (post) {
        router.push({pathname: '/postDetails', params: {postId: post.id}});
      } else {
        router.back();
      }
    } else {
      Alert.alert("Post", res.message);
    }
  };

  const getFileType = (file: ImagePicker.ImagePickerAsset | string) => {
    if (!file) return;
    if (typeof file == "object") {
      return file.type;
    }
    // check image or video uploaded on cloud
    if (file.includes("postImages")) {
      return "image";
    }
    return "video";
  };

  const getFileUri = (file: ImagePicker.ImagePickerAsset | string) => {
    if (!file) return undefined;
    if (typeof file == "object") {
      return file.uri as string;
    }
    return getSupabaseFileUrl(file) ? getSupabaseFileUrl(file)?.uri : undefined;
  };

  useEffect(() => {
    // *Note: Default params will have __EXPO_ROUTER_key
    if (Object.keys(params).length > 1) {
      const postId = params.postId;
      gettingPostDetails(postId as string);
    }
  }, []);

  return (
    <ScreenWarpper>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={32}
      >
        <Header title={post ? "Bài viết của bạn" : "Bài viết mới"} />
        <ScrollView
          contentContainerStyle={{ gap: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* avatar */}
          <View style={styles.header}>
            <Avatar
              uri={user?.userData?.image}
              size={hp(6.5)}
              rounded={theme.radius.xl}
            />
            <View style={{ gap: 2 }}>
              <Text style={styles.username}>
                {user && user?.userData?.name}
              </Text>
              <Text style={styles.publicText}>Công khai</Text>
            </View>
          </View>

          <View style={styles.textEditor}>
            <RichTextEditor
              editorRef={editorRef}
              onChange={(body) => (bodyRef.current = body)}
            />
          </View>

          {file && (
            <View style={styles.file}>
              {getFileType(file) == "video" ? (
                <Video
                  style={{ flex: 1 }}
                  source={{ uri: getFileUri(file) || "" }}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  isLooping
                />
              ) : (
                <Image
                  source={{ uri: getFileUri(file) }}
                  resizeMode="cover"
                  style={{ flex: 1 }}
                />
              )}
              {post ? (
                <></>
              ) : (
                <Pressable
                  style={styles.closeIcon}
                  onPress={() => setFile(undefined)}
                >
                  <Icon name="delete" size={20} color="white" />
                </Pressable>
              )}
            </View>
          )}

          <View style={styles.media}>
            <Text style={styles.addImageText}>
              {post ? "Cập nhật hình ảnh/video của bài viết" : "Thêm hình ảnh/video"}
            </Text>
            <View style={styles.mediaIcons}>
              <TouchableOpacity onPress={() => onPickFile(true)}>
                <Icon name="image" size={30} color={theme.colors.dark} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPickFile(false)}>
                <Icon name="video" size={33} color={theme.colors.dark} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Button
          buttonStyle={{ height: hp(6.2) }}
          title={post ? "Cập nhật" : "Đăng"}
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </KeyboardAvoidingView>
    </ScreenWarpper>
  );
};

export default newPosts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "red",
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  title: {
    marginBottom: 10,
    fontSize: hp(2.5),
    fontWeight: theme.fonts.semibold,
    textAlign: "center",
    color: theme.colors.text,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  avatar: {
    height: hp(6.5),
    width: hp(6.5),
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  textEditor: {
    // marginTop: 10,
  },
  media: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderColor: theme.colors.gray,
  },
  mediaIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  addImageText: {
    fontSize: hp(1.9),
    color: theme.colors.dark,
    fontWeight: theme.fonts.bold,
  },
  file: {
    height: hp(30),
    width: "100%",
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    borderCurve: "continuous",
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: theme.colors.rose,
    padding: 5,
    borderRadius: 50,
  },
});

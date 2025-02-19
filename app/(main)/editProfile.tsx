import Icon from "@/assets/icons";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Input from "@/components/Input";
import ScreenWarpper from "@/components/ScreenWrapper";
import { theme } from "@/constants/theme";
import { SupaUser, useAuth } from "@/contexts/AuthContext";
import { getImageSource, hp, wp } from "@/helpers/common";
import { updateUser } from "@/services/userService";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadFile } from "@/services/imageService";

const EditProfile = () => {
  const AuthContext = useAuth();
  if (!AuthContext) {
    console.warn("AuthContext is not found");
    return null;
  }
  const { user: currentUserData, setUserData } = AuthContext;

  const [user, setUser] = useState<SupaUser>({
    id: "",
    name: "",
    email: "",
    image: null,
    bio: "",
    address: "",
    phoneNumber: "",
    createdAt: "",
  });

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isKeyboardShow, setIsKeyboardShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (currentUserData && currentUserData?.userData) {
      setUser(currentUserData?.userData);
    }
  }, [currentUserData]);

  useEffect(() => {
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

  const onSubmit = async () => {
    let userData = { ...user };
    let { name, phoneNumber, address, image, bio } = userData;
    if (!name || !phoneNumber || !address || !bio || !image) {
      Alert.alert("Profile", "Please fill all the fields!");
      return;
    }

    setLoading(true);

    // 🔄️ Update image and get imagePath from supabase
    let imageRes = await uploadFile("profiles", image, true);
    if (imageRes.success) {
      userData.image = imageRes.data;
    } else {
      userData.image = null;
    }

    // 🔄️ Update user
    const newUserData = await updateUser(userData);
    console.log("Updating user -> Result:", newUserData);

    if (newUserData.success) {
      // ✅ Success work to-do
      setUserData(newUserData.data);
      setUser(newUserData.data);
      router.push("/profile");
    } else {
      // ❌ Error work to-do
      Alert.alert("Profile", "Error while updating user");
      console.warn(
        `Edit Profile - Error while updating user | ${newUserData.message}`
      );
    }
    setLoading(false);
  };

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      setImage(selectedImage);
      setUser((prev) => ({ ...prev, image: selectedImage.uri }));
    }
  };

  return (
    <ScreenWarpper bg="white">
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <Header title="Edit Profile" />

          {/* form */}
          <View style={styles.form}>
            <View style={styles.avatarContainer}>
              <Image
                source={image ? image.uri : getImageSource(user?.image)}
                style={styles.avatar}
              />
              <Pressable style={styles.camemraIcon} onPress={onPickImage}>
                <Icon name="camera" strokeWidth={2} size={20} />
              </Pressable>
            </View>

            <Text
              style={{
                fontSize: hp(1.5),
                color: theme.colors.text,
              }}
            >
              Please full your profile details
            </Text>
            <Input
              icon={<Icon name="user" />}
              placeholder="Enter your name"
              value={user?.name}
              onChangeText={(value) => {
                setUser((prev) => ({ ...prev, name: value }));
              }}
            />
            <Input
              icon={<Icon name="call" />}
              placeholder="Enter your phone number"
              value={user?.phoneNumber}
              onChangeText={(value) => {
                setUser((prev) => ({ ...prev, phoneNumber: value }));
              }}
            />
            <Input
              icon={<Icon name="location" />}
              placeholder="Enter your address"
              value={user?.address}
              onChangeText={(value) => {
                setUser((prev) => ({ ...prev, address: value }));
              }}
            />
            <Input
              placeholder="Enter your bio"
              value={user?.bio}
              multiline={true}
              onChangeText={(value) => {
                setUser((prev) => ({ ...prev, bio: value }));
              }}
              containerStyle={styles.bio}
            />
            <Button title="Update" loading={loading} onPress={onSubmit} />
            <View style={isKeyboardShow ? { height: hp(45) } : {}}></View>
          </View>
        </ScrollView>
      </View>
    </ScreenWarpper>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  avatarContainer: {
    height: hp(14),
    width: hp(14),
    alignSelf: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: theme.radius.xxl * 1.8,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: theme.colors.darkLight,
  },
  camemraIcon: {
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
  form: {
    gap: 18,
    marginTop: 20,
  },
  input: {
    flexDirection: "row",
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    borderCurve: "continuous",
    padding: 17,
    paddingHorizontal: 20,
    gap: 15,
  },
  bio: {
    flexDirection: "row",
    height: hp(15),
    alignItems: "flex-start",
    paddingVertical: 15,
  },
});

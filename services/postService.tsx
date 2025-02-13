import * as ImagePicker from "expo-image-picker";
import { SupaResponse } from "./userService";
import { uploadFile } from "./imageService";
import { supabase } from "@/lib/supabase";

export interface Post {
  userId: string;
  file: ImagePicker.ImagePickerAsset;
  body: string;
}

export const createOrUpdatePost = async (post: Post): Promise<SupaResponse> => {
  try {
    let postData = {...post}
    // 🔄️ Uploading file
    let isImage = postData.file.type == "image";
    let folderName = isImage ? "postImages" : "postVideos";
    let fileResult = await uploadFile(folderName, postData.file.uri, isImage)
    if(fileResult.success) {
      postData.file = fileResult.data;
    } else {
      return fileResult;
    }
    // 🔄️ Uploading post
    const {data, error} = await supabase.from('posts').upsert(post). select().single();
    // ❌ Error
    if (error) {
      console.warn(`Error uploading post of ${post.userId} | ${error}`);
      return {
        success: false,
        message: "Error uploading post",
        data: null,
      };
    }

    // ✅ Success
    return {
      success: true,
      message: "Uploading post successfully",
      data: data,
    };
  } catch (error) {
    // ❌ Error
    console.warn(`Post Service - Error uploading post of ${post.userId} | ${error}`);
    return {
      success: false,
      message: "Error uploading post",
      data: null,
    };
  }
};

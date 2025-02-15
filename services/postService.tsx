import * as ImagePicker from "expo-image-picker";
import { SupaResponse } from "./userService";
import { uploadFile } from "./imageService";
import { supabase } from "@/lib/supabase";

const SERVICE_NAME = "Post Serivce";

export interface Post {
  userId: string;
  file: ImagePicker.ImagePickerAsset;
  body: string;
}

export interface PostViewer {
  user: {
    id: string;
    name: string;
    image: string;
  };
  postLikes: {
    id: string;
    userId: string;
  }[];
  body: string;
  created_at: string;
  file: string;
  id: string;
  userId: string;
}

export const createOrUpdatePost = async (post: Post): Promise<SupaResponse> => {
  const taskName = "creating or updating post";
  try {
    let postData = { ...post };
    // 🔄️ Uploading file
    let isImage = postData.file.type == "image";
    let folderName = isImage ? "postImages" : "postVideos";
    let fileResult = await uploadFile(folderName, postData.file.uri, isImage);
    if (fileResult.success) {
      postData.file = fileResult.data;
    } else {
      return fileResult;
    }
    // 🔄️ Uploading post
    const { data, error } = await supabase
      .from("posts")
      .upsert(postData)
      .select()
      .single();

    // ❌ Error
    if (error) {
      console.warn(
        `${SERVICE_NAME} - Error while ${taskName} of ${postData.userId} | ${error.message}`
      );
      return {
        success: false,
        message: `Error while ${taskName}`,
        data: null,
      };
    }

    // ✅ Success
    return {
      success: true,
      message: `${taskName} successfully`,
      data: data as PostViewer,
    };
  } catch (error) {
    // ❌ Error
    console.warn(
      `${SERVICE_NAME} - Error while ${taskName} of ${post.userId} | ${error}`
    );
    return {
      success: false,
      message: `${taskName} successfully`,
      data: null,
    };
  }
};

export const numPostsReturn = 5;

export const getPosts = async (page: number): Promise<SupaResponse> => {
  const taskName = "getting posts";
  try {
    // 🔄️ Getting posts
    const { data, error } = await supabase
      .from("posts")
      .select(`*, user: users(id, name, image), postLikes(id, userId)`)
      .order("created_at", { ascending: false })
      .range((page - 1) * numPostsReturn, page * numPostsReturn - 1);

    if (error) {
      // ❌ Error
      console.warn(`${SERVICE_NAME} - Error fetching post | ${error.message}`);
      return {
        success: false,
        message: `Error while ${taskName}`,
        data: null,
      };
    }

    // ✅ Success
    console.log(`${SERVICE_NAME} - ${taskName} of page ${page}`);
    return {
      success: true,
      message: `${taskName} successfully`,
      data: data as PostViewer[],
    };
  } catch (error) {
    // ❌ Error
    console.warn(`${SERVICE_NAME} - Error while ${taskName} | ${error}`);
    return {
      success: false,
      message: `Error while ${taskName}`,
      data: null,
    };
  }
};

export interface PostLikeBody {
  postId: string;
  userId: string;
}

export interface PostLike {
  id: string;
  created_at: string;
  postId: string;
  userId: string;
}

export const createPostLike = async (
  postLike: PostLikeBody
): Promise<SupaResponse> => {
  const taskName = "creating postLike";
  try {
    // 🔄️ Getting posts
    const { data, error } = await supabase
      .from("postLikes")
      .insert(postLike)
      .select()
      .single();

    if (error) {
      // ❌ Error
      console.warn(
        `${SERVICE_NAME} - Error while ${taskName} | ${error.message}`
      );
      return {
        success: false,
        message: `Error while ${taskName}`,
        data: null,
      };
    }

    // ✅ Success
    console.log(`${SERVICE_NAME} - ${taskName} of user ${postLike.userId}`);
    return {
      success: true,
      message: `${taskName} successfully`,
      data: data as PostLike,
    };
  } catch (error) {
    // ❌ Error
    console.warn(`${SERVICE_NAME} - Error while ${taskName} | ${error}`);
    return {
      success: false,
      message: `Error while ${taskName}`,
      data: null,
    };
  }
};

export const removePostLike = async (
  postLike: PostLikeBody
): Promise<SupaResponse> => {
  const taskName = "removing postLike";
  try {
    // 🔄️ Getting posts
    const { data, error } = await supabase
      .from("postLikes")
      .delete()
      .eq("userId", postLike.userId)
      .eq("postId", postLike.postId);

    if (error) {
      // ❌ Error
      console.warn(
        `${SERVICE_NAME} - Error while ${taskName} | ${error.message}`
      );
      return {
        success: false,
        message: `Error while ${taskName}`,
        data: null,
      };
    }

    // ✅ Success
    console.log(`${SERVICE_NAME} - ${taskName} of user ${postLike.userId}`);
    return {
      success: true,
      message: `${taskName} successfully`,
      data: null,
    };
  } catch (error) {
    // ❌ Error
    console.warn(`${SERVICE_NAME} - Error while ${taskName} | ${error}`);
    return {
      success: false,
      message: `Error while ${taskName}`,
      data: null,
    };
  }
};

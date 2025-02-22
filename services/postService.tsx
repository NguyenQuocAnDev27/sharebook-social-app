import * as ImagePicker from "expo-image-picker";
import { APIResponse } from "./userService";
import { uploadFile } from "./imageService";
import { supabase } from "@/lib/supabase";

const SERVICE_NAME = "Post Serivce";

export interface Post {
  id?: string;
  userId: string;
  file: ImagePicker.ImagePickerAsset | string;
  body: string;
}

export interface PostViewer {
  user: {
    id: string;
    name: string;
    image: string;
    expoPushToken: string;
  };
  postLikes: {
    id: string;
    userId: string;
  }[];
  comments: {
    id: string;
    postId: string;
    text: string;
    user: {
      id: string;
      name: string;
      image: string;
    };
    created_at: string;
  }[];
  body: string;
  created_at: string;
  file: string;
  id: string;
  userId: string;
  isLikeOwner: boolean;
}

export const createOrUpdatePost = async (post: Post): Promise<APIResponse> => {
  const taskName = "creating or updating post";
  try {
    let postData = { ...post };
    // 🔄️ Uploading file
    if (typeof postData.file !== "string") {
      let isImage = postData.file.type == "image";
      let folderName = isImage ? "postImages" : "postVideos";
      let fileResult = await uploadFile(folderName, postData.file.uri, isImage);
      if (fileResult.success) {
        postData.file = fileResult.data;
      } else {
        return fileResult;
      }
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

export const getPosts = async (
  page: number,
  userId: string
): Promise<APIResponse> => {
  const taskName = "getting posts";

  try {
    // 🔄️ Getting posts
    const { data, error } = await supabase
      .from("posts")
      .select(
        `*, user: users(id, name, image), postLikes(id, userId), comments (*, user: users(id, name, image))`
      )
      .order("created_at", { ascending: false })
      .range((page - 1) * numPostsReturn, page * numPostsReturn - 1);

    if (error) {
      // ❌ Error
      console.warn(
        `${SERVICE_NAME} - Error while ${taskName}| ${error.message}`
      );
      return {
        success: false,
        message: `Error while ${taskName}`,
        data: null,
      };
    }

    const formattedData: PostViewer[] = data.map((postViewer: PostViewer) => {
      const isLikeOwner =
        postViewer.postLikes.some((like) => like?.userId === userId) ?? false;
      return {
        ...postViewer,
        isLikeOwner,
      };
    });

    // ✅ Success
    console.log(`${SERVICE_NAME} - ${taskName} of page ${page}`);
    return {
      success: true,
      message: `${taskName} successfully`,
      data: formattedData,
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

export const getYourPosts = async (
  page: number,
  userId: string
): Promise<APIResponse> => {
  const taskName = "getting posts";

  try {
    // 🔄️ Getting posts
    const { data, error } = await supabase
      .from("posts")
      .select(
        `*, user: users(id, name, image), postLikes(id, userId), comments (*, user: users(id, name, image, expoPushToken))`
      )
      .eq("userId", userId)
      .order("created_at", { ascending: false })
      .range((page - 1) * numPostsReturn, page * numPostsReturn - 1);

    if (error) {
      // ❌ Error
      console.warn(
        `${SERVICE_NAME} - Error while ${taskName}| ${error.message}`
      );
      return {
        success: false,
        message: `Error while ${taskName}`,
        data: null,
      };
    }

    const formattedData: PostViewer[] = data.map((postViewer: PostViewer) => {
      const isLikeOwner =
        postViewer.postLikes.some((like) => like?.userId === userId) ?? false;
      return {
        ...postViewer,
        isLikeOwner,
      };
    });

    // ✅ Success
    console.log(`${SERVICE_NAME} - ${taskName} of page ${page}`);
    return {
      success: true,
      message: `${taskName} successfully`,
      data: formattedData,
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

export const removePost = async (postId: string): Promise<APIResponse> => {
  const taskName = "removing post";
  try {
    // 🔄️ Getting posts
    const { error } = await supabase.from("posts").delete().eq("id", postId);

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
    console.log(`${SERVICE_NAME} - ${taskName}`);
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
): Promise<APIResponse> => {
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
): Promise<APIResponse> => {
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

export const getPostDetails = async (
  postId: string,
  userId: string
): Promise<APIResponse> => {
  const taskName = "getting postDetails";
  try {
    // 🔄️ Getting posts
    const { data, error } = await supabase
      .from("posts")
      .select(
        `*, user: users (id, name, image, expoPushToken), postLikes (*), comments (*, user: users(id, name, image))`
      )
      .eq("id", postId)
      .order("created_at", { ascending: false, foreignTable: "comments" })
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

    const checkIsLikeOwner = (postViewer: PostViewer, userId?: string) =>
      !!postViewer?.postLikes?.some((like) => like?.userId === userId);

    const formattedData: PostViewer | null =
      typeof data === "object" && data !== null
        ? {
            ...(data as PostViewer),
            isLikeOwner: checkIsLikeOwner(data as PostViewer, userId),
          }
        : null;

    // ✅ Success
    console.log(`${SERVICE_NAME} - ${taskName} of post ${postId}`);
    return {
      success: true,
      message: `${taskName} successfully`,
      data: formattedData,
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

export interface CommentPostBody {
  userId: string;
  postId: string;
  text: string;
}

export const createCommentPost = async (
  commentBody: CommentPostBody
): Promise<APIResponse> => {
  const taskName = "creating comment";
  try {
    // 🔄️ Getting posts
    const { data, error } = await supabase
      .from("comments")
      .insert(commentBody)
      .select("*, user: users(id, name, image)")
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
    console.log(`${SERVICE_NAME} - ${taskName} of user ${commentBody.userId}`);
    return {
      success: true,
      message: `${taskName} successfully`,
      data: data as Comment,
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

export interface Comment {
  id: string;
  postId: string;
  text: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
  created_at: string;
}

export const removeCommentPost = async (
  commentId: string
): Promise<APIResponse> => {
  const taskName = "removing comment";
  try {
    // 🔄️ Getting posts
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

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
    console.log(`${SERVICE_NAME} - ${taskName} ${commentId}`);
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

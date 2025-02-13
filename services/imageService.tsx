import { getFilePath } from "@/helpers/common";
import { SupaResponse } from "./userService";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { supabase } from "@/lib/supabase";

export const uploadFile = async (
  folderName: string,
  fileUri: string,
  isImage: boolean = true
): Promise<SupaResponse> => {
  try {
    let fileName = getFilePath(folderName, isImage);
    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    let imageData = decode(fileBase64);

    let { data, error } = await supabase.storage
      .from("uploads")
      .upload(fileName, imageData, {
        cacheControl: "3600",
        upsert: false,
        contentType: isImage ? "image/*" : "video/*",
      });

    if (error) {
      // ❌ Error
      console.warn(`Error while uploading ${fileUri} | ${error}`);
      return {
        success: false,
        message: `Error while uploading ${fileUri} | ${error}`,
        data: null,
      };
    }

    // ✅ Success
    return {
      success: true,
      message: "File data uploading successfully",
      data: data?.path,
    };
  } catch (error) {
    // ❌ Error
    console.warn(`Image Service - Error while uploading file | ${error}`);
    return {
      success: false,
      message: `Error while uploading ${fileUri} | ${error}`,
      data: null,
    };
  }
};

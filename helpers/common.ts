import { supabaseUrl } from "@/constants";
import { Dimensions } from "react-native";

export const { width: deviceWidth, height: deviceHeight } =
  Dimensions.get("window");

export const hp = (percentage: number) => {
  return (percentage * deviceHeight) / 100;
};

export const wp = (percentage: number) => {
  return (percentage * deviceWidth) / 100;
};

export const getImageSource = (uri: string | undefined | null) => {
  if(uri  === undefined || uri === null) {
    const defaultUserImage = require("../assets/images/defaultUser.png");
    return defaultUserImage;
  }
  return getSupabaseFileUrl(uri)?.uri;
};

export const getSupabaseFileUrl = (filePath: string) => {
  // console.log(`FilePath: ${filePath}`)
  if (filePath) {
    return {
      uri: `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`,
    };
  }
  return null;
};

export const getFilePath = (folderName: string, isImage: boolean) => {
  return `/${folderName}/${new Date().getTime()}${isImage ? ".png" : ".mp4"}`;
};

export const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/gm, '');
};

export const supabaseUrl: string = process.env
  .EXPO_PUBLIC_SUPABASE_URL as string;
export const supabaseAnonKey: string = process.env
  .EXPO_PUBLIC_SUPABASE_ANONKEY as string;

export const SUPABASE_FOLDER_NAME = {
  IMAGE: "postImages" as string,
  VIDEO: "postVideos" as string,
}
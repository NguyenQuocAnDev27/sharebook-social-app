import { SupaUser } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export interface SupaResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

export const getUserData = async (userId: string): Promise<SupaResponse> => {
  try {
    // 🔄️ getting data
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    // ❌ Error
    if (error) {
      console.warn(`Error fetching user data for ${userId}`, error);
      return {
        success: false,
        message: "Error fetching user data",
        data: null,
      };
    }

    // ✅ Success
    return {
      success: true,
      message: "User data retrieved successfully",
      data: data as SupaUser,
    };
  } catch (error) {
    // ❌ Error
    console.warn(`Error fetching user data for ${userId}`, error);
    return {
      success: false,
      message: "Error fetching user data",
      data: null,
    };
  }
};

export const updateUser = async (user: SupaUser): Promise<SupaResponse> => {
  try {
    // 🔄️ updating data
    const { error } = await supabase
      .from("users")
      .update({
        name: user.name,
        image: user.image,
        bio: user.bio,
        address: user.address,
        phoneNumber: user.phoneNumber,
      })
      .eq("id", user.id);

    // ❌ Error
    if (error) {
      console.warn(`Error fetching user data for ${user.id}`, error);
      return {
        success: false,
        message: "Error fetching user data",
        data: null,
      };
    }

    // ✅ Success
    return {
      success: true,
      message: "User data retrieved successfully",
      data: user,
    };
  } catch (error) {
    // ❌ Error
    console.warn(`Error fetching user data for ${user.id}`, error);
    return {
      success: false,
      message: "Error fetching user data",
      data: null,
    };
  }
};

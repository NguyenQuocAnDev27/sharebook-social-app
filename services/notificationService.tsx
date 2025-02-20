import { supabase } from "@/lib/supabase";
import { SupaResponse } from "./userService";

const SERVICE_NAME = "Notification Service";

export interface Notification {
  id: string;
  senderId: string;
  receiverId: string;
  title: string;
  data: string;
  seen: boolean;
  created_at: string;
  sender: {
    id: string;
    name: string;
    image: string;
  };
}

export interface NotificationSchema {
  id: string;
  senderId: string;
  receiverId: string;
  title: string;
  data: string;
  seen: boolean;
}

export interface NotificationBody {
  senderId: string;
  receiverId: string;
  title: string;
  data: string;
}

export const createNotification = async (
  body: NotificationBody
): Promise<SupaResponse> => {
  const taskName = "creating notification";
  try {
    // 🔄️ Creating notification
    const { data, error } = await supabase
      .from("notifications")
      .upsert(body)
      .select(`*, sender: senderId(id, name, image)`)
      .single();

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

    // ✅ Success
    console.log(`${SERVICE_NAME} - ${taskName} sucessfully`);
    return {
      success: true,
      message: `${taskName} successfully`,
      data: data as Notification,
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

export const updateStatusNotification = async (
  notification: Notification
): Promise<SupaResponse> => {
  const taskName = "updating status notification";
  try {
    const newData: NotificationSchema = {
      id: notification.id,
      senderId: notification.senderId,
      receiverId: notification.receiverId,
      title: notification.title,
      data: notification.data,
      seen: true
    }

    // 🔄️ Creating notification
    const { data, error } = await supabase
      .from("notifications")
      .upsert(newData)
      .select(`*, sender: senderId(id, name, image)`)
      .single();

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

    // ✅ Success
    console.log(`${SERVICE_NAME} - ${taskName} sucessfully`);
    return {
      success: true,
      message: `${taskName} successfully`,
      data: data as Notification,
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

export const getNotifications = async (
  userId: string,
  getAll: boolean = true
): Promise<SupaResponse> => {
  const taskName = "getting notifications";
  try {
    // 🔄️ Getting notifications
    const { data, error } = getAll
      ? await supabase
          .from("notifications")
          .select(`*, sender: senderId(id, name, image)`)
          .eq("receiverId", userId)
          .order("created_at", { ascending: false })
      : await supabase
          .from("notifications")
          .select(`*, sender: senderId(id, name, image)`)
          .eq("receiverId", userId)
          .eq("seen", false)
          .order("created_at", { ascending: false });

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

    // ✅ Success
    console.log(`${SERVICE_NAME} - ${taskName} sucessfully`);
    return {
      success: true,
      message: `${taskName} successfully`,
      data: data as Notification[],
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

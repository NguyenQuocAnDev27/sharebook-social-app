import { supabase } from "@/lib/supabase";
import { APIResponse } from "./userService";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import { PermissionStatus } from "expo-modules-core";
import Constants from "expo-constants";
import { theme } from "@/constants/theme";
import { expo_token, supabasePushNotificationsUrl } from "@/constants";

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
): Promise<APIResponse> => {
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
): Promise<APIResponse> => {
  const taskName = "updating status notification";
  try {
    const newData: NotificationSchema = {
      id: notification.id,
      senderId: notification.senderId,
      receiverId: notification.receiverId,
      title: notification.title,
      data: notification.data,
      seen: true,
    };

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
): Promise<APIResponse> => {
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

export const removeNotification = async (
  notificationId: string
): Promise<APIResponse> => {
  const taskName = "removing notification";
  try {
    // 🔄️ Getting notifications
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

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
      data: notificationId,
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

export interface PushNotifcationState {
  notification?: Notifications.Notification;
  expoPushToken?: Notifications.ExpoPushToken;
}

export const usePushNotifications = (): PushNotifcationState => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >();
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  async function registerForNotificationsAsync() {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== PermissionStatus.GRANTED) {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== PermissionStatus.GRANTED) {
        Alert.alert("Notification", "Failed to push token");
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        throw new Error("Project ID not found");
      }
      token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: theme.colors.primary,
        });
      }

      return token;
    } else {
      console.log("ERROR: Please use a physical device");
    }
  }

  useEffect(() => {
    registerForNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current!
      );
      Notifications.removeNotificationSubscription(responseListener.current!);
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};

export const pushNotification = async (
  expo_push_token: string,
  userName: string,
  message: string
): Promise<APIResponse> => {
  const taskName = "pushing notifications";
  console.log(`${expo_push_token} | ${message}`);
  try {
    // 🔄️ Getting notifications
    const error = 0;
    const res = await fetch(supabasePushNotificationsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: expo_push_token,
        sound: "default",
        title: "ShareBook",
        body: `${userName} ${message}`,
      }),
    }).then((res) => res.json());

    console.log(JSON.stringify(res));

    if (error) {
      // ❌ Error
      console.warn(`${SERVICE_NAME} - Error while ${taskName}| ${res.message}`);
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

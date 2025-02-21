import React from "react";
import Home from "./Home";
import Mail from "./Mail";
import Lock from "./Lock";
import User from "./User";
import Heart from "./Heart";
import Plus from "./Plus";
import Search from "./Search";
import Location from "./Location";
import Call from "./Call";
import { theme } from "../../constants/theme";
import Camera from "./Camera";
import Edit from "./Edit";
import ArrowLeft from "./ArrowLeft";
import ThreeDotsCircle from "./ThreeDotsCircle";
import ThreeDotsHorizontal from "./ThreeDotsHorizontal";
import Comment from "./Comment";
import Share from "./Share";
import Send from "./Send";
import Delete from "./Delete";
import Logout from "./logout";
import Image from "./Image";
import Video from "./Video";
import Download from "./Download";
import LinkBackward from "./LinkBackward";
import Cancel from "./Cancel";
import Accept from "./Accept";
import SideBar from "./SideBar";
import Notification from "./Notification";
import EyeOff from "./EyeOff";
import TokenCircle from "./TokenCircle";

// Define an object that maps icon names to components
const icons = {
  home: Home,
  mail: Mail,
  lock: Lock,
  user: User,
  heart: Heart,
  plus: Plus,
  search: Search,
  location: Location,
  call: Call,
  camera: Camera,
  edit: Edit,
  arrowLeft: ArrowLeft,
  threeDotsCircle: ThreeDotsCircle,
  threeDotsHorizontal: ThreeDotsHorizontal,
  comment: Comment,
  share: Share,
  send: Send,
  delete: Delete,
  logout: Logout,
  image: Image,
  video: Video,
  download: Download,
  backward: LinkBackward,
  cancel: Cancel,
  accept: Accept,
  sidebar: SideBar,
  notification: Notification,
  eyeOff: EyeOff,
  tokenCircle: TokenCircle,

} as const;

// Define the type for valid icon names
type IconName = keyof typeof icons;

// Define the props for the Icon component
interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  color?: string;
  fill?: string;
}

// Create the Icon component with TypeScript
const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  strokeWidth = 1.9,
  color = theme.colors.textLight,
  fill = "none",
  ...props
}) => {
  const IconComponent = icons[name];

  // Ensure the icon exists before rendering
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found.`);
    return null;
  }

  return (
    <IconComponent
      height={size}
      width={size}
      strokeWidth={strokeWidth}
      color={color}
      fill={fill}
      {...props}
    />
  );
};

export default Icon;

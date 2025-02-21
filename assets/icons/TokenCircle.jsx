import * as React from "react"
import Svg, { Path, Circle } from "react-native-svg";

const TokenCircle = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"#000000"} fill={"none"} {...props}>
    <Path d="M11.5384 7.2534C11.7534 6.91553 12.2466 6.91553 12.4616 7.2534L13.0837 8.23082C13.7716 9.3117 14.6883 10.2284 15.7692 10.9163L16.7466 11.5384C17.0845 11.7534 17.0845 12.2466 16.7466 12.4616L15.7692 13.0837C14.6883 13.7716 13.7716 14.6883 13.0837 15.7692L12.4616 16.7466C12.2466 17.0845 11.7534 17.0845 11.5384 16.7466L10.9163 15.7692C10.2284 14.6883 9.3117 13.7716 8.23082 13.0837L7.2534 12.4616C6.91553 12.2466 6.91553 11.7534 7.2534 11.5384L8.23082 10.9163C9.3117 10.2284 10.2284 9.3117 10.9163 8.23082L11.5384 7.2534Z" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinejoin="round" />
    <Circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={props.strokeWidth} strokeLinejoin="round" />
</Svg>
);

export default TokenCircle;

import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  bg?: string;
}

const ScreenWarpper: React.FC<ScreenWrapperProps> = ({children, bg = 'white'}) => {
  const {top} = useSafeAreaInsets();
  const paddingTop = top>0 ? top+5 : 30;
  return (
    <View style={{flex: 1, paddingTop, backgroundColor: bg}}>
      {
        children
      }
    </View>
  );
};

export default ScreenWarpper;
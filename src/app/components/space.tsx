import React, { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';

interface SpaceProps {
  width?: number;
  height?: number;
  children?: ReactNode;
  style?: ViewStyle;
}

const Space: React.FC<SpaceProps> = ({ width, height, children, style }) => {
  return (
    <View style={[{ width, height }, style]}>
      {children}
    </View>
  );
};

export default Space;

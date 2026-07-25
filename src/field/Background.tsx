import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

type Props = {
  cameraX: SharedValue<number>;
  worldLength: number;
};

// 奥・手前の2枚のレイヤーを別の速度でスクロールさせる視差効果(パララックス)
function BackgroundComponent({ cameraX, worldLength }: Props) {
  const { width, height } = useWindowDimensions();
  const layerWidth = worldLength + width;

  const farStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -cameraX.value * 0.2 }],
  }));
  const nearStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -cameraX.value * 0.5 }],
  }));

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.layer,
          { width: layerWidth, height, backgroundColor: '#0d1b2a' },
          farStyle,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.hillsLayer, { width: layerWidth, height: height * 0.4 }, nearStyle]}
      />
    </>
  );
}

export const Background = React.memo(BackgroundComponent);

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  hillsLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#1b3a4b',
    borderTopLeftRadius: 300,
  },
});

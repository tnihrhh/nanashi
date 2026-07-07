import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { WORLD_LENGTH } from '../data/levelData';

type Props = {
  cameraX: number;
};

// 奥・手前の2枚のレイヤーを別の速度でスクロールさせる視差効果(パララックス)
function BackgroundComponent({ cameraX }: Props) {
  const { width, height } = useWindowDimensions();
  const layerWidth = WORLD_LENGTH + width;

  return (
    <>
      <View
        pointerEvents="none"
        style={[
          styles.layer,
          {
            width: layerWidth,
            height,
            backgroundColor: '#0d1b2a',
            transform: [{ translateX: -cameraX * 0.2 }],
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.hillsLayer,
          {
            width: layerWidth,
            height: height * 0.4,
            transform: [{ translateX: -cameraX * 0.5 }],
          },
        ]}
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

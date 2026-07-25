import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { GROUND_HEIGHT } from '../data/constants';
import { Platform } from '../data/levelData';

type Props = {
  cameraX: SharedValue<number>;
  worldLength: number;
  platforms: Platform[];
};

// 地面と足場を描画する。カメラの動きは transform だけで反映する(足場自体は動かないので静的)。
function WorldComponent({ cameraX, worldLength, platforms }: Props) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -cameraX.value }],
  }));

  return (
    <Animated.View style={[styles.world, { width: worldLength }, animatedStyle]}>
      <View style={[styles.ground, { width: worldLength, height: GROUND_HEIGHT }]} />
      {platforms.map((platform, index) => (
        <View
          key={index}
          style={[
            styles.platform,
            {
              left: platform.x,
              width: platform.width,
              height: platform.height,
              bottom: GROUND_HEIGHT + platform.y,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

export const World = React.memo(WorldComponent);

const styles = StyleSheet.create({
  world: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '100%',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#3a5a40',
  },
  platform: {
    position: 'absolute',
    backgroundColor: '#6b4226',
    borderRadius: 4,
  },
});

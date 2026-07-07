import React from 'react';
import { StyleSheet, View } from 'react-native';

import { GROUND_HEIGHT } from '../data/constants';
import { PLATFORMS, WORLD_LENGTH } from '../data/levelData';

type Props = {
  cameraX: number;
};

// 地面と足場を描画する。カメラが動いた時だけ再描画される。
function WorldComponent({ cameraX }: Props) {
  return (
    <View style={[styles.world, { width: WORLD_LENGTH, transform: [{ translateX: -cameraX }] }]}>
      <View style={[styles.ground, { width: WORLD_LENGTH, height: GROUND_HEIGHT }]} />
      {PLATFORMS.map((platform, index) => (
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
    </View>
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

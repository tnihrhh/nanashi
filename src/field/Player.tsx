import React from 'react';
import { StyleSheet, View } from 'react-native';

import { GROUND_HEIGHT, PLAYER_SIZE } from '../data/constants';

type Props = {
  x: number; // ステージ内の横位置
  y: number; // 地面からの高さ
  cameraX: number; // カメラの位置(画面に映す範囲)
  facing: 1 | -1; // 向いている方向
};

// React.memo: x/y/cameraX/facing のどれかが変わった時だけ再描画する。
function PlayerComponent({ x, y, cameraX, facing }: Props) {
  return (
    <View
      style={[
        styles.player,
        {
          left: x - cameraX - PLAYER_SIZE / 2,
          bottom: GROUND_HEIGHT + y,
          transform: [{ scaleX: facing }],
        },
      ]}
    />
  );
}

export const Player = React.memo(PlayerComponent);

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    backgroundColor: '#f4a261',
    borderRadius: 8,
  },
});

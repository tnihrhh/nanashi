import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { GROUND_HEIGHT, PLAYER_SIZE } from '../data/constants';

type Props = {
  worldX: SharedValue<number>; // ステージ内の横位置
  bottom: SharedValue<number>; // 地面からの高さ
  facing: SharedValue<1 | -1>; // 向いている方向
  cameraX: SharedValue<number>; // カメラの位置(画面に映す範囲)
};

// 位置は transform だけで動かす(left/bottom を毎フレーム書き換えるとレイアウト再計算が走るため)。
// shared value の更新は React の再描画を伴わず、UIスレッド側で直接反映される。
function PlayerComponent({ worldX, bottom, facing, cameraX }: Props) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: worldX.value - cameraX.value - PLAYER_SIZE / 2 },
      { translateY: -bottom.value },
      { scaleX: facing.value },
    ],
  }));

  return <Animated.View style={[styles.player, animatedStyle]} />;
}

export const Player = React.memo(PlayerComponent);

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    left: 0,
    bottom: GROUND_HEIGHT,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    backgroundColor: '#f4a261',
    borderRadius: 8,
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ENEMY_SIZE, GROUND_HEIGHT } from '../data/constants';
import { EnemySprite } from './EnemySprite';

type Props = {
  x: number; // ステージ内の横位置
  y: number; // 地面からの高さ
  cameraX: number;
};

// 位置の計算だけを担当し、見た目は EnemySprite に任せる。
function EnemyComponent({ x, y, cameraX }: Props) {
  return (
    <View style={[styles.wrapper, { left: x - cameraX - ENEMY_SIZE / 2, bottom: GROUND_HEIGHT + y }]}>
      <EnemySprite />
    </View>
  );
}

export const Enemy = React.memo(EnemyComponent);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
  },
});

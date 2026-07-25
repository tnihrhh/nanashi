import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ENEMY_SIZE, GROUND_HEIGHT } from '../data/constants';
import { EnemySprite } from './EnemySprite';

export type EnemyPosition = { id: string; x: number };

type Props = {
  id: string;
  positions: SharedValue<EnemyPosition[]>; // 全敵の位置。自分のidの分だけ読む
  cameraX: SharedValue<number>;
  // 倒された敵かどうか。true になった瞬間に消滅エフェクト(縮小+フェードアウト)を再生する。
  isDefeated?: boolean;
};

// 位置の計算だけを担当し、見た目は EnemySprite に任せる。
// x は transform で動かす(敵は上下移動しないため bottom は静的な値のまま)。
function EnemyComponent({ id, positions, cameraX, isDefeated = false }: Props) {
  const vanish = useSharedValue(0); // 0 = 通常表示, 1 = 消滅しきった状態

  useEffect(() => {
    if (isDefeated) {
      vanish.value = withTiming(1, { duration: 400 });
    }
  }, [isDefeated, vanish]);

  const animatedStyle = useAnimatedStyle(() => {
    const enemy = positions.value.find((p) => p.id === id);
    const x = enemy ? enemy.x : 0;
    return {
      opacity: 1 - vanish.value,
      transform: [
        { translateX: x - cameraX.value - ENEMY_SIZE / 2 },
        { scale: 1 - vanish.value },
      ],
    };
  });

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <EnemySprite />
    </Animated.View>
  );
}

export const Enemy = React.memo(EnemyComponent);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    bottom: GROUND_HEIGHT,
  },
});

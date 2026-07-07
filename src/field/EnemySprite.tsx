import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ENEMY_SIZE } from '../data/constants';

// 敵の「見た目」だけを担当するコンポーネント。
// 今は単純な四角だが、将来ここを Lottie アニメーションなどに差し替えても、
// 移動ロジックや当たり判定(Enemy.tsx / engine.ts)には影響しない。
function EnemySpriteComponent() {
  return <View style={styles.body} />;
}

export const EnemySprite = React.memo(EnemySpriteComponent);

const styles = StyleSheet.create({
  body: {
    width: ENEMY_SIZE,
    height: ENEMY_SIZE,
    backgroundColor: '#e63946',
    borderRadius: 6,
  },
});

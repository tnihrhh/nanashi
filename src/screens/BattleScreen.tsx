import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useGame } from '../context/GameContext';

// 戦闘の中身はまだ未実装。
// 今はフィールドとの繋ぎ込みを確認するためのプレースホルダー画面。
export function BattleScreen() {
  const { goToField, encounterEnemyId } = useGame();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>戦闘画面(仮)</Text>
      {encounterEnemyId && <Text style={styles.subtitle}>相手: {encounterEnemyId}</Text>}
      <Pressable style={styles.button} onPress={goToField}>
        <Text style={styles.buttonText}>フィールドに戻る</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#241623',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#cccccc',
    fontSize: 16,
  },
  button: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#e63946',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

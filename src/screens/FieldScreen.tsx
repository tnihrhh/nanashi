import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { Background } from '../field/Background';
import { World } from '../field/World';
import { Player } from '../field/Player';
import { Enemy } from '../field/Enemy';
import { Controls } from '../field/Controls';
import { useGame } from '../context/GameContext';
import { PLATFORMS, ENEMIES, WORLD_LENGTH } from '../data/levelData';
import { PLAYER_SIZE, ENEMY_SIZE } from '../data/constants';
import {
  EnemyPhysics,
  PlayerPhysics,
  boxesOverlap,
  clamp,
  stepEnemyPatrol,
  stepPlayerHorizontal,
  stepPlayerVertical,
} from '../field/engine';

type PlayerView = { x: number; y: number; facing: 1 | -1; cameraX: number };
type EnemyView = { id: string; x: number; y: number };

export function FieldScreen() {
  const { width } = useWindowDimensions();
  const { goToBattle, playerPositionRef } = useGame();

  // 「今の物理状態」は ref で持つ。毎フレーム書き換えても再描画は起きない。
  const physicsRef = useRef<PlayerPhysics>({
    worldX: 0,
    bottom: 0,
    velocityY: 0,
    grounded: true,
    facing: 1,
  });

  const enemiesRef = useRef<EnemyPhysics[]>(
    ENEMIES.map((enemy) => ({
      id: enemy.id,
      centerX: enemy.x,
      range: enemy.range,
      speed: enemy.speed,
      x: enemy.x,
      direction: 1,
    })),
  );

  // ボタンの押下状態も ref。Controls はこれを直接書き換える。
  const moveDirectionRef = useRef(0);
  const jumpRequestedRef = useRef(false);

  // 「画面に描画するための値」は state で持つ。これが変わった時だけ再描画される。
  const [playerView, setPlayerView] = useState<PlayerView>({ x: 0, y: 0, facing: 1, cameraX: 0 });
  const [enemyViews, setEnemyViews] = useState<EnemyView[]>(
    enemiesRef.current.map((enemy) => ({ id: enemy.id, x: enemy.x, y: 0 })),
  );

  useEffect(() => {
    let rafId: number;
    let lastTime: number | null = null;

    const tick = (time: number) => {
      rafId = requestAnimationFrame(tick);

      const dt = lastTime === null ? 1 / 60 : Math.min((time - lastTime) / 1000, 1 / 30);
      lastTime = time;

      const physics = physicsRef.current;

      stepPlayerHorizontal(physics, moveDirectionRef.current, dt);
      stepPlayerVertical(physics, jumpRequestedRef.current, dt, PLATFORMS);
      jumpRequestedRef.current = false;

      const maxCamera = Math.max(0, WORLD_LENGTH - width);
      const cameraX = clamp(physics.worldX - width / 2, 0, maxCamera);

      setPlayerView({ x: physics.worldX, y: physics.bottom, facing: physics.facing, cameraX });
      // Context 経由で「今どこにいるか」を共有する(再描画は起こさない)。
      playerPositionRef.current = { x: physics.worldX, y: physics.bottom, facing: physics.facing };

      const enemies = enemiesRef.current;
      for (const enemy of enemies) {
        stepEnemyPatrol(enemy, dt);
      }
      setEnemyViews(enemies.map((enemy) => ({ id: enemy.id, x: enemy.x, y: 0 })));

      for (const enemy of enemies) {
        if (boxesOverlap(physics.worldX, physics.bottom, PLAYER_SIZE, enemy.x, 0, ENEMY_SIZE)) {
          goToBattle(enemy.id);
          return;
        }
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [width, goToBattle, playerPositionRef]);

  return (
    <View style={styles.container}>
      <Background cameraX={playerView.cameraX} />
      <World cameraX={playerView.cameraX} />
      {enemyViews.map((enemy) => (
        <Enemy key={enemy.id} x={enemy.x} y={enemy.y} cameraX={playerView.cameraX} />
      ))}
      <Player x={playerView.x} y={playerView.y} cameraX={playerView.cameraX} facing={playerView.facing} />
      <Controls moveDirectionRef={moveDirectionRef} jumpRequestedRef={jumpRequestedRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87ceeb',
    overflow: 'hidden',
  },
});

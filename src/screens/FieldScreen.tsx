import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { Background } from '../field/Background';
import { World } from '../field/World';
import { Player } from '../field/Player';
import { Enemy } from '../field/Enemy';
import { Controls } from '../field/Controls';
import { useGame } from '../context/GameContext';
import { FIELD_STAGES } from '../data/levelData';
import { PLAYER_SIZE, ENEMY_SIZE } from '../data/constants';
import { findConnection } from '../data/worldMap';
import {
  EnemyPhysics,
  PlayerPhysics,
  boxesOverlap,
  clamp,
  stepEnemyPatrol,
  stepPlayerHorizontal,
  stepPlayerVertical,
} from '../field/engine';

// プレイヤーが端ちょうどに湧くと、その場で再度「端に到達した」と判定してしまうため、
// 少しだけ内側に湧かせる。
const SPAWN_MARGIN = 40;
// 倒した敵の消滅エフェクトの再生時間。この間だけ Enemy を描画し続けてから完全に消す。
const VANISH_DURATION_MS = 450;

export function FieldScreen() {
  const { width } = useWindowDimensions();
  const {
    goToBattle,
    playerPositionRef,
    currentNodeId,
    entrySide,
    enterNode,
    battleReturnPosition,
    defeatedEnemyIds,
    justDefeatedEnemyId,
    clearJustDefeatedEnemyId,
  } = useGame();
  const stage = FIELD_STAGES[currentNodeId];

  // 「今の物理状態」は ref で持つ。毎フレーム書き換えても再描画は起きない。
  const physicsRef = useRef<PlayerPhysics>({
    worldX: 0,
    bottom: 0,
    velocityY: 0,
    grounded: true,
    facing: 1,
  });

  const enemiesRef = useRef<EnemyPhysics[]>([]);

  // ボタンの押下状態も ref。Controls はこれを直接書き換える。
  const moveDirectionRef = useRef(0);
  const jumpRequestedRef = useRef(false);

  // 「画面に描画するための値」は Reanimated の shared value で持つ。
  // .value を書き換えても React の再描画は起きず、UIスレッド側で直接スタイル(transform)に反映される。
  // これにより毎フレームの setState → 再描画 → レイアウト再計算、という重い処理を避けている。
  const playerWorldX = useSharedValue(0);
  const playerBottom = useSharedValue(0);
  const playerFacing = useSharedValue<1 | -1>(1);
  const cameraX = useSharedValue(0);
  const enemyPositions = useSharedValue<{ id: string; x: number }[]>([]);

  // 戦闘からの帰還直後は、既に消滅エフェクトが終わっている過去の撃破済み敵まで
  // 再描画してしまわないよう、直前に倒した敵(justDefeatedEnemyId)以外は最初から非表示にする。
  const [vanishedEnemyIds, setVanishedEnemyIds] = useState<Set<string>>(() => {
    const initial = new Set(defeatedEnemyIds);
    if (justDefeatedEnemyId) initial.delete(justDefeatedEnemyId);
    return initial;
  });

  useEffect(() => {
    if (!justDefeatedEnemyId) return;
    const timeout = setTimeout(() => {
      setVanishedEnemyIds((prev) => new Set(prev).add(justDefeatedEnemyId));
      clearJustDefeatedEnemyId();
    }, VANISH_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [justDefeatedEnemyId, clearJustDefeatedEnemyId]);

  useEffect(() => {
    // currentNodeId が変わるたび(=別のフィールドに入るたび)、このフィールドの状態を作り直す。
    // ただし戦闘から戻ってきた場合(battleReturnPosition あり)は、入り口ではなく
    // 敵と接触した位置に復帰させる。
    const spawnWorldX = battleReturnPosition
      ? battleReturnPosition.x
      : entrySide === 'right'
        ? stage.worldLength - SPAWN_MARGIN
        : SPAWN_MARGIN;
    const spawnFacing: 1 | -1 = battleReturnPosition
      ? battleReturnPosition.facing
      : entrySide === 'right'
        ? -1
        : 1;
    const spawnBottom = battleReturnPosition ? battleReturnPosition.y : 0;

    physicsRef.current = {
      worldX: spawnWorldX,
      bottom: spawnBottom,
      velocityY: 0,
      grounded: true,
      facing: spawnFacing,
    };
    enemiesRef.current = stage.enemies.map((enemy) => ({
      id: enemy.id,
      centerX: enemy.x,
      range: enemy.range,
      speed: enemy.speed,
      x: enemy.x,
      direction: 1,
    }));

    playerWorldX.value = spawnWorldX;
    playerBottom.value = spawnBottom;
    playerFacing.value = spawnFacing;
    enemyPositions.value = enemiesRef.current.map((enemy) => ({ id: enemy.id, x: enemy.x }));

    let rafId: number;
    let lastTime: number | null = null;
    let transitioned = false;

    const tick = (time: number) => {
      rafId = requestAnimationFrame(tick);
      if (transitioned) return;

      const dt = lastTime === null ? 1 / 60 : Math.min((time - lastTime) / 1000, 1 / 30);
      lastTime = time;

      const physics = physicsRef.current;

      stepPlayerHorizontal(physics, moveDirectionRef.current, dt, stage.worldLength);
      stepPlayerVertical(physics, jumpRequestedRef.current, dt, stage.platforms);
      jumpRequestedRef.current = false;

      const maxCamera = Math.max(0, stage.worldLength - width);
      const camera = clamp(physics.worldX - width / 2, 0, maxCamera);

      playerWorldX.value = physics.worldX;
      playerBottom.value = physics.bottom;
      playerFacing.value = physics.facing;
      cameraX.value = camera;
      // Context 経由で「今どこにいるか」を共有する(再描画は起こさない)。
      playerPositionRef.current = { x: physics.worldX, y: physics.bottom, facing: physics.facing };

      const enemies = enemiesRef.current;
      for (const enemy of enemies) {
        // 倒した敵はその場に静止させる(パトロールさせない)。
        if (defeatedEnemyIds.has(enemy.id)) continue;
        stepEnemyPatrol(enemy, dt);
      }
      enemyPositions.value = enemies.map((enemy) => ({ id: enemy.id, x: enemy.x }));

      for (const enemy of enemies) {
        if (defeatedEnemyIds.has(enemy.id)) continue;
        if (boxesOverlap(physics.worldX, physics.bottom, PLAYER_SIZE, enemy.x, 0, ENEMY_SIZE)) {
          transitioned = true;
          goToBattle(enemy.id);
          return;
        }
      }

      // ワールドの左端 or 右端に到達したら、世界マップの接続を見て次のノードへ遷移する。
      // 接続が無ければ(=行き止まり)何もしない。
      if (physics.worldX <= 0) {
        const next = findConnection(currentNodeId, 'left');
        if (next) {
          transitioned = true;
          enterNode(next.node, next.exit);
        }
      } else if (physics.worldX >= stage.worldLength) {
        const next = findConnection(currentNodeId, 'right');
        if (next) {
          transitioned = true;
          enterNode(next.node, next.exit);
        }
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [
    currentNodeId,
    entrySide,
    stage,
    width,
    goToBattle,
    enterNode,
    playerPositionRef,
    battleReturnPosition,
    defeatedEnemyIds,
  ]);

  return (
    <View style={styles.container}>
      <Background cameraX={cameraX} worldLength={stage.worldLength} />
      <World cameraX={cameraX} worldLength={stage.worldLength} platforms={stage.platforms} />
      {stage.enemies
        .filter((enemy) => !vanishedEnemyIds.has(enemy.id))
        .map((enemy) => (
          <Enemy
            key={enemy.id}
            id={enemy.id}
            positions={enemyPositions}
            cameraX={cameraX}
            isDefeated={defeatedEnemyIds.has(enemy.id)}
          />
        ))}
      <Player worldX={playerWorldX} bottom={playerBottom} facing={playerFacing} cameraX={cameraX} />
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

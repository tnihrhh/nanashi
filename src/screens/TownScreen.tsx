import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { Player } from '../field/Player';
import { Controls } from '../field/Controls';
import { useGame } from '../context/GameContext';
import { Facility, TOWN_STAGES } from '../data/townData';
import { GROUND_HEIGHT, PLAYER_SIZE } from '../data/constants';
import { findConnection } from '../data/worldMap';
import { clamp, stepPlayerHorizontal, PlayerPhysics } from '../field/engine';

// プレイヤーが門ちょうどに湧くと押しっぱなしで即座に触れてしまうため、
// 少しだけ内側(町の中心側)にスポーンさせる。
const SPAWN_MARGIN = 40;
// この距離より施設/門に近づくと、名前を表示する(施設自体の機能は門以外まだ未実装)。
const INTERACTION_RANGE = 60;
// インタラクトボタンで反応が無かった/通行不可だった場合に出すメッセージの表示時間。
const MESSAGE_DURATION_MS = 1500;

export function TownScreen() {
  const { width } = useWindowDimensions();
  const { playerPositionRef, currentNodeId, entrySide, enterNode } = useGame();
  const town = TOWN_STAGES[currentNodeId];

  // 町は左右移動のみ(ジャンプ・重力・敵なし)。field/engine.ts の水平移動ロジックを流用する。
  const physicsRef = useRef<PlayerPhysics>({
    worldX: 0,
    bottom: 0,
    velocityY: 0,
    grounded: true,
    facing: 1,
  });
  const moveDirectionRef = useRef(0);
  const interactRequestedRef = useRef(false);

  const playerWorldX = useSharedValue(0);
  const playerBottom = useSharedValue(0);
  const playerFacing = useSharedValue<1 | -1>(1);
  const cameraX = useSharedValue(0);

  const [nearbyFacility, setNearbyFacility] = useState<Facility | null>(null);
  const nearbyFacilityRef = useRef<Facility | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 町の左端/右端の門(exit: 'left' / 'right')より外側には出られないようにする。
    // 該当する門が無い側は、これまで通りワールド端(0 / worldLength)まで歩ける。
    const leftGate = town.facilities.find((f) => f.kind === 'gate' && f.exit === 'left');
    const rightGate = town.facilities.find((f) => f.kind === 'gate' && f.exit === 'right');
    const minWorldX = leftGate ? leftGate.x : 0;
    const maxWorldX = rightGate ? rightGate.x : town.worldLength;

    // 入ってきた門(entrySide に対応する gate)があれば、その脇にスポーンする。
    // 該当する門が無ければ(=ゲーム開始時点の 'start' など)、町の中央にスポーンする。
    const spawnGate = town.facilities.find(
      (facility) => facility.kind === 'gate' && facility.exit === entrySide,
    );

    let spawnWorldX: number;
    let spawnFacing: 1 | -1;
    if (spawnGate) {
      spawnFacing = spawnGate.x < town.worldLength / 2 ? 1 : -1;
      spawnWorldX = clamp(spawnGate.x + spawnFacing * SPAWN_MARGIN, 0, town.worldLength);
    } else {
      spawnWorldX = town.worldLength / 2;
      spawnFacing = 1;
    }

    physicsRef.current = {
      worldX: spawnWorldX,
      bottom: 0,
      velocityY: 0,
      grounded: true,
      facing: spawnFacing,
    };
    nearbyFacilityRef.current = null;
    setNearbyFacility(null);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    setMessage(null);

    playerWorldX.value = spawnWorldX;
    playerBottom.value = 0;
    playerFacing.value = spawnFacing;

    let rafId: number;
    let lastTime: number | null = null;
    let transitioned = false;

    const showMessage = (text: string) => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
      setMessage(text);
      messageTimeoutRef.current = setTimeout(() => setMessage(null), MESSAGE_DURATION_MS);
    };

    const tick = (time: number) => {
      rafId = requestAnimationFrame(tick);
      if (transitioned) return;

      // 実際に経過した時間を使う(固定 1/60 だと実機/エミュレータの実fpsが低いときに動きが遅くなる)。
      const dt = lastTime === null ? 1 / 60 : Math.min((time - lastTime) / 1000, 1 / 30);
      lastTime = time;
      const physics = physicsRef.current;

      stepPlayerHorizontal(physics, moveDirectionRef.current, dt, town.worldLength);
      physics.worldX = clamp(physics.worldX, minWorldX, maxWorldX);

      const maxCamera = Math.max(0, town.worldLength - width);
      const camera = clamp(physics.worldX - width / 2, 0, maxCamera);

      playerWorldX.value = physics.worldX;
      cameraX.value = camera;
      playerPositionRef.current = { x: physics.worldX, y: physics.bottom, facing: physics.facing };

      // 一番近い施設/門を探す(複数が範囲内にある場合は最も近いものを優先)。
      let nearest: Facility | null = null;
      let nearestDistance = INTERACTION_RANGE;
      for (const facility of town.facilities) {
        const distance = Math.abs(facility.x - physics.worldX);
        if (distance < nearestDistance) {
          nearest = facility;
          nearestDistance = distance;
        }
      }
      if (nearest?.id !== nearbyFacilityRef.current?.id) {
        nearbyFacilityRef.current = nearest;
        setNearbyFacility(nearest);
      }

      if (interactRequestedRef.current) {
        interactRequestedRef.current = false;
        const target = nearbyFacilityRef.current;
        if (target?.kind === 'gate') {
          if (target.requiredItem) {
            // インベントリ未実装のため、アイテムゲートは現状常に通行不可として扱う。
            showMessage('何かが足りないようだ');
          } else {
            const next = findConnection(currentNodeId, target.exit!);
            if (next) {
              transitioned = true;
              enterNode(next.node, next.exit);
              return;
            }
            showMessage('この先はまだ準備中のようだ');
          }
        }
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, [currentNodeId, entrySide, town, width, enterNode, playerPositionRef]);

  const groundStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -cameraX.value }],
  }));

  const popupText =
    message ??
    (nearbyFacility
      ? nearbyFacility.kind === 'gate'
        ? `${nearbyFacility.label} (▲で進む)`
        : nearbyFacility.label
      : null);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ground, { width: town.worldLength }, groundStyle]}>
        {town.facilities.map((facility) => (
          <View key={facility.id} style={[styles.marker, { left: facility.x - 16 }]}>
            <Text style={styles.markerLabel}>{facility.label}</Text>
          </View>
        ))}
      </Animated.View>
      <Player worldX={playerWorldX} bottom={playerBottom} facing={playerFacing} cameraX={cameraX} />
      {popupText && (
        <View style={styles.popup} pointerEvents="none">
          <Text style={styles.popupText}>{popupText}</Text>
        </View>
      )}
      <Controls
        moveDirectionRef={moveDirectionRef}
        jumpRequestedRef={interactRequestedRef}
        actionIcon="○"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d6c19b',
    overflow: 'hidden',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: GROUND_HEIGHT,
    backgroundColor: '#b08a5b',
  },
  marker: {
    position: 'absolute',
    bottom: GROUND_HEIGHT,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    borderRadius: 8,
    backgroundColor: '#5c3d2e',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  markerLabel: {
    position: 'absolute',
    top: -20,
    fontSize: 12,
    color: '#3a2a1a',
    fontWeight: 'bold',
    width: 80,
    textAlign: 'center',
    left: -24,
  },
  popup: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  popupText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

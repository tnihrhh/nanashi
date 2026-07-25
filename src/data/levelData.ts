// フィールド(ステージ)ごとのデータです。
// 足場や敵の配置を変えたいときは、ロジックのコードではなく、このファイルの数値を編集してください。
//
// 各フィールドは src/data/worldMap.ts の NodeId(例: 'field_1_1')に対応します。
// 中身(足場・敵配置)は仮データです。レベルデザインは今後詰めます。

import { NodeId } from './worldMap';

export type Platform = {
  x: number;
  width: number;
  y: number; // 地面からの高さ
  height: number;
};

export type EnemyData = {
  id: string;
  x: number; // パトロールの中心位置
  range: number; // 中心からどれだけ左右に動くか
  speed: number; // 移動速度(px/秒)
};

export type FieldStageData = {
  worldLength: number;
  platforms: Platform[];
  enemies: EnemyData[];
};

export const FIELD_STAGES: Record<NodeId, FieldStageData> = {
  field_1_1: {
    worldLength: 1600,
    platforms: [
      { x: 400, width: 160, y: 90, height: 24 },
      { x: 900, width: 140, y: 160, height: 24 },
    ],
    enemies: [{ id: 'field_1_1-enemy-1', x: 700, range: 120, speed: 80 }],
  },
  field_1_2: {
    worldLength: 1600,
    platforms: [
      { x: 300, width: 180, y: 110, height: 24 },
      { x: 800, width: 140, y: 190, height: 24 },
      { x: 1200, width: 160, y: 100, height: 24 },
    ],
    enemies: [{ id: 'field_1_2-enemy-1', x: 1000, range: 180, speed: 100 }],
  },
  field_1_3: {
    worldLength: 1600,
    platforms: [
      { x: 500, width: 200, y: 100, height: 24 },
      { x: 1100, width: 140, y: 170, height: 24 },
    ],
    enemies: [
      { id: 'field_1_3-enemy-1', x: 400, range: 100, speed: 90 },
      { id: 'field_1_3-enemy-2', x: 1200, range: 150, speed: 110 },
    ],
  },
  field_2_1: {
    worldLength: 1600,
    platforms: [{ x: 600, width: 220, y: 90, height: 24 }],
    enemies: [{ id: 'field_2_1-enemy-1', x: 900, range: 200, speed: 100 }],
  },
  field_2_2: {
    worldLength: 1600,
    platforms: [
      { x: 350, width: 160, y: 150, height: 24 },
      { x: 950, width: 180, y: 90, height: 24 },
    ],
    enemies: [{ id: 'field_2_2-enemy-1', x: 700, range: 150, speed: 95 }],
  },
  field_2_3: {
    worldLength: 1600,
    platforms: [
      { x: 400, width: 140, y: 180, height: 24 },
      { x: 850, width: 200, y: 100, height: 24 },
      { x: 1300, width: 160, y: 150, height: 24 },
    ],
    enemies: [{ id: 'field_2_3-enemy-1', x: 1100, range: 130, speed: 105 }],
  },
};

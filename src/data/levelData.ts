// このファイルは「レベル(ステージ)のデータ」です。
// 足場や敵の配置を変えたいときは、ロジックのコードではなく、このファイルの数値を編集してください。

export const WORLD_LENGTH = 6000; // このステージの横幅(px)

export type Platform = {
  x: number;
  width: number;
  y: number; // 地面からの高さ
  height: number;
};

// 手作りの足場配置
export const PLATFORMS: Platform[] = [
  { x: 500, width: 160, y: 90, height: 24 },
  { x: 900, width: 120, y: 160, height: 24 },
  { x: 1300, width: 200, y: 110, height: 24 },
  { x: 1800, width: 140, y: 200, height: 24 },
  { x: 2300, width: 180, y: 90, height: 24 },
  { x: 2800, width: 160, y: 150, height: 24 },
  { x: 3300, width: 220, y: 100, height: 24 },
  { x: 3800, width: 140, y: 180, height: 24 },
  { x: 4300, width: 180, y: 90, height: 24 },
  { x: 4800, width: 160, y: 160, height: 24 },
];

export type EnemyData = {
  id: string;
  x: number; // パトロールの中心位置
  range: number; // 中心からどれだけ左右に動くか
  speed: number; // 移動速度(px/秒)
};

// 手作りの敵配置(地面の上を左右にパトロールする)
export const ENEMIES: EnemyData[] = [
  { id: 'enemy-1', x: 700, range: 120, speed: 80 },
  { id: 'enemy-2', x: 2000, range: 200, speed: 100 },
  { id: 'enemy-3', x: 3500, range: 150, speed: 90 },
  { id: 'enemy-4', x: 5000, range: 180, speed: 110 },
];

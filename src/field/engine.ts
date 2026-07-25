// フィールド(横スクロール)の物理演算をまとめた「純粋な関数」置き場です。
// 画面の描画とは関係なく、数値だけを計算します。
// 動きの仕組みを直したいときは、まずこのファイルを見てください。

import { GRAVITY, JUMP_SPEED, MOVE_SPEED, PLAYER_SIZE } from '../data/constants';
import { Platform } from '../data/levelData';

export type PlayerPhysics = {
  worldX: number; // ステージ内でのプレイヤーの横位置
  bottom: number; // 地面からの高さ(0 = 地面に接地)
  velocityY: number; // 縦方向の速度(プラスが上向き)
  grounded: boolean; // 地面か足場に乗っているか
  facing: 1 | -1; // 向いている方向
};

export type EnemyPhysics = {
  id: string;
  centerX: number; // パトロールの中心位置
  range: number; // 中心からどれだけ左右に動くか
  speed: number;
  x: number; // 現在位置
  direction: 1 | -1;
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// 左右移動を反映する(worldLength はステージごとに異なるため引数で受け取る)
export function stepPlayerHorizontal(
  physics: PlayerPhysics,
  moveDirection: number,
  dt: number,
  worldLength: number,
): void {
  if (moveDirection === 0) return;
  physics.worldX = clamp(physics.worldX + moveDirection * MOVE_SPEED * dt, 0, worldLength);
  physics.facing = moveDirection > 0 ? 1 : -1;
}

// 重力・ジャンプ・足場との当たり判定を反映する
export function stepPlayerVertical(
  physics: PlayerPhysics,
  jumpRequested: boolean,
  dt: number,
  platforms: Platform[],
): void {
  if (jumpRequested && physics.grounded) {
    physics.velocityY = JUMP_SPEED;
    physics.grounded = false;
  }

  physics.velocityY -= GRAVITY * dt;

  const prevBottom = physics.bottom;
  let newBottom = prevBottom + physics.velocityY * dt;

  const playerLeft = physics.worldX - PLAYER_SIZE / 2;
  const playerRight = physics.worldX + PLAYER_SIZE / 2;

  let landed = false;

  if (newBottom <= 0) {
    newBottom = 0;
    physics.velocityY = 0;
    landed = true;
  } else if (physics.velocityY <= 0) {
    for (const platform of platforms) {
      const platformTop = platform.y + platform.height;
      const overlapsX = playerRight > platform.x && playerLeft < platform.x + platform.width;
      if (overlapsX && prevBottom >= platformTop && newBottom <= platformTop) {
        newBottom = platformTop;
        landed = true;
        break;
      }
    }
  }

  if (landed) {
    physics.velocityY = 0;
  }
  physics.grounded = landed;
  physics.bottom = newBottom;
}

// 敵を中心位置(centerX)から左右に range だけ往復させる
export function stepEnemyPatrol(enemy: EnemyPhysics, dt: number): void {
  enemy.x += enemy.direction * enemy.speed * dt;
  if (enemy.x > enemy.centerX + enemy.range) {
    enemy.x = enemy.centerX + enemy.range;
    enemy.direction = -1;
  } else if (enemy.x < enemy.centerX - enemy.range) {
    enemy.x = enemy.centerX - enemy.range;
    enemy.direction = 1;
  }
}

// 2つの四角(中心x, 地面からの高さ, サイズ)が重なっているかを判定する
export function boxesOverlap(
  aX: number,
  aBottom: number,
  aSize: number,
  bX: number,
  bBottom: number,
  bSize: number,
): boolean {
  const aLeft = aX - aSize / 2;
  const aRight = aX + aSize / 2;
  const bLeft = bX - bSize / 2;
  const bRight = bX + bSize / 2;

  const horizontalOverlap = aRight > bLeft && aLeft < bRight;
  const verticalOverlap = aBottom < bBottom + bSize && aBottom + aSize > bBottom;

  return horizontalOverlap && verticalOverlap;
}

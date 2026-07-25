// このファイルはゲーム全体で使う「調整用の数値」です。
// 動きの感触を変えたいときは、まずここの数値をいじってみてください。

import { Dimensions } from 'react-native';

export const GRAVITY = 1800; // 重力の強さ(大きいほど速く落ちる)
export const JUMP_SPEED = 750; // ジャンプの初速(大きいほど高く跳ぶ)
export const MOVE_SPEED = 220; // 左右移動の速さ(px/秒)

// 画面下から地面までの高さ。画面の下から1/3程度になるよう、画面の高さから比率で決める
// (縦画面固定のため、起動時の高さで計算すれば十分)。
export const GROUND_HEIGHT = Math.round(Dimensions.get('window').height / 3);
export const PLAYER_SIZE = 48; // プレイヤーの四角のサイズ
export const ENEMY_SIZE = 44; // 敵の四角のサイズ

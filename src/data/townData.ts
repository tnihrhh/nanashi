// 町(ステージ)ごとのデータです。
// 施設は今回、近づくと名前が表示されるだけの仮実装です(機能自体は未実装、門(gate)を除く)。
//
// 各町は src/data/worldMap.ts の NodeId(例: 'town_1')に対応します。

import { ExitSide, NodeId } from './worldMap';

export type FacilityKind = 'inn' | 'shop' | 'guild' | 'npc' | 'farm' | 'gate';

export type Facility = {
  id: string;
  x: number;
  label: string;
  kind: FacilityKind;
  // kind: 'gate' のみ使用。worldMap.ts の (currentNodeId, exit) の組み合わせで接続先を引く。
  exit?: ExitSide;
  // kind: 'gate' のみ使用。指定時、このアイテムを持っていないと通行不可(現状インベントリ未実装のため常に不可として扱う)。
  requiredItem?: string;
};

export type TownStageData = {
  worldLength: number;
  facilities: Facility[];
};

// 施設・NPCの間隔は、個別に指定する仕様を詰めるまでの間、ひとまず一定間隔で並べる。
const SPACING = 150;
const MARGIN = 200;

function laidOut(items: Omit<Facility, 'x'>[]): Facility[] {
  return items.map((item, index) => ({ ...item, x: MARGIN + index * SPACING }));
}

export const TOWN_STAGES: Record<NodeId, TownStageData> = {
  // 町0: ゲームオーバー時の強制帰還先(3.3節)。プレイヤーは中央からスタートし、建物はまだ無い。
  // 住人は今後追加される可能性がある(現状は無し)。
  town_0: {
    worldLength: 800,
    facilities: [
      { id: 'town_0-gate-right', x: 700, label: 'フィールド1-1へ', kind: 'gate', exit: 'right' },
    ],
  },
  // 町1: 門(1-3) - 人1A - 宿屋 - 人1B - ショップ - 人1C - 門(2-1/奥へ)
  //      - 人1D - 畑 - 人1E - 協会 - 人1F - 門(3-1/要:シャベル)
  town_1: {
    worldLength: MARGIN * 2 + SPACING * 12,
    facilities: laidOut([
      { id: 'town_1-gate-left', label: 'フィールド1-3へ', kind: 'gate', exit: 'left' },
      { id: 'town_1-npc-a', label: '住人1A', kind: 'npc' },
      { id: 'town_1-inn', label: '宿屋', kind: 'inn' },
      { id: 'town_1-npc-b', label: '住人1B', kind: 'npc' },
      { id: 'town_1-shop', label: 'ショップ', kind: 'shop' },
      { id: 'town_1-npc-c', label: '住人1C', kind: 'npc' },
      { id: 'town_1-gate-depth', label: 'フィールド2-1へ', kind: 'gate', exit: 'depth' },
      { id: 'town_1-npc-d', label: '住人1D', kind: 'npc' },
      { id: 'town_1-farm', label: '畑', kind: 'farm' },
      { id: 'town_1-npc-e', label: '住人1E', kind: 'npc' },
      { id: 'town_1-guild', label: '協会', kind: 'guild' },
      { id: 'town_1-npc-f', label: '住人1F', kind: 'npc' },
      {
        id: 'town_1-gate-right',
        label: 'フィールド3-1へ',
        kind: 'gate',
        exit: 'right',
        requiredItem: 'shovel',
      },
    ]),
  },
  town_2: {
    worldLength: 1400,
    facilities: [
      { id: 'town_2-gate-left', x: 60, label: 'フィールド2-3へ', kind: 'gate', exit: 'left' },
      { id: 'town_2-inn', x: 250, label: '宿屋', kind: 'inn' },
      { id: 'town_2-shop', x: 550, label: 'ショップ', kind: 'shop' },
      { id: 'town_2-guild', x: 850, label: '協会', kind: 'guild' },
      { id: 'town_2-villager', x: 1150, label: '住人', kind: 'npc' },
    ],
  },
};

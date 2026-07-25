// 世界マップ(ステージ間の接続)のデータです。
// docs/REQUIREMENTS.md の3.2節で決めた通り、接続(道)を1本のフラットな配列として持ちます。
// つなぎ替え・追加・削除は基本的にこの配列を編集するだけで完結します。

export type NodeId = string;
export type ExitSide = 'left' | 'right' | string;
export type NodeType = 'field' | 'town';

export type WorldMapConnection = {
  from: { node: NodeId; exit: ExitSide };
  to: { node: NodeId; exit: ExitSide };
  oneWay?: boolean;
  // 今回の仮実装では未使用(常に通行可)。3.2節の`requiredItem`ゲートのフックとして型だけ残す。
  requiredItem?: string;
};

// 各ノードがフィールドか町かを示す。FieldScreen/TownScreenどちらを描画するかの判定に使う。
export const WORLD_NODES: Record<NodeId, NodeType> = {
  town_0: 'town',
  field_1_1: 'field',
  field_1_2: 'field',
  field_1_3: 'field',
  town_1: 'town',
  field_2_1: 'field',
  field_2_2: 'field',
  field_2_3: 'field',
  town_2: 'town',
};

// docs/REQUIREMENTS.md 3.3節の草案のうち、町0〜町2までの一本道部分のみを実データ化したもの。
export const WORLD_MAP: WorldMapConnection[] = [
  { from: { node: 'town_0', exit: 'right' }, to: { node: 'field_1_1', exit: 'left' } },
  { from: { node: 'field_1_1', exit: 'right' }, to: { node: 'field_1_2', exit: 'left' } },
  { from: { node: 'field_1_2', exit: 'right' }, to: { node: 'field_1_3', exit: 'left' } },
  { from: { node: 'field_1_3', exit: 'right' }, to: { node: 'town_1', exit: 'left' } },
  { from: { node: 'town_1', exit: 'depth' }, to: { node: 'field_2_1', exit: 'left' } },
  { from: { node: 'field_2_1', exit: 'right' }, to: { node: 'field_2_2', exit: 'left' } },
  { from: { node: 'field_2_2', exit: 'right' }, to: { node: 'field_2_3', exit: 'left' } },
  { from: { node: 'field_2_3', exit: 'right' }, to: { node: 'town_2', exit: 'left' } },
];

// (node, exit) → 接続先 のルックアップテーブル。双方向がデフォルトなので、
// 登録されている接続の逆向きも自動的に引けるようにしておく。
const CONNECTION_LOOKUP = new Map<string, WorldMapConnection['to']>();

function key(node: NodeId, exit: ExitSide): string {
  return `${node}:${exit}`;
}

for (const connection of WORLD_MAP) {
  CONNECTION_LOOKUP.set(key(connection.from.node, connection.from.exit), connection.to);
  if (!connection.oneWay) {
    CONNECTION_LOOKUP.set(key(connection.to.node, connection.to.exit), connection.from);
  }
}

export function findConnection(node: NodeId, exit: ExitSide): WorldMapConnection['to'] | undefined {
  return CONNECTION_LOOKUP.get(key(node, exit));
}

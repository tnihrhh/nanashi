import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ExitSide, NodeId, WORLD_NODES } from '../data/worldMap';

// アプリ全体で共有したい情報をここにまとめています。
// これを使うと、props を何段も渡す(バケツリレー)必要がなくなります。
//
// 注意: プレイヤーの座標は毎フレーム変わる値です。
// これをそのまま Context の値として配ってしまうと、
// 座標が変わるたびに「Contextを見ているコンポーネント全部」が再描画されてしまいます。
// なので座標は ref (playerPositionRef) に入れて共有し、
// 実際の見た目の更新は FieldScreen が props 経由で直接 Player に渡します。
// 「今どこにいるか」を知りたいだけの場所(敵の当たり判定、将来のミニマップ等)は
// playerPositionRef.current を読みに行くだけで、再描画は起きません。

export type Screen = 'field' | 'battle' | 'town';

export type PlayerPosition = {
  x: number;
  y: number;
  facing: 1 | -1;
};

type GameContextValue = {
  screen: Screen;
  encounterEnemyId: string | null;
  currentNodeId: NodeId;
  entrySide: ExitSide;
  goToBattle: (enemyId: string) => void;
  goToField: () => void;
  enterNode: (nodeId: NodeId, entrySide: ExitSide) => void;
  playerPositionRef: React.MutableRefObject<PlayerPosition>;
  // 戦闘に入る直前のプレイヤー位置。戦闘から戻るとき、フィールドの入り口ではなく
  // 敵と接触した位置に復帰させるために使う。
  battleReturnPosition: PlayerPosition | null;
  // このフィールド滞在中に倒した敵のid(当たり判定・パトロールの対象から除外する)。
  // フィールドを出て入り直すと(enterNode)クリアされ、再出現する(5.3節7.の決定に対応)。
  defeatedEnemyIds: Set<string>;
  // 直前の戦闘で倒したばかりの敵のid。消滅エフェクトを1回再生するためのトリガー。
  justDefeatedEnemyId: string | null;
  clearJustDefeatedEnemyId: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

// 世界マップ上の初期位置。docs/REQUIREMENTS.md 3.3節の「町0」に対応。
// entrySide 'start' は「どの門からも入ってきていない(ゲーム開始時点)」を表す特別な値で、
// 該当する門が無いため TownScreen 側では町の中央にスポーンする。
const INITIAL_NODE_ID: NodeId = 'town_0';
const INITIAL_ENTRY_SIDE: ExitSide = 'start';

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>(WORLD_NODES[INITIAL_NODE_ID]);
  const [encounterEnemyId, setEncounterEnemyId] = useState<string | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<NodeId>(INITIAL_NODE_ID);
  const [entrySide, setEntrySide] = useState<ExitSide>(INITIAL_ENTRY_SIDE);
  const playerPositionRef = useRef<PlayerPosition>({ x: 0, y: 0, facing: 1 });
  const [battleReturnPosition, setBattleReturnPosition] = useState<PlayerPosition | null>(null);
  const [defeatedEnemyIds, setDefeatedEnemyIds] = useState<Set<string>>(new Set());
  const [justDefeatedEnemyId, setJustDefeatedEnemyId] = useState<string | null>(null);

  const goToBattle = useCallback((enemyId: string) => {
    setEncounterEnemyId(enemyId);
    setBattleReturnPosition({ ...playerPositionRef.current });
    setScreen('battle');
  }, [playerPositionRef]);

  const goToField = useCallback(() => {
    setEncounterEnemyId((current) => {
      if (current) {
        setDefeatedEnemyIds((prev) => {
          const next = new Set(prev);
          next.add(current);
          return next;
        });
        setJustDefeatedEnemyId(current);
      }
      return null;
    });
    setScreen('field');
  }, []);

  const clearJustDefeatedEnemyId = useCallback(() => setJustDefeatedEnemyId(null), []);

  // フィールド/町の端に到達し、世界マップ上の接続先が見つかったときに呼ぶ。
  // 接続先のノード種別(field/town)に応じて screen を切り替える。
  // 新しい場所に入るので、直前のフィールド滞在に紐づく状態(戦闘復帰位置・撃破済み敵)はリセットする。
  const enterNode = useCallback((nodeId: NodeId, side: ExitSide) => {
    setCurrentNodeId(nodeId);
    setEntrySide(side);
    setScreen(WORLD_NODES[nodeId]);
    setBattleReturnPosition(null);
    setDefeatedEnemyIds(new Set());
    setJustDefeatedEnemyId(null);
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      screen,
      encounterEnemyId,
      currentNodeId,
      entrySide,
      goToBattle,
      goToField,
      enterNode,
      playerPositionRef,
      battleReturnPosition,
      defeatedEnemyIds,
      justDefeatedEnemyId,
      clearJustDefeatedEnemyId,
    }),
    [
      screen,
      encounterEnemyId,
      currentNodeId,
      entrySide,
      goToBattle,
      goToField,
      enterNode,
      battleReturnPosition,
      defeatedEnemyIds,
      justDefeatedEnemyId,
      clearJustDefeatedEnemyId,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame は GameProvider の内側でのみ使えます');
  }
  return context;
}

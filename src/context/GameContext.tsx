import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

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

export type Screen = 'field' | 'battle';

export type PlayerPosition = {
  x: number;
  y: number;
  facing: 1 | -1;
};

type GameContextValue = {
  screen: Screen;
  encounterEnemyId: string | null;
  goToBattle: (enemyId: string) => void;
  goToField: () => void;
  playerPositionRef: React.MutableRefObject<PlayerPosition>;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>('field');
  const [encounterEnemyId, setEncounterEnemyId] = useState<string | null>(null);
  const playerPositionRef = useRef<PlayerPosition>({ x: 0, y: 0, facing: 1 });

  const goToBattle = useCallback((enemyId: string) => {
    setEncounterEnemyId(enemyId);
    setScreen('battle');
  }, []);

  const goToField = useCallback(() => {
    setEncounterEnemyId(null);
    setScreen('field');
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({ screen, encounterEnemyId, goToBattle, goToField, playerPositionRef }),
    [screen, encounterEnemyId, goToBattle, goToField],
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

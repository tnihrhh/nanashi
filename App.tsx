import { StatusBar } from 'expo-status-bar';

import { GameProvider, useGame } from './src/context/GameContext';
import { FieldScreen } from './src/screens/FieldScreen';
import { BattleScreen } from './src/screens/BattleScreen';
import { TownScreen } from './src/screens/TownScreen';

export default function App() {
  return (
    <GameProvider>
      <Screens />
      <StatusBar hidden />
    </GameProvider>
  );
}

function Screens() {
  const { screen } = useGame();
  if (screen === 'field') return <FieldScreen />;
  if (screen === 'town') return <TownScreen />;
  return <BattleScreen />;
}

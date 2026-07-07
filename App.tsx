import { StatusBar } from 'expo-status-bar';

import { GameProvider, useGame } from './src/context/GameContext';
import { FieldScreen } from './src/screens/FieldScreen';
import { BattleScreen } from './src/screens/BattleScreen';

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
  return screen === 'field' ? <FieldScreen /> : <BattleScreen />;
}

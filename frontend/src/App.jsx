import React from 'react';
import './styles/arcade-doom.css';
import { GameStateProvider, useGameState } from './contexts/GameStateContext.jsx';
import VersionBadge from './components/VersionBadge.jsx';
import TournamentSetup from './landing/TournamentSetup';
import GameScreen from './game/GameScreen';

function RouterSwitch() {
  const { state, startGame } = useGameState();
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (path === '/game' && state?.started) {
    return <GameScreen />;
  }
  return (
    <TournamentSetup onParticipantsReady={(participants) => {
      startGame(participants);
      if (typeof window !== 'undefined') window.history.pushState({}, '', '/game');
    }} />
  );
}

export default function App() {
  return (
    <GameStateProvider>
      <VersionBadge />
      <RouterSwitch />
    </GameStateProvider>
  );
}
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { StartPage } from './components/StartPage';

export default function App() {
  const [currentView, setCurrentView] = useState<'welcome' | 'game'>('welcome');

  return (
    <div className="w-full h-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-neutral-950 font-outfit antialiased selection:bg-amber-500 selection:text-neutral-950">
      {currentView === 'welcome' ? (
        <StartPage onStartGame={() => setCurrentView('game')} />
      ) : (
        <GameBoard onReturnHome={() => setCurrentView('welcome')} />
      )}
    </div>
  );
}

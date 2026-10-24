/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameBoard } from './components/GameBoard';

export default function App() {
  return (
    <div className="w-full h-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-neutral-950 font-outfit antialiased selection:bg-amber-500 selection:text-neutral-950">
      <GameBoard />
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { VehicleId, GameStage } from './types';
import { Menu } from './components/Menu';
import { GameBoard } from './components/GameBoard';
import { EnzoOverlay } from './components/EnzoOverlay';
import { Volume2, VolumeX, Cpu, Trophy } from 'lucide-react';
import { sfx } from './components/AudioEngine';

export default function App() {
  const [stage, setStage] = useState<GameStage>('menu');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleId>('f40');
  const [selectedMapId, setSelectedMapId] = useState<string>('monza');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highSpeedMode, setHighSpeedMode] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ferrari_legends_high_score');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) {
        setHighScore(parsed);
      }
    }
  }, []);

  const handleHighScoreUpdate = (newScore: number) => {
    setHighScore(newScore);
    localStorage.setItem('ferrari_legends_high_score', newScore.toString());
  };

  const handleStartGame = (vehicleId: VehicleId, highSpeed: boolean, mapId: string) => {
    setSelectedVehicle(vehicleId);
    setHighSpeedMode(highSpeed);
    setSelectedMapId(mapId);
    setScore(0);
    setStage('playing');
  };

  const handleRestart = () => {
    sfx.playEngineRev();
    setScore(0);
    setStage('playing');
  };

  const handleGoToMenu = () => {
    setStage('menu');
  };

  return (
    <div id="app-root-shell" className="min-h-screen bg-[#07070a] text-stone-100 flex flex-col justify-between selection:bg-red-600 selection:text-white pb-6 pt-2">
      {/* Universal aesthetic racing header */}
      <header id="scuderia-nav-bar" className="w-full max-w-4xl mx-auto px-4 py-3 flex items-center justify-between border-b border-stone-900 mb-6">
        <div className="flex items-center gap-2">
          {/* Custom logo shield */}
          <div className="w-8 h-8 rounded-tr-xl rounded-bl-xl bg-yellow-400 border border-yellow-500 flex items-center justify-center font-extrabold text-stone-950 text-sm tracking-tighter" title="Scuderia Maranello">
            S
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-stone-100 uppercase uppercase leading-none">
              Scuderia
            </h1>
            <span className="text-[9px] font-mono tracking-widest uppercase text-red-500 leading-none">
              Maranello Grid
            </span>
          </div>
        </div>

        {/* Global Sound Toggles in Nav header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#121217] border border-stone-800/80 px-2.5 py-1 rounded-lg font-mono text-[10px] text-stone-400">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>TOP: <strong className="text-yellow-300 font-bold">{highScore}</strong></span>
          </div>
          
          <button
            id="global-volume-nav-toggle"
            type="button"
            onClick={() => {
              const val = !soundEnabled;
              setSoundEnabled(val);
              sfx.toggle(val);
            }}
            className="p-1 px-1.5 rounded bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-300 hover:border-stone-700 cursor-pointer transition-colors"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-yellow-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
          </button>
        </div>
      </header>

      {/* Main Container slots */}
      <main id="scuderia-main-stage" className="flex-1 w-full max-w-4xl mx-auto px-4 relative flex items-center justify-center">
        {stage === 'menu' && (
          <Menu
            onStartGame={handleStartGame}
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            highSpeedMode={highSpeedMode}
            setHighSpeedMode={setHighSpeedMode}
            highScore={highScore}
          />
        )}

        {stage !== 'menu' && (
          <div className="w-full relative">
            <GameBoard
              selectedVehicle={selectedVehicle}
              selectedMapId={selectedMapId}
              stage={stage}
              setStage={setStage}
              score={score}
              setScore={setScore}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              highSpeedMode={highSpeedMode}
              highScore={highScore}
              setHighScore={handleHighScoreUpdate}
            />

            {/* Win/Lose sir Enzo dialogue module overlays */}
            <EnzoOverlay
              score={score}
              stage={stage}
              selectedVehicle={selectedVehicle}
              onRestart={handleRestart}
              onGoToMenu={handleGoToMenu}
            />
          </div>
        )}
      </main>

      {/* Aesthetic humbler footer */}
      <footer id="grid-branding-subtext" className="w-full max-w-4xl mx-auto px-4 mt-8 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-stone-950 pt-4 text-[10px] font-mono text-stone-600 uppercase">
        <div className="flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 text-red-600 animate-pulse" />
          <span>FERRARI, LEGENDS VS THE WORLD</span>
        </div>
        <div>
          <span>MARANELLO COMBUSTION V12 VS ALL ELECTRIC</span>
        </div>
      </footer>
    </div>
  );
}

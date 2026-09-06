import React from 'react';
import { VehicleId, VehicleConfig } from '../types';
import { VEHICLE_CONFIGS, MAPS, generateRandomTrack } from '../data';
import { ASSETS } from '../assets';
import { Play, Volume2, VolumeX, Zap, Shield, Sparkles, Map, ArrowLeft } from 'lucide-react';
import { sfx } from './AudioEngine';

interface MenuProps {
  onStartGame: (vehicleId: VehicleId, highSpeedMode: boolean, mapId: string) => void;
  selectedVehicle: VehicleId;
  setSelectedVehicle: (id: VehicleId) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  highSpeedMode: boolean;
  setHighSpeedMode: (enabled: boolean) => void;
  highScore: number;
}

export const Menu: React.FC<MenuProps> = ({
  onStartGame,
  selectedVehicle,
  setSelectedVehicle,
  soundEnabled,
  setSoundEnabled,
  highSpeedMode,
  setHighSpeedMode,
  highScore
}) => {
  const [showMapPicker, setShowMapPicker] = React.useState(false);
  const [randomPreviewMaze, setRandomPreviewMaze] = React.useState<number[][]>([]);

  React.useEffect(() => {
    if (showMapPicker) {
      setRandomPreviewMaze(generateRandomTrack());
    }
  }, [showMapPicker]);

  const currentVehicleInfo = VEHICLE_CONFIGS.find(v => v.id === selectedVehicle) || VEHICLE_CONFIGS[0];

  const handleSoundToggle = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    sfx.toggle(newVal);
    if (newVal) {
      sfx.playEatTurbo();
    }
  };

  const handleStart = () => {
    sfx.playEngineRev();
    setShowMapPicker(true);
  };

  const handleCarSelect = (id: VehicleId) => {
    setSelectedVehicle(id);
    if (soundEnabled) {
      sfx.playEngineRev();
    }
  };

  const renderMiniMapPreview = (maze: number[][], accentColor: string) => {
    return (
      <div 
        className="grid bg-[#06060c] p-1.5 rounded-lg border border-stone-850 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] overflow-hidden shrink-0 w-28 h-28"
        style={{ gridTemplateColumns: 'repeat(21, minmax(0, 1fr))', gridTemplateRows: 'repeat(22, minmax(0, 1fr))' }}
      >
        {maze.map((row, r) =>
          row.map((cell, c) => (
            <span
              key={`${r}-${c}`}
              className={`block w-full h-full rounded-[0.2px] ${
                cell === 0
                  ? 'bg-stone-900/35' // Wall
                  : cell === 1
                  ? 'bg-yellow-400/90' // Dot (Turbo canister)
                  : cell === 2
                  ? 'bg-emerald-400' // Gas can
                  : cell === 4 || cell === 5
                  ? 'bg-[#00ffff]/80' // Luce nursery
                  : 'bg-stone-850/60' // Path corridor
              }`}
            />
          ))
        )}
      </div>
    );
  };

  if (showMapPicker) {
    return (
      <div id="game-menu-container" className="w-full max-w-4xl mx-auto flex flex-col items-center bg-[#0d0d12] border-4 border-red-600 rounded-2xl shadow-[0_0_30px_rgba(227,10,23,0.5)] overflow-hidden font-sans text-stone-100 animate-fade-in">
        {/* Banner Cover with Grid details */}
        <div id="menu-banner" className="relative w-full py-6 px-6 border-b-4 border-red-600 bg-gradient-to-r from-red-950/40 via-stone-900 to-black flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="map-picker-back-btn"
              type="button"
              onClick={() => {
                sfx.playEatTurbo();
                setShowMapPicker(false);
              }}
              className="p-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 cursor-pointer text-stone-300 hover:text-white transition-all flex items-center justify-center gap-1.5 font-mono text-xs uppercase"
              title="Return to Hangar"
            >
              <ArrowLeft className="w-4 h-4 text-red-500" />
              <span>Back</span>
            </button>
            <div>
              <span className="bg-yellow-400 text-stone-950 text-[10px] font-extrabold tracking-widest uppercase px-1.5 py-0.5 rounded border border-yellow-500 font-mono">
                Formula Grid Telemetry
              </span>
              <h2 className="text-2xl font-extrabold text-stone-100 tracking-tight flex items-center gap-2 mt-1 uppercase">
                <Map className="w-5 h-5 text-red-500 animate-pulse" />
                Select Circuit Grid
              </h2>
            </div>
          </div>
          <div className="text-xs font-mono py-1.5 px-3 rounded bg-red-950/20 border border-red-900/40 text-rose-400">
            ACTIVE LEGEND: <span className="font-extrabold text-stone-200">{currentVehicleInfo.name}</span>
          </div>
        </div>

        {/* Map selection list */}
        <div className="w-full p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto max-h-[480px]">
          {MAPS.map((map) => {
            const isRandomMap = map.id === 'random';
            const activeMaze = isRandomMap ? (randomPreviewMaze.length > 0 ? randomPreviewMaze : map.maze) : map.maze;
            const numDots = activeMaze && activeMaze.length > 0 ? activeMaze.flat().filter(cell => cell === 1 || cell === 2).length : 0;
            const hasGasCans = activeMaze && activeMaze.length > 0 ? activeMaze.flat().includes(2) : false;

            return (
              <button
                key={map.id}
                id={`map-select-${map.id}`}
                type="button"
                className="bg-[#121217] hover:bg-[#151520] border-2 border-stone-800 hover:border-red-600 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-6 cursor-pointer text-left transition-all duration-200 group relative hover:shadow-[0_0_20px_rgba(227,10,23,0.15)] width-full w-full"
                onClick={() => {
                  sfx.playEngineRev();
                  onStartGame(selectedVehicle, highSpeedMode, map.id);
                  setShowMapPicker(false);
                }}
              >
                {/* Real-time scaled track preview */}
                {activeMaze && activeMaze.length > 0 ? renderMiniMapPreview(activeMaze, map.imageColor) : (
                  <div className="w-28 h-28 bg-[#06060c] border border-stone-850 rounded-lg flex items-center justify-center text-xs font-mono text-stone-600">Generating...</div>
                )}

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2.5">
                    <h3 className="text-xl font-extrabold text-stone-100 group-hover:text-yellow-400 transition-colors uppercase tracking-tight">
                      {map.name}
                    </h3>
                    <span 
                      className="text-[9px] font-mono tracking-widest px-2 py-0.5 rounded border uppercase inline-block shrink-0 mx-auto sm:mx-0" 
                      style={{ color: map.imageColor, borderColor: `${map.imageColor}40`, backgroundColor: `${map.imageColor}10` }}
                    >
                      {map.tagline}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed mt-2 max-w-xl">
                    {map.description}
                  </p>
                  
                  {/* Performance Indicators */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 mt-3.5 pt-2 border-t border-stone-900/80 text-[11px] font-mono text-stone-500">
                    <span>⚡ CANISTERS: <strong className="text-yellow-400 font-bold">{numDots}</strong></span>
                    <span>⛽ SPECIAL GAS: <strong className="text-emerald-400 font-bold">{hasGasCans ? 'AVAILABLE' : 'NONE'}</strong></span>
                    <span>🕹️ DIFFICULTY: <strong className="text-stone-300 font-bold uppercase">{
                      map.id === 'fiorano' ? 'Expert 🔴' : map.id === 'imola' || map.id === 'mugello' ? 'Medium 🟡' : 'Standard 🟢'
                    }</strong></span>
                  </div>
                </div>

                {/* Confirm deployment chevron */}
                <div className="shrink-0 w-full sm:w-auto p-1.5 flex justify-center mt-3 sm:mt-0">
                  <div className="w-full sm:w-auto bg-[#e30a17] text-white font-extrabold text-xs tracking-wider uppercase px-4 py-2.5 rounded-lg border-b-2 border-red-950 duration-150 active:scale-95 flex items-center justify-center gap-1 group-hover:bg-red-500 group-hover:scale-105 transition-all">
                    <span>Deploy to Track</span>
                    <Play className="w-3.5 h-3.5 fill-white" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div id="game-menu-container" className="w-full max-w-4xl mx-auto flex flex-col items-center bg-[#0d0d12] border-4 border-red-600 rounded-2xl shadow-[0_0_30px_rgba(227,10,23,0.5)] overflow-hidden font-sans text-stone-100">
      {/* Banner Cover */}
      <div id="menu-banner" className="relative w-full h-56 sm:h-64 border-b-4 border-red-600 overflow-hidden">
        <img
          src={ASSETS.bannerImg}
          alt="Ferrari Legends vs The World banner"
          className="w-full h-full object-cover filter brightness-90 animate-pulse duration-[3s]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-[#000000a0]" />
        
        {/* Title overlay in retro arcade cabinet lettering */}
        <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="bg-red-600 text-stone-100 text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded mr-2 border border-yellow-400">
              Arcade Edition
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-1.5 font-sans">
              Ferrari
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold tracking-wider text-stone-100 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">
              <span className="text-stone-50">Legends</span> <span className="text-yellow-400">vs</span> <span className="text-stone-300">the World</span>
            </h2>
          </div>
          <div className="text-right text-[#00ffcc] font-mono text-xs sm:text-sm bg-[#000000b0] p-1.5 rounded border border-[#00ffcc50]">
            HIGH SCORE: <span className="font-bold text-lg text-yellow-300">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Configuration & Fleet Grid */}
      <div id="menu-controls" className="w-full p-5 sm:p-7 flex flex-col gap-6">
        
        {/* Enzo Quote Welcome Box */}
        <button 
          onClick={() => sfx.speakEnzo("Electricity? Bah! In Maranello, we do not build lightbulbs, we build roaring souls with beautiful pistons! Keep our combustion-driven legends on the track, and dodge those silent battery-powered Luce disasters!")}
          className="bg-[#1a1112] border border-red-900/60 hover:border-yellow-400 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 text-left transition-all hover:scale-[1.01] cursor-pointer hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] group w-full"
        >
          <div className="w-16 h-16 rounded-full border-2 border-yellow-400 bg-red-900 overflow-hidden shrink-0 group-hover:scale-105 duration-200 shadow-md">
            <img
               src={ASSETS.enzoHappy}
               alt="Sir Enzo Ferrari smiling"
               className="w-full h-full object-cover scale-110"
               referrerPolicy="no-referrer"
             />
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-1 text-[10px] text-yellow-400 font-mono tracking-widest uppercase mb-1">
              <span>🔊 CLICK TO HEAR SIR ENZO speak</span>
            </div>
            <p className="text-sm italic text-stone-200 font-serif leading-relaxed group-hover:text-stone-50 transition-colors">
              "Electricity? Bah! In Maranello, we do not build lightbulbs, we build roaring souls with beautiful pistons! Keep our combustion-driven legends on the track, and dodge those silent battery-powered Luce disasters!"
            </p>
            <p className="text-xs text-yellow-400 font-semibold uppercase mt-1 tracking-wider">— Sir Enzo Ferrari</p>
          </div>
        </button>

        {/* Vehicle Picker */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
            <h3 className="text-lg font-extrabold uppercase text-stone-100 tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Select Your Racing Legend
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {VEHICLE_CONFIGS.map(v => {
              const isSelected = selectedVehicle === v.id;
              return (
                <button
                  key={v.id}
                  id={`vehicle-select-${v.id}`}
                  onClick={() => handleCarSelect(v.id)}
                  className={`relative p-4 rounded-xl text-left border-3 transition-all duration-200 cursor-pointer flex flex-col gap-2.5 overflow-hidden group ${
                    isSelected
                      ? 'bg-red-950/40 border-red-600 shadow-[0_0_15px_rgba(227,10,23,0.35)]'
                      : 'bg-[#121217] border-stone-800 hover:border-stone-600 hover:bg-[#15151e]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-lg text-stone-50 tracking-tight leading-none group-hover:text-yellow-400 transition-colors">
                        {v.name}
                      </h4>
                      <span className="text-xxs font-mono text-stone-500 uppercase tracking-widest mt-0.5 inline-block">
                        Year {v.year}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute top-4 right-4" />
                    )}
                  </div>

                  {/* Draw a beautiful pixel-art scale silhouette of the real Ferrari model */}
                  <div className="h-16 w-full relative opacity-95 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-gradient-to-b from-[#0a0a0f] to-[#12121a] border border-stone-900/60 rounded-xl p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.85)] overflow-hidden">
                    {v.id === 'f40' ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={ASSETS.f40PixelArt}
                          alt="Ferrari F40"
                          referrerPolicy="no-referrer"
                          className="h-[54px] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.65)] transition-transform group-hover:scale-105 duration-200"
                        />
                      </div>
                    ) : v.id === 'f50' ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={ASSETS.f50PixelArt}
                          alt="Ferrari F50"
                          referrerPolicy="no-referrer"
                          className="h-[54px] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.65)] transition-transform group-hover:scale-105 duration-200"
                        />
                      </div>
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={ASSETS.testarossaPixelArt}
                          alt="Ferrari Testarossa"
                          referrerPolicy="no-referrer"
                          className="h-[54px] object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.65)] transition-transform group-hover:scale-105 duration-200"
                        />
                      </div>
                    )}
                </div>

                  {/* Tiny specs indicator */}
                  <div className="mt-1 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-stone-400 font-mono text-[10px]">
                      <span>SPEED:</span>
                      <span className="text-stone-200 font-bold font-mono">{(v.maxSpeed * 20).toFixed(0)} MPH</span>
                    </div>
                    <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-red-500 h-full rounded-full"
                        style={{ width: `${(v.maxSpeed / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Vehicle In-depth detail */}
          <div className="bg-[#101015] border border-stone-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between gap-5 mt-2">
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-mono font-bold text-yellow-400">
                  Fleet Specs Details
                </span>
                <p className="text-sm font-semibold text-rose-500 mt-0.5">
                  {currentVehicleInfo.name} — {currentVehicleInfo.year} Icon
                </p>
                <p className="text-xs text-stone-400 leading-relaxed mt-1">
                  {currentVehicleInfo.description}
                </p>
              </div>
              <p className="text-xs font-mono italic text-red-400/80 mt-3 pt-2 border-t border-stone-900 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-yellow-400 inline" />
                {currentVehicleInfo.quote}
              </p>
            </div>
            
            {/* Tech Radar bar block */}
            <div className="w-full sm:w-64 shrink-0 grid grid-cols-1 gap-2 border-t sm:border-t-0 sm:border-l border-stone-800 pt-3 sm:pt-0 sm:pl-5 justify-center">
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>MAX CHARGE:</span>
                  <span className="text-[#00ffcc]">{(currentVehicleInfo.maxSpeed * 22).toFixed(0)} hp</span>
                </div>
                <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden border border-stone-800">
                  <div className="bg-red-500 h-full" style={{ width: `${(currentVehicleInfo.maxSpeed / 5) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>AERODYNAMICS:</span>
                  <span className="text-[#00ffcc]">{(currentVehicleInfo.acceleration * 6.6).toFixed(1)} / 10</span>
                </div>
                <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden border border-stone-800">
                  <div className="bg-yellow-400 h-full" style={{ width: `${(currentVehicleInfo.acceleration / 2) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>G-FORCE TURN:</span>
                  <span className="text-[#00ffcc]">{(currentVehicleInfo.handling * 7.1).toFixed(1)} Gs</span>
                </div>
                <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden border border-stone-800">
                  <div className="bg-emerald-500 h-full" style={{ width: `${(currentVehicleInfo.handling / 2) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Setting sliders (Sound, High Speed Toggle) */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-stone-800 pt-5">
          <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
            {/* Sound Level Toggle */}
            <button
              id="sound-opt-toggle"
              type="button"
              onClick={handleSoundToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs border cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                soundEnabled
                  ? 'bg-yellow-400 text-stone-950 border-yellow-500 font-bold'
                  : 'bg-stone-900 text-stone-400 border-stone-800'
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-stone-950 animate-bounce" />
                  AUDIO ENGINE: ON
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  AUDIO ENGINE: OFF
                </>
              )}
            </button>

            {/* Hardcore Mode (High-Speed Gameplay) */}
            <button
              id="high-speed-opt-toggle"
              type="button"
              onClick={() => {
                setHighSpeedMode(!highSpeedMode);
                if (soundEnabled) sfx.playEatTurbo();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs border cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                highSpeedMode
                  ? 'bg-red-600 text-stone-50 border-red-700 font-bold animate-pulse'
                  : 'bg-stone-900 text-stone-400 border-stone-800'
              }`}
            >
              <Zap className={`w-4 h-4 ${highSpeedMode ? 'text-yellow-400 fill-yellow-400 animate-spin' : ''}`} />
              CORE SPEED: {highSpeedMode ? 'OVERCLOCK' : 'STOCK'}
            </button>
          </div>

          {/* Large Radiant Launch/Play Action */}
          <button
            id="start-match-button"
            type="button"
            onClick={handleStart}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-semibold text-stone-50 border-b-4 border-red-900 font-extrabold text-xl tracking-wider uppercase cursor-pointer hover:scale-[1.03] active:scale-95 active:border-b-0 hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all"
          >
            <Play className="w-6 h-6 fill-stone-50" />
            Launch Race
          </button>
        </div>

      </div>

      {/* Racetrack Help Instructions footer */}
      <div id="menu-tips" className="w-full bg-[#08080a] border-t border-stone-900 p-4 px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xxs font-mono text-stone-500">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span>🏁 <strong className="text-yellow-400">TURBO CANISTERS (⚡)</strong>: +10 pts</span>
          <span>⛽ <strong className="text-emerald-400">GAS CANS (⛽)</strong>: Overdrive Mode (Run over Luce!)</span>
        </div>
        <div className="flex flex-col items-start lg:items-end gap-1 border-t border-stone-900/60 pt-2 lg:border-t-0 lg:pt-0">
          <span>🕹️ DRIVE USING: <strong className="text-red-500 font-bold">W A S D</strong> OR <strong className="text-red-500 font-bold">ARROW KEYS</strong></span>
          <span className="text-stone-400 font-semibold flex items-center gap-1">📱 PHONE PLAY: <strong className="text-yellow-400 font-bold">TAP ON-SCREEN D-PAD</strong> OR <strong className="text-yellow-400 font-bold">SWIPE SCREEN</strong> TO STEER</span>
        </div>
      </div>
    </div>
  );
};

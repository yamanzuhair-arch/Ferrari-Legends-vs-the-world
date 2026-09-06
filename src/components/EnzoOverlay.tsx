import React, { useMemo } from 'react';
import { GameStage, VehicleId } from '../types';
import { WIN_QUOTES, LOSE_QUOTES, VEHICLE_CONFIGS } from '../data';
import { ASSETS } from '../assets';
import { RotateCcw, Home, Award, AlertTriangle, Cpu } from 'lucide-react';
import { sfx } from './AudioEngine';

interface EnzoOverlayProps {
  score: number;
  stage: GameStage;
  selectedVehicle: VehicleId;
  onRestart: () => void;
  onGoToMenu: () => void;
}

export const EnzoOverlay: React.FC<EnzoOverlayProps> = ({
  score,
  stage,
  selectedVehicle,
  onRestart,
  onGoToMenu
}) => {
  const isWin = stage === 'win';
  
  const vehicleName = useMemo(() => {
    return VEHICLE_CONFIGS.find(v => v.id === selectedVehicle)?.name || 'Ferrari';
  }, [selectedVehicle]);

  // Choose a random dialogue on render
  const selectedQuote = useMemo(() => {
    if (isWin) {
      const idx = Math.floor(Math.random() * WIN_QUOTES.length);
      return WIN_QUOTES[idx];
    } else {
      const idx = Math.floor(Math.random() * LOSE_QUOTES.length);
      return LOSE_QUOTES[idx];
    }
  }, [isWin, stage]);

  // Trigger Ferrari speech when dialogue overlay renders
  React.useEffect(() => {
    if (stage === 'win' || stage === 'lose') {
      const timer = setTimeout(() => {
        sfx.speakEnzo(selectedQuote);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedQuote, stage]);

  if (stage !== 'win' && stage !== 'lose') return null;

  return (
    <div id="enzo-dialog-overlay" className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 sm:p-6 z-50 animate-fade-in">
      <div id="dialog-panel" className={`w-full max-w-xl rounded-2xl border-4 p-5 sm:p-6 shadow-2xl flex flex-col items-center gap-5 relative bg-[#09090c] overflow-hidden ${
        isWin 
          ? 'border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.35)]' 
          : 'border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.35)]'
      }`}>
        
        {/* Terminal scanlines style BG */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        {/* Header Indicator */}
        <div className="flex items-center gap-1.5 font-mono text-xs uppercase font-extrabold tracking-widest bg-stone-900 border border-stone-800 px-3 py-1 rounded-full text-stone-400">
          {isWin ? (
            <span className="text-yellow-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 animate-bounce" /> VICTORY ACCOMPLISHED
            </span>
          ) : (
            <span className="text-red-500 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" /> DEFEAT DETECTED
            </span>
          )}
        </div>

        {/* Main Title Badge */}
        <h2 className={`font-extrabold text-2xl sm:text-3xl uppercase tracking-wider text-center font-sans ${
          isWin ? 'text-yellow-400' : 'text-red-500'
        }`}>
          {isWin ? 'Maranello Podium!' : 'Sputtered Out!'}
        </h2>

        {/* Portait of Sir Enzo Ferrari */}
        <div className="relative group">
          <div className={`w-36 h-36 sm:w-44 sm:h-44 rounded-2xl border-3 overflow-hidden bg-black transition-all duration-300 shadow-lg ${
            isWin ? 'border-yellow-400 group-hover:scale-105' : 'border-red-500 group-hover:rotate-1'
          }`}>
            <img
              src={isWin ? ASSETS.enzoHappy : ASSETS.enzoToxic}
              alt={isWin ? 'Sir Enzo Ferrari smiling proudly' : 'Sir Enzo Ferrari looking extremely fuming'}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              referrerPolicy="no-referrer"
            />
          </div>
          {/* Status glow indicators */}
          <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border text-xs shadow-md ${
            isWin ? 'bg-yellow-400 text-stone-900 border-yellow-500 font-bold font-mono' : 'bg-red-600 text-white border-red-700 animate-ping'
          }`}>
            {isWin ? '🏆' : '💀'}
          </span>
        </div>

        {/* Dialogue Box */}
        <div className={`w-full bg-stone-950/80 border p-4.5 rounded-xl flex flex-col gap-2 relative ${
          isWin ? 'border-yellow-500/20' : 'border-red-500/20'
        }`}>
          <div className="flex items-center justify-between border-b border-stone-900 pb-1.5">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-stone-400">
              Sir Enzo says:
            </span>
            <span className="text-xxs font-mono text-stone-500">
              MARANELLO OFFICE DIAL-IN
            </span>
          </div>
          <p className="text-sm font-serif leading-relaxed text-stone-100 text-center italic">
            "{selectedQuote}"
          </p>
        </div>

        {/* SCORE BREAKDOWN BOX */}
        <div className="w-full grid grid-cols-2 gap-3 font-mono text-center mb-1">
          <div className="bg-[#121217] border border-stone-800 p-2.5 rounded-lg">
            <span className="text-xxs text-stone-400 block uppercase font-mono mb-0.5">Vehicle</span>
            <span className="text-xs text-rose-500 font-extrabold">{vehicleName}</span>
          </div>
          <div className="bg-[#121217] border border-stone-800 p-2.5 rounded-lg">
            <span className="text-xxs text-stone-400 block uppercase font-mono mb-0.5">Boost score</span>
            <span className="text-sm font-extrabold text-yellow-400 tracking-wide">{score}</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mt-1.5">
          <button
            id="try-again-button"
            onClick={onRestart}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl uppercase font-bold text-sm tracking-wider shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
              isWin 
                ? 'bg-yellow-400 text-stone-950 hover:bg-yellow-300 font-extrabold'
                : 'bg-red-600 text-stone-50 hover:bg-red-500'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            {isWin ? 'Race Again' : 'Try Again'}
          </button>
          
          <button
            id="back-to-menu-button"
            onClick={onGoToMenu}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-850 hover:border-stone-700 text-stone-300 uppercase font-semibold text-sm tracking-wider cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            Fleets & Menu
          </button>
        </div>

        {/* Funny signature watermark */}
        <p className="text-[9px] font-mono text-stone-600 uppercase mt-1 tracking-widest flex items-center gap-1 justify-center">
          <Cpu className="w-3 h-3 text-red-500" /> Scuderia Ferrari S.p.A. — Legends vs Electric 1990-2026
        </p>

      </div>
    </div>
  );
};

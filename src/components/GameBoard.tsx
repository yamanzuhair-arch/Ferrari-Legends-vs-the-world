import React, { useRef, useEffect, useState } from 'react';
import { VehicleId, GameStage, Direction, LuceGhost, LuceState } from '../types';
import { VEHICLE_CONFIGS, INITIAL_MAZE, PLAYER_START, LUCE_START_GHOSTS, MAPS, generateRandomTrack } from '../data';
import { ASSETS } from '../assets';
import { sfx } from './AudioEngine';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Flame, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface GameBoardProps {
  selectedVehicle: VehicleId;
  selectedMapId: string;
  stage: GameStage;
  setStage: (stage: GameStage) => void;
  score: number;
  setScore: (score: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  highSpeedMode: boolean;
  highScore: number;
  setHighScore: (score: number) => void;
}

// Engine Life Icon (SVG Component representing a retro V12 engine block)
const EngineIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <svg
    id="engine-life-icon"
    viewBox="0 0 100 80"
    className={`w-9 h-7 transition-colors duration-300 ${active ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.7)]' : 'text-stone-800'}`}
    fill="currentColor"
  >
    {/* V12 Engine Block outline */}
    <path d="M 20,25 L 35,5 L 65,5 L 80,25 L 85,55 L 75,70 L 25,70 L 15,55 Z" stroke="currentColor" strokeWidth="3" fill="#15161A" />
    {/* Cylinder heads */}
    <rect x="23" y="15" width="12" height="18" rx="1" fill={active ? '#FF3030' : '#2D2D35'} transform="rotate(-15, 23, 15)" />
    <rect x="65" y="15" width="12" height="18" rx="1" fill={active ? '#FF3030' : '#2D2D35'} transform="rotate(15, 65, 15)" />
    {/* Intake Plenum Tubes */}
    <line x1="33" y1="20" x2="50" y2="28" stroke={active ? '#FFD700' : '#555'} strokeWidth="2.5" />
    <line x1="33" y1="28" x2="50" y2="33" stroke={active ? '#FFD700' : '#555'} strokeWidth="2.5" />
    <line x1="33" y1="36" x2="50" y2="38" stroke={active ? '#FFD700' : '#555'} strokeWidth="2.5" />
    <line x1="67" y1="20" x2="50" y2="28" stroke={active ? '#FFD700' : '#555'} strokeWidth="2.5" />
    <line x1="67" y1="28" x2="50" y2="33" stroke={active ? '#FFD700' : '#555'} strokeWidth="2.5" />
    <line x1="67" y1="36" x2="50" y2="38" stroke={active ? '#FFD700' : '#555'} strokeWidth="2.5" />
    {/* Spark wires & central emblem */}
    <circle cx="50" cy="33" r="5" fill="#E30A17" />
    {/* Pulleys at the bottom */}
    <circle cx="35" cy="55" r="4.5" fill="#666" stroke="#fff" strokeWidth="1" />
    <circle cx="65" cy="55" r="4.5" fill="#666" stroke="#fff" strokeWidth="1" />
    <circle cx="50" cy="59" r="6" fill="#444" stroke="#fff" strokeWidth="1" />
    {/* Fan belt connect */}
    <path d="M 35,55 Q 50,65 65,55 Q 50,53 35,55" fill="none" stroke="#222" strokeWidth="2" />
  </svg>
);

// Preload the vehicle pixel art images securely for high-fidelity canvas mapping with background transparency
const carImages: Record<string, HTMLCanvasElement> = {};
if (typeof window !== 'undefined') {
  const preloadAndCleanImage = (id: string, src: string) => {
    const img = new Image();
    img.src = src;
    
    const canvas = document.createElement('canvas');
    carImages[id] = canvas;
    (canvas as any).rawImage = img;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          // Define search width boundary (ensure full sheet is processed for multi-directional f50)
          const limitX = canvas.width;

          // 1. Sample three corner pixels within the active region to act as dynamic keys
          const samplePixels = [
            [data[0], data[1], data[2]], // Top-Left
            [data[4 * (limitX - 10)], data[4 * (limitX - 10) + 1], data[4 * (limitX - 10) + 2]], // Top-Right of active area
            [data[4 * canvas.width * (canvas.height - 10)], data[4 * canvas.width * (canvas.height - 10) + 1], data[4 * canvas.width * (canvas.height - 10) + 2]], // Bottom-Left
          ];
          
          // 2. Remove grid/text backgrounds dynamically for seamless road rendering
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Check closeness to any sampled background corner colors
            let isBgColor = false;
            for (const color of samplePixels) {
              const dR = r - color[0];
              const dG = g - color[1];
              const dB = b - color[2];
              if (Math.sqrt(dR * dR + dG * dG + dB * dB) < 55) {
                isBgColor = true;
                break;
              }
            }

            // Also check for general bluish/grayish grid line background characteristics:
            const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
            const isGray = maxDiff < 18;
            const isDarkBackground = r < 75 && g < 75 && b < 75 && maxDiff < 20;
            const isSteelBlue = (b > r + 3) && (b > g) && (r < 85) && (g < 90);
            
            if (isBgColor || isGray || isDarkBackground || isSteelBlue) {
              // Protect the iconic red paint (vibrant red) and bright elements like lights or shields
              const isVibrantRed = r > 100 && g < 80 && b < 80;
              const isHeadlight = r > 180 && g > 175;
              const isYellowBadge = r > 180 && g > 135 && b < 90;
              
              if (!isVibrantRed && !isHeadlight && !isYellowBadge) {
                data[i + 3] = 0; // Set transparency
              }
            }
          }
          ctx.putImageData(imgData, 0, 0);

          // 3. Scan the processed pixel data to find the tight bounding box of the car's RED paint inside the active half
          let minX = limitX;
          let maxX = 0;
          let minY = canvas.height;
          let maxY = 0;

          const updatedData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < limitX; x++) {
              const idx = 4 * (y * canvas.width + x);
              const r = updatedData[idx];
              const g = updatedData[idx + 1];
              const b = updatedData[idx + 2];
              const alpha = updatedData[idx + 3];

              // If it's a solid element and clearly red, or a headlight, or windshield part (alpha > 50)
              const isCarElement = alpha > 50 && (
                (r > 100 && r > g * 1.3 && r > b * 1.3) || // Red body paint
                (r > 180 && g > 160) || // Headlights
                (r < 60 && g < 60 && b < 60 && alpha > 200) // Windshield/grilles when solid
              );

              if (isCarElement) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }

          // If a valid bounding box was located successfully, crop tightly with defensive padding (e.g., 2 pixels)
          if (maxX >= minX && maxY >= minY) {
            const padding = 2;
            (canvas as any).cropX = Math.max(0, minX - padding);
            (canvas as any).cropY = Math.max(0, minY - padding);
            (canvas as any).cropW = Math.min(limitX - (canvas as any).cropX, (maxX - minX) + 2 * padding);
            (canvas as any).cropH = Math.min(canvas.height - (canvas as any).cropY, (maxY - minY) + 2 * padding);
          } else {
            // Safe fallback defaults
            (canvas as any).cropX = 0;
            (canvas as any).cropY = 0;
            (canvas as any).cropW = limitX;
            (canvas as any).cropH = canvas.height;
          }
        } catch (e) {
          console.error("Failed to key out background of " + id, e);
        }
      }
    };
  };

  preloadAndCleanImage('f40', ASSETS.f40PixelArt);
  preloadAndCleanImage('f50', ASSETS.f50PixelArt);
  preloadAndCleanImage('testarossa', ASSETS.testarossaPixelArt);
}

export const GameBoard: React.FC<GameBoardProps> = ({
  selectedVehicle,
  selectedMapId,
  stage,
  setStage,
  score,
  setScore,
  soundEnabled,
  setSoundEnabled,
  highSpeedMode,
  highScore,
  setHighScore
}) => {
  const activeMap = MAPS.find(m => m.id === selectedMapId) || MAPS[0];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Core Game variables stored in state & refs to avoid re-rendering slowing canvas
  const [lives, setLives] = useState(3);
  const [overdriveTime, setOverdriveTime] = useState(0); // For gas can power duration display
  const [gamePaused, setGamePaused] = useState(false);

  // Engine Spec bonuses
  const config = VEHICLE_CONFIGS.find(v => v.id === selectedVehicle) || VEHICLE_CONFIGS[0];

  // Game Settings adjusted based on vehicle choice and High-Speed Overclock
  const baseSpeed = highSpeedMode ? 2.5 : 2.0;
  const playerSpeedBonus = config.maxSpeed * 0.12; 
  const currentSpeed = baseSpeed + playerSpeedBonus;

  // Track map status dot collection
  const totalDotsRef = useRef(0);
  const dotsEatenRef = useRef(0);

  // Maze state layout
  const mazeRef = useRef<number[][]>([]);
  
  // Game Loop Refs
  const playerRef = useRef({
    gridX: activeMap.playerStart.gridX,
    gridY: activeMap.playerStart.gridY,
    canvasX: activeMap.playerStart.gridX,
    canvasY: activeMap.playerStart.gridY,
    dir: 'NONE' as Direction,
    nextDir: 'NONE' as Direction,
    speed: currentSpeed,
    progress: 0.0 // interpolation between cells (0 to 1)
  });

  const ghostsRef = useRef<LuceGhost[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const overdriveTimerRef = useRef<number>(0);
  const lastActiveTimeRef = useRef<number>(0);

  const keyHandlerAttached = useRef(false);
  const randomMazeRef = useRef<number[][]>([]);

  // Initialize Map and Game
  const resetGameEntities = () => {
    // Determine the layout design context
    let sourceMaze = activeMap.maze;
    if (selectedMapId === 'random') {
      // Procedurally generate a pristine custom circuit
      const newRand = generateRandomTrack();
      randomMazeRef.current = newRand;
      sourceMaze = newRand;
    }

    // Deep copy source matrix to reset boosts
    mazeRef.current = sourceMaze.map(row => [...row]);
    
    // Count total dots (1: Turbo bolts, 2: Gas cans)
    let dots = 0;
    for (let r = 0; r < mazeRef.current.length; r++) {
      for (let c = 0; c < mazeRef.current[r].length; c++) {
        if (mazeRef.current[r][c] === 1 || mazeRef.current[r][c] === 2) {
          dots++;
        }
      }
    }
    totalDotsRef.current = dots;
    dotsEatenRef.current = 0;
    setScore(0);
    setLives(3);
    setOverdriveTime(0);
    overdriveTimerRef.current = 0;

    // Reset Player to map starting coordinate
    playerRef.current = {
      gridX: activeMap.playerStart.gridX,
      gridY: activeMap.playerStart.gridY,
      canvasX: activeMap.playerStart.gridX,
      canvasY: activeMap.playerStart.gridY,
      dir: 'NONE',
      nextDir: 'NONE',
      speed: currentSpeed,
      progress: 0.0
    };

    // Reset Luce Enemies
    ghostsRef.current = LUCE_START_GHOSTS.map((g, idx) => ({
      id: g.id,
      name: g.name,
      gridX: g.startGridX,
      gridY: g.startGridY,
      canvasX: g.startGridX,
      canvasY: g.startGridY,
      color: g.color,
      state: 'scatter' as LuceState,
      dir: 'NONE' as Direction,
      speed: (highSpeedMode ? 1.6 : 1.2) + (idx * 0.08), // distinct velocities
      respawnTime: 0,
      personality: g.personality
    }));
  };

  // Re-spawn player and ghosts after a crash (keep current score and dots)
  const resetAfterCrash = () => {
    playerRef.current = {
      gridX: activeMap.playerStart.gridX,
      gridY: activeMap.playerStart.gridY,
      canvasX: activeMap.playerStart.gridX,
      canvasY: activeMap.playerStart.gridY,
      dir: 'NONE',
      nextDir: 'NONE',
      speed: currentSpeed,
      progress: 0.0
    };

    ghostsRef.current = LUCE_START_GHOSTS.map((g, idx) => ({
      id: g.id,
      name: g.name,
      gridX: g.startGridX,
      gridY: g.startGridY,
      canvasX: g.startGridX,
      canvasY: g.startGridY,
      color: g.color,
      state: 'scatter',
      dir: 'NONE',
      speed: (highSpeedMode ? 1.5 : 1.1) + (idx * 0.05),
      respawnTime: 0,
      personality: g.personality
    }));

    setOverdriveTime(0);
    overdriveTimerRef.current = 0;
  };

  // Safe checks for cell walls
  const isWall = (gridX: number, gridY: number, targetDir: Direction, isPlayer: boolean): boolean => {
    let nextX = gridX;
    let nextY = gridY;

    if (targetDir === 'UP') nextY--;
    else if (targetDir === 'DOWN') nextY++;
    else if (targetDir === 'LEFT') nextX--;
    else if (targetDir === 'RIGHT') nextX++;

    // Wrap around for tunnels on grid margins
    if (nextX < 0 || nextX >= 21) {
      if (gridY === 10) return false; // Tunnels are safe
      return true;
    }
    if (nextY < 0 || nextY >= 22) return true;

    const cell = mazeRef.current[nextY][nextX];
    if (cell === 0) return true; // solid barrier
    if (cell === 4 && isPlayer) return true; // player can't pass Luce doorway
    
    return false;
  };

  // Gather actual coordinates for wrap-around tunnel effects
  const getNextGridCell = (gridX: number, gridY: number, currentDir: Direction): { x: number, y: number } => {
    let nextX = gridX;
    let nextY = gridY;

    if (currentDir === 'UP') nextY--;
    else if (currentDir === 'DOWN') nextY++;
    else if (currentDir === 'LEFT') nextX--;
    else if (currentDir === 'RIGHT') nextX++;

    // Handle Wrap-Around tunnels
    if (nextY === 10) {
      if (nextX < 0) nextX = 20;
      else if (nextX > 20) nextX = 0;
    }

    return { x: nextX, y: nextY };
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stage !== 'playing' || gamePaused) return;

      let keyDir: Direction = 'NONE';
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          keyDir = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          keyDir = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          keyDir = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          keyDir = 'RIGHT';
          break;
      }

      if (keyDir !== 'NONE') {
        e.preventDefault();
        playerRef.current.nextDir = keyDir;
        
        // If current velocity is stalled/NONE, immediately trigger movement if legal
        if (playerRef.current.dir === 'NONE') {
          if (!isWall(playerRef.current.gridX, playerRef.current.gridY, keyDir, true)) {
            playerRef.current.dir = keyDir;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    keyHandlerAttached.current = true;

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [stage, gamePaused]);

  // Swipe gesture controls listener for phone playability
  useEffect(() => {
    if (stage !== 'playing' || gamePaused) return;

    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 25; // Adjusted threshold for quick responsive swiping on mobile

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent browser bounce/refresh when swiping around the game board canvas
      if (e.target && (e.target as HTMLElement).closest('canvas')) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 0) return;

      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;

      let swipeDir: Direction = 'NONE';

      // Compare client coordinates to identify main motion vector
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= minSwipeDistance) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal sweep
          swipeDir = deltaX > 0 ? 'RIGHT' : 'LEFT';
        } else {
          // Vertical sweep
          swipeDir = deltaY > 0 ? 'DOWN' : 'UP';
        }
      }

      if (swipeDir !== 'NONE') {
        playerRef.current.nextDir = swipeDir;
        
        // Push vehicle forward if currently stopped/NONE
        if (playerRef.current.dir === 'NONE') {
          if (!isWall(playerRef.current.gridX, playerRef.current.gridY, swipeDir, true)) {
            playerRef.current.dir = swipeDir;
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [stage, gamePaused]);

  // Handle game initial state and resets
  useEffect(() => {
    if (stage === 'playing') {
      resetGameEntities();
      setGamePaused(false);
    }
  }, [stage]);

  // Main high performance game physics and graphic rendering loop
  useEffect(() => {
    if (stage !== 'playing' || gamePaused) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cellsW = 21;
    let cellsH = 22;
    let cellSize = 22; // Base scale, adjusted responsively on size calculation
    
    // Auto Resize based on viewport container width
    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        const cw = containerRef.current.clientWidth;
        // Keep canvas size modular and comfortable
        const idealSize = Math.floor((cw - 24) / cellsW);
        cellSize = Math.max(13, Math.min(32, idealSize));
        canvas.width = cellsW * cellSize;
        canvas.height = cellsH * cellSize;
      }
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Main Update Frame physics
    const updateGame = () => {
      const player = playerRef.current;

      // --- 1. OVERDRIVE TIMER TICK ---
      if (overdriveTimerRef.current > 0) {
        overdriveTimerRef.current -= 16.67; // approx ms in 1 frame (60fps)
        if (overdriveTimerRef.current <= 0) {
          overdriveTimerRef.current = 0;
          setOverdriveTime(0);
          // Revert all ghosts back to normal states
          ghostsRef.current.forEach(g => {
            if (g.state === 'frightened') {
              g.state = 'chase';
            }
          });
        } else {
          setOverdriveTime(Math.ceil(overdriveTimerRef.current / 1000));
        }
      }

      // --- 2. PLAYER MOVEMENT & GRID ALIGNMENT ---
      if (player.dir !== 'NONE') {
        const walkSpeed = player.speed * 0.046; // custom movement factor per frame
        player.progress += walkSpeed;

        if (player.progress >= 1.0) {
          // Player completed transition into next cell
          const nextCell = getNextGridCell(player.gridX, player.gridY, player.dir);
          player.gridX = nextCell.x;
          player.gridY = nextCell.y;
          player.progress = 0.0;

          // Check if key change queue (nextDir) is possible
          if (player.nextDir !== 'NONE' && !isWall(player.gridX, player.gridY, player.nextDir, true)) {
            player.dir = player.nextDir;
            player.nextDir = 'NONE';
          } 
          // If we hit a wall in current moving direction, halt engine
          else if (isWall(player.gridX, player.gridY, player.dir, true)) {
            player.dir = 'NONE';
          }
        }
      }

      // Smooth coordinate calculation list
      if (player.dir === 'NONE') {
        player.canvasX = player.gridX;
        player.canvasY = player.gridY;
      } else {
        const nextCell = getNextGridCell(player.gridX, player.gridY, player.dir);
        let interX = player.gridX + (nextCell.x - player.gridX) * player.progress;
        let interY = player.gridY + (nextCell.y - player.gridY) * player.progress;

        // Custom wrap around rendering smoothly in tunnel
        if (player.gridY === 10) {
          if (player.gridX === 20 && nextCell.x === 0 && player.dir === 'RIGHT') {
            interX = player.gridX + (21 - player.gridX) * player.progress;
            if (interX >= 20.8) {
              player.gridX = 0;
              player.progress = 0.05;
            }
          } else if (player.gridX === 0 && nextCell.x === 20 && player.dir === 'LEFT') {
            interX = player.gridX + (-1 - player.gridX) * player.progress;
            if (interX <= -0.8) {
              player.gridX = 20;
              player.progress = 0.05;
            }
          }
        }
        player.canvasX = interX;
        player.canvasY = interY;
      }

      // --- 3. HARVEST IN-CORRIDOR TURBO CANISTERS & POWER GASSES ---
      const pGridX = player.gridX;
      const pGridY = player.gridY;
      const cellValue = mazeRef.current[pGridY]?.[pGridX];

      if (cellValue === 1) {
        // Collect Normal Turbo
        mazeRef.current[pGridY][pGridX] = 3; // Empty corridor spot
        dotsEatenRef.current++;
        setScore(prev => {
          const updated = prev + 10;
          if (updated > highScore) setHighScore(updated);
          return updated;
        });
        if (soundEnabled) sfx.playEatTurbo();
      } 
      else if (cellValue === 2) {
        // Collect Gas Can - trigger ENZO OVERDRIVE!
        mazeRef.current[pGridY][pGridX] = 3;
        dotsEatenRef.current++;
        setScore(prev => {
          const updated = prev + 50;
          if (updated > highScore) setHighScore(updated);
          return updated;
        });
        
        // Turn all active ghosts to frightened failing batteries
        overdriveTimerRef.current = 8000; // 8 seconds of Overdrive
        setOverdriveTime(8);
        if (soundEnabled) sfx.playCollectGasCan();

        ghostsRef.current.forEach(g => {
          if (g.state !== 'eaten') {
            g.state = 'frightened';
          }
        });
      }

      // --- GAME VICTORY CONDITION ---
      if (dotsEatenRef.current >= totalDotsRef.current && totalDotsRef.current > 0) {
        if (soundEnabled) sfx.playVictory();
        setStage('win');
        return;
      }

      // --- 4. ENEMY CHASE AI & PATH MOVEMENT ---
      ghostsRef.current.forEach(g => {
        if (g.state === 'eaten') {
          // Head back to the central generator box (grid x:10, y:10)
          const respawnGoalX = 10;
          const respawnGoalY = 10;
          
          if (g.gridX === respawnGoalX && g.gridY === respawnGoalY) {
            g.respawnTime -= 16.67;
            if (g.respawnTime <= 0) {
              g.state = 'chase';
              g.respawnTime = 0;
            }
          } else {
            // High velocity navigation back to recharge station
            moveGhostTowardsTarget(g, respawnGoalX, respawnGoalY, 2.8);
          }
        } else {
          // Determine targets based on ghost characters
          let targetX = 10;
          let targetY = 10;

          if (g.state === 'scatter') {
            // Scatter corners
            targetX = g.id === 'luce1' ? 1 : g.id === 'luce2' ? 19 : g.id === 'luce3' ? 1 : 19;
            targetY = g.id === 'luce1' ? 1 : g.id === 'luce2' ? 1 : g.id === 'luce3' ? 19 : 19;
          } else if (g.state === 'frightened') {
            // Random scatter targets
            targetX = Math.floor(Math.random() * 21);
            targetY = Math.floor(Math.random() * 22);
          } else {
            // Chase State Personalities
            if (g.personality === 'aggressive') {
              // Direct pursuit of Player Ferrari
              targetX = player.gridX;
              targetY = player.gridY;
            } else if (g.personality === 'ambush') {
              // Predict path 3 cells ahead of Player direction
              let bonusX = 0;
              let bonusY = 0;
              if (player.dir === 'UP') bonusY = -3;
              else if (player.dir === 'DOWN') bonusY = 3;
              else if (player.dir === 'LEFT') bonusX = -3;
              else if (player.dir === 'RIGHT') bonusX = 3;
              targetX = player.gridX + bonusX;
              targetY = player.gridY + bonusY;
            } else if (g.personality === 'unpredictable') {
              // Switch targets between player or random corners
              if (Math.floor(Date.now() / 3000) % 2 === 0) {
                targetX = player.gridX;
                targetY = player.gridY;
              } else {
                targetX = 1;
                targetY = 20;
              }
            } else {
              // Patrol: circles around 10 cells block
              const dist = Math.hypot(g.gridX - player.gridX, g.gridY - player.gridY);
              if (dist < 6) {
                targetX = 19;
                targetY = 20;
              } else {
                targetX = player.gridX;
                targetY = player.gridY;
              }
            }
          }

          // Move along speed corridors
          moveGhostTowardsTarget(g, targetX, targetY, g.state === 'frightened' ? 0.8 : g.speed);
        }

        // Apply grid coordinate wrapping for Luce Ghosts
        if (g.gridY === 10) {
          if (g.gridX < 0) g.gridX = 19;
          else if (g.gridX > 20) g.gridX = 1;
        }
      });

      // --- 5. CHECK ENEMY COLLISIONS ---
      ghostsRef.current.forEach(g => {
        const player = playerRef.current;
        // Collision threshold (approx 0.8 cell overlap width)
        const dist = Math.hypot(player.canvasX - g.canvasX, player.canvasY - g.canvasY);
        
        if (dist < 0.75) {
          if (g.state === 'frightened') {
            // Run over Luce! They return as charging core energy to center
            g.state = 'eaten';
            g.respawnTime = 3000; // 3 seconds charge time
            setScore(prev => {
              const updated = prev + 200;
              if (updated > highScore) setHighScore(updated);
              return updated;
            });
            if (soundEnabled) sfx.playEatLuce();
          } 
          else if (g.state !== 'eaten') {
            // CRASH! Lose an engine life
            if (soundEnabled) sfx.playCrash();
            
            const nextLives = lives - 1;
            setLives(nextLives);
            
            if (nextLives <= 0) {
              // Defeat! Show angry Sir Enzo page
              if (soundEnabled) sfx.playDefeat();
              setStage('lose');
            } else {
              // Soft reset position
              resetAfterCrash();
            }
          }
        }
      });

      // --- SCATTER-CHASE CYCLES TIMER ---
      const elapsed = Date.now() - lastActiveTimeRef.current;
      if (elapsed > 20000) {
        lastActiveTimeRef.current = Date.now();
        ghostsRef.current.forEach(g => {
          if (g.state === 'chase') g.state = 'scatter';
          else if (g.state === 'scatter') g.state = 'chase';
        });
      }
    };

    // Luce Ghost grid step decision making
    const moveGhostTowardsTarget = (g: LuceGhost, targetX: number, targetY: number, travelSpeed: number) => {
      const walkFactor = travelSpeed * 0.038;
      
      // Calculate Canvas sub-grid position interpolation
      let nextCellX = g.gridX;
      let nextCellY = g.gridY;

      if (g.dir === 'UP') nextCellY--;
      else if (g.dir === 'DOWN') nextCellY++;
      else if (g.dir === 'LEFT') nextCellX--;
      else if (g.dir === 'RIGHT') nextCellX++;

      // We interpolate coordinates smoothly
      const dx = nextCellX - g.gridX;
      const dy = nextCellY - g.gridY;
      
      g.canvasY += Math.sign(dy) * walkFactor;
      g.canvasX += Math.sign(dx) * walkFactor;

      // Snapping to cell completion
      if (Math.abs(g.canvasX - nextCellX) < walkFactor && Math.abs(g.canvasY - nextCellY) < walkFactor) {
        g.gridX = nextCellX;
        g.gridY = nextCellY;
        g.canvasX = nextCellX;
        g.canvasY = nextCellY;

        // Choose next direction at crossroads intersection
        const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        const validDirs = dirs.filter(d => {
          // Avoid backtracking in opposite directions instantly
          if (g.dir === 'UP' && d === 'DOWN') return false;
          if (g.dir === 'DOWN' && d === 'UP') return false;
          if (g.dir === 'LEFT' && d === 'RIGHT') return false;
          if (g.dir === 'RIGHT' && d === 'LEFT') return false;
          
          return !isWall(g.gridX, g.gridY, d, false);
        });

        // If trapped, backtrack
        if (validDirs.length === 0) {
          const opposites: Record<Direction, Direction> = {
            'UP': 'DOWN', 'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT', 'NONE': 'NONE'
          };
          validDirs.push(opposites[g.dir]);
        }

        // Choose direction that minimizes Euclidean distance to Target cell
        let bestDir: Direction = 'NONE';
        let minDist = Infinity;

        validDirs.forEach(d => {
          let checkX = g.gridX;
          let checkY = g.gridY;
          if (d === 'UP') checkY--;
          else if (d === 'DOWN') checkY++;
          else if (d === 'LEFT') checkX--;
          else if (d === 'RIGHT') checkX++;

          const dist = Math.hypot(checkX - targetX, checkY - targetY);
          if (dist < minDist) {
            minDist = dist;
            bestDir = d;
          }
        });

        g.dir = bestDir;
      }
    };

    // Draw grid loop
    const drawGrid = () => {
      ctx.fillStyle = '#060608';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Circuit Boundaries & Roads
      for (let r = 0; r < cellsH; r++) {
        for (let c = 0; c < cellsW; c++) {
          const val = mazeRef.current[r]?.[c];
          const x = c * cellSize;
          const y = r * cellSize;

          if (val === 0) {
            // Walls: Classic double curbs styling
            ctx.fillStyle = '#101116';
            ctx.fillRect(x, y, cellSize, cellSize);

            // Red & White racing curbing patterns on the perimeter walls
            if (r === 0 || r === cellsH - 1 || c === 0 || c === cellsW - 1) {
              ctx.fillStyle = (r + c) % 2 === 0 ? '#E30A17' : '#ffffff';
              if (r === 0) ctx.fillRect(x, y, cellSize, 4);
              else if (r === cellsH - 1) ctx.fillRect(x, y + cellSize - 4, cellSize, 4);
              else if (c === 0) ctx.fillRect(x, y, 4, cellSize);
              else if (c === cellsW - 1) ctx.fillRect(x + cellSize - 4, y, 4, cellSize);
            } else {
              // Stylized subtle futuristic dark walls
              ctx.strokeStyle = '#222530';
              ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
            }
          } else if (val === 4) {
            // Ghost Gate doorway
            ctx.fillStyle = '#ffee0080';
            ctx.fillRect(x, y + cellSize / 2 - 3, cellSize, 6);
          } else {
            // Smooth racing asphalt road
            ctx.fillStyle = '#090a0f';
            ctx.fillRect(x, y, cellSize, cellSize);

            // Glowing dot details (Turbos: 1, Gas Cans: 2)
            if (val === 1) {
              // Yellow glow lightning Turbo Boost bolts
              ctx.fillStyle = 'rgba(255,215,0,0.4)';
              ctx.beginPath();
              ctx.arc(x + cellSize / 2, y + cellSize / 2, 5, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = '#FFD700'; // Bright core yellow
              ctx.beginPath();
              ctx.arc(x + cellSize / 2, y + cellSize / 2, 2.5, 0, Math.PI * 2);
              ctx.fill();
            } else if (val === 2) {
              // Drawing highly detailed retro red/yellow Gas Cans shapes
              ctx.save();
              ctx.translate(x + cellSize / 2, y + cellSize / 2);
              
              // Pulsing power glow animation
              const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.15;
              ctx.scale(pulse, pulse);

              // Red jerrycan base
              ctx.fillStyle = '#E30A17';
              ctx.fillRect(-5, -3, 10, 10);
              
              // Handle & Nozzle yellow top
              ctx.fillStyle = '#FFD700';
              ctx.fillRect(-3, -6, 6, 3); // cap handle
              ctx.fillRect(2, -7, 2, 2); // nozzle

              // Yellow electric warning 'G' label inside can
              ctx.fillStyle = '#ffffff';
              ctx.font = '7px sans-serif';
              ctx.fillText('⛽', -4, 4);

              ctx.restore();
            }
          }
        }
      }

      // --- DRAW PLAYER CAR (FERRARI) ---
      const drawPlayerCar = () => {
        const p = playerRef.current;
        const x = p.canvasX * cellSize + cellSize / 2;
        const y = p.canvasY * cellSize + cellSize / 2;

        ctx.save();
        ctx.translate(x, y);

        // Turn heading direction calculation
        let rotation = 0;
        if (p.dir === 'UP') rotation = 0;
        else if (p.dir === 'DOWN') rotation = Math.PI;
        else if (p.dir === 'LEFT') rotation = -Math.PI / 2;
        else if (p.dir === 'RIGHT') rotation = Math.PI / 2;
        else {
          // Keep current static facing orientation or look forward
          rotation = 0;
        }
        
        // Always rotate based on calculated rotation
        ctx.rotate(rotation);

        // Render overdrive aura
        if (overdriveTimerRef.current > 0) {
          ctx.strokeStyle = '#00ffee';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, cellSize * 0.8, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.fillStyle = '#00ffee20';
          ctx.beginPath();
          ctx.arc(0, 0, cellSize * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }

        const carW = cellSize * 0.72; // Wider track for beautiful arcade graphics
        const carH = cellSize * 1.15; // Longer proportions

        // Sleek floor shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(0, carH / 8, carW * 0.6, carH * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Render retro vector model (matching the screenshots)
        ctx.fillStyle = '#0a0a0f';
        const wheelW = carW * 0.16;
        const wheelH = carH * 0.22;
        // Front wheels
        ctx.fillRect(-carW / 2 - wheelW * 0.2, -carH / 3.2, wheelW, wheelH);
        ctx.fillRect(carW / 2 - wheelW * 0.8, -carH / 3.2, wheelW, wheelH);
        // Rear wheels (slightly wider for maximum racing grip)
        const rWheelW = wheelW * 1.25;
        const rWheelH = wheelH * 1.1;
        ctx.fillRect(-carW / 2 - rWheelW * 0.25, carH / 4.5, rWheelW, rWheelH);
        ctx.fillRect(carW / 2 - rWheelW * 0.75, carH / 4.5, rWheelW, rWheelH);

          if (config.id === 'f40') {
            // --- FERRARI F40 WEDGE RACER (High-fidelity pixel art accurate) ---
            
            // 1. Draw main red wedge-shaped aerodynamic base
            ctx.beginPath();
            ctx.moveTo(-carW / 2, carH / 2 - 2.5);
            ctx.lineTo(-carW / 2, -carH / 6); // straight flat sides
            ctx.quadraticCurveTo(-carW / 2, -carH / 2.1, -carW / 2.6, -carH / 2.1); // tapered sharp wedge nose
            ctx.lineTo(carW / 2.6, -carH / 2.1);
            ctx.quadraticCurveTo(carW / 2, -carH / 2.1, carW / 2, -carH / 6);
            ctx.lineTo(carW / 2, carH / 2 - 2.5);
            ctx.closePath();
            ctx.fillStyle = config.color;
            ctx.fill();
            
            // Draw a fine black pen outline around the entire shell
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();

            // 2. Front aerodynamic splitter lip
            ctx.fillStyle = '#060608';
            ctx.fillRect(-carW / 2 + 1, -carH / 2.05, carW - 2, 1.8);

            // 3. Exquisite front corner closed headlight pods (Matching the uploaded image)
            // Left light pod
            ctx.fillStyle = '#111216';
            ctx.fillRect(-carW / 2.3, -carH / 2.15, 3.5, 2.0);
            ctx.fillStyle = '#ffd700'; // Amber/Yellow light element
            ctx.fillRect(-carW / 2.3 + 0.6, -carH / 2.15 + 0.4, 2.3, 1.2);
            
            // Right light pod
            ctx.fillStyle = '#111216';
            ctx.fillRect(carW / 2.3 - 3.5, -carH / 2.15, 3.5, 2.0);
            ctx.fillStyle = '#ffd700'; // Amber/Yellow light element
            ctx.fillRect(carW / 2.3 - 3.5 + 0.6, -carH / 2.15 + 0.4, 2.3, 1.2);

            // 4. NACA Hood Inlets (Signature twin black triangular intakes)
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.moveTo(-carW / 4.2, -carH / 3.2);
            ctx.lineTo(-carW / 7.5, -carH / 3.2 + 3);
            ctx.lineTo(-carW / 3, -carH / 3.2 + 3);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(carW / 4.2, -carH / 3.2);
            ctx.lineTo(carW / 3, -carH / 3.2 + 3);
            ctx.lineTo(carW / 7.5, -carH / 3.2 + 3);
            ctx.closePath();
            ctx.fill();

            // 5. Pop-up headlight seams (thin clean gray lines on the hood)
            ctx.strokeStyle = '#800207'; // Deep shadow color lines
            ctx.lineWidth = 0.6;
            ctx.strokeRect(-carW / 2.8, -carH / 2.6, 3, 2);
            ctx.strokeRect(carW / 2.8 - 3, -carH / 2.6, 3, 2);

            // Center yellow Ferrari shield emblem
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(-0.8, -carH / 3.0, 1.6, 2.2);

            // 6. Sidebar Rear Fender Entrances (Black side scoop vents)
            ctx.fillStyle = '#000000';
            ctx.fillRect(-carW / 2, carH / 20, 1.8, carH / 7);
            ctx.fillRect(carW / 2 - 1.8, carH / 20, 1.8, carH / 7);

            // 7. Large horizontal engine cover cooling glass (grey charcoal with black frames)
            ctx.fillStyle = '#1c1d24';
            ctx.fillRect(-carW / 3.3, carH / 10, (carW / 3.3) * 2, carH / 3.2);
            
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(-carW / 3.3, carH / 10, (carW / 3.3) * 2, carH / 3.2);

            // Render 10 thick engine cooling slots/slats (Perfect match to the uploaded image)
            ctx.fillStyle = '#050508';
            const totalSlats = 10;
            const slatGap = (carH / 3.2 - 2) / totalSlats;
            for (let row = 0; row < totalSlats; row++) {
              ctx.fillRect(-carW / 3.3 + 1, carH / 10 + 1 + row * slatGap, (carW / 3.3) * 2 - 2, 1);
            }

            // Render twin aluminum V8 intake manifolds under glass
            ctx.fillStyle = '#ea580c'; // Red turbo plenums inside
            ctx.fillRect(-2, carH / 8.5, 1, carH / 8);
            ctx.fillRect(1, carH / 8.5, 1, carH / 8);

            // Draw the glass highlight line on engine cover
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(-carW / 3.3, carH / 10 + 2);
            ctx.lineTo(-carW / 3.3, carH / 10 + carH / 3.2 - 2);
            ctx.stroke();

            // 8. Custom cockpit dome canopy (Black glass frame)
            ctx.fillStyle = '#050510';
            ctx.beginPath();
            ctx.roundRect(-carW / 3.1, -carH / 6.5, (carW / 3.1) * 2, carH / 4.4, [3.5, 3.5, 1, 1]);
            ctx.fill();

            // Central red body pillar spine running through roof (Red center divider)
            ctx.fillStyle = config.color;
            ctx.fillRect(-0.8, -carH / 10, 1.6, carH / 7.5);

            // Blue windscreen glare sheen
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-carW / 3.8, -carH / 7.5);
            ctx.lineTo(0, -carH / 9);
            ctx.stroke();

            // Side mirror "ears" (iconic F40 mirrors popping out)
            ctx.fillStyle = config.color;
            // Left mirror
            ctx.fillRect(-carW / 2 - 2, -carH / 7.5, 2.2, 1.5);
            ctx.fillStyle = '#000000';
            ctx.fillRect(-carW / 2 - 2, -carH / 7.5 + 0.3, 0.5, 0.9);
            // Right mirror
            ctx.fillStyle = config.color;
            ctx.fillRect(carW / 2, -carH / 7.5, 2.2, 1.5);
            ctx.fillStyle = '#000000';
            ctx.fillRect(carW / 2 + 1.7, -carH / 7.5 + 0.3, 0.5, 0.9);

            // 9. Iconic massive integrated rectangular F40 BOX Wing / Spoiler
            // Let's draw the full side support plates and main wing element
            ctx.fillStyle = config.color;
            // Span a wider box spoiler at the tail
            const wingW = carW + 4;
            const wingY = carH / 2 - 4.5;
            const wingH = 2.4;

            // Draw the main wing blade
            ctx.fillRect(-wingW / 2, wingY, wingW, wingH);
            
            // Draw the thick side endplates extending down to the rear fender base
            ctx.fillRect(-wingW / 2, wingY, 2.5, 4.5);
            ctx.fillRect(wingW / 2 - 2.5, wingY, 2.5, 4.5);

            // Add clean black outline around spoiler to enforce isometrics
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(-wingW / 2, wingY, wingW, wingH);
            ctx.strokeRect(-wingW / 2, wingY, 2.5, 4.5);
            ctx.strokeRect(wingW / 2 - 2.5, wingY, 2.5, 4.5);
            
            // Triple exhaust centers in the bumper gap
            ctx.fillStyle = '#111116';
            ctx.fillRect(-2, carH / 2 - 1, 4, 1.5);
            ctx.fillStyle = '#b5b5be'; // Silver exhaust tips
            ctx.fillRect(-1.5, carH / 2 - 0.5, 0.8, 1);
            ctx.fillRect(-0.4, carH / 2 - 0.5, 0.8, 1);
            ctx.fillRect(0.7, carH / 2 - 0.5, 0.8, 1);
          } else if (config.id === 'f50') {
            // --- FERRARI F50 CURVACEOUS SEAMLESS VECTOR ---
            
            // 1. Sleek aerodynamic hourglass body
            ctx.beginPath();
            ctx.moveTo(-carW / 2.1, carH / 2 - 2);
            // Slinky hourglass waist curving inward, then outward to the nose
            ctx.bezierCurveTo(-carW / 2.1, carH / 5, -carW / 2.3, -carH / 10, -carW / 2.4, -carH / 2);
            // Curved F1 nose cone
            ctx.quadraticCurveTo(0, -carH / 1.8, carW / 2.4, -carH / 2);
            ctx.bezierCurveTo(carW / 2.3, -carH / 10, carW / 2.1, carH / 5, carW / 2.1, carH / 2 - 2);
            ctx.closePath();
            ctx.fillStyle = config.color;
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Front splitter plate
            ctx.fillStyle = '#060608';
            ctx.fillRect(-carW / 2.6, -carH / 2.05, (carW / 2.6) * 2, 1.5);

            // 2. High-fidelity symmetric teardrop headlight pods
            const lightY = -carH / 2.4;
            const lightX = carW / 3.4;
            
            // Left headlight pod
            ctx.fillStyle = '#0e0e12';
            ctx.beginPath();
            ctx.ellipse(-lightX, lightY, 2.2, 3.8, Math.PI / 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            // Amber bulb
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(-lightX - 0.4, lightY - 0.6, 1.0, 0, Math.PI * 2);
            ctx.fill();

            // Right headlight pod
            ctx.fillStyle = '#0e0e12';
            ctx.beginPath();
            ctx.ellipse(lightX, lightY, 2.2, 3.8, -Math.PI / 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            // Amber bulb
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(lightX + 0.4, lightY - 0.6, 1.0, 0, Math.PI * 2);
            ctx.fill();

            // 3. F50 Signature twin angled hood nostrils
            ctx.fillStyle = '#0f1013';
            // Left nostril
            ctx.beginPath();
            ctx.moveTo(-carW / 4.4, -carH / 3.2);
            ctx.lineTo(-carW / 3.2, -carH / 4.2);
            ctx.lineTo(-carW / 4.0, -carH / 4.2);
            ctx.closePath();
            ctx.fill();
            // Right nostril
            ctx.beginPath();
            ctx.moveTo(carW / 4.4, -carH / 3.2);
            ctx.lineTo(carW / 3.2, -carH / 4.2);
            ctx.lineTo(carW / 4.0, -carH / 4.2);
            ctx.closePath();
            ctx.fill();

            // Centered small yellow Ferrari emblem
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(-0.8, -carH / 2.4, 1.6, 2.0);

            // 4. Cockpit Canopy Dome Tinted Glass
            ctx.fillStyle = '#050510';
            ctx.beginPath();
            ctx.ellipse(0, -carH / 10, carW / 2.6, carH / 5.2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Sky blue gloss reflection streak
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, -carH / 10, carW / 2.6 - 1.2, -Math.PI / 1.1, -Math.PI / 4, false);
            ctx.stroke();

            // 5. Classic Curved F50 Side Mirrors
            ctx.fillStyle = config.color;
            ctx.beginPath();
            ctx.ellipse(-carW / 2 - 1.5, -carH / 8, 1.8, 1.1, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            ctx.fillStyle = config.color;
            ctx.beginPath();
            ctx.ellipse(carW / 2 + 1.5, -carH / 8, 1.8, 1.1, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // 6. Transparent Rear Engine Glass Cover
            ctx.fillStyle = '#1c1d22';
            ctx.fillRect(-carW / 3.3, carH / 9, (carW / 3.3) * 2, carH / 4.2);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(-carW / 3.3, carH / 9, (carW / 3.3) * 2, carH / 4.2);

            // Red cylinder bank lines underneath
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(-carW / 5.0, carH / 6.5, 2, carH / 6.5);
            ctx.fillRect(carW / 5.0 - 2, carH / 6.5, 2, carH / 6.5);

            // 7. Iconic Integrated Ferrari Horseshoe Spoiler
            const wingRadius = carW * 0.52;
            const wingY = carH / 2 - wingRadius - 1.0;
            
            ctx.strokeStyle = config.color;
            ctx.lineWidth = 3.6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(0, wingY, wingRadius, 0, Math.PI, false); // Bottom half arc
            ctx.stroke();

            // Bold black line outlining the curvy wing for isometric crispness
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(0, wingY, wingRadius + 1.8, 0, Math.PI, false);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, wingY, wingRadius - 1.8, 0, Math.PI, false);
            ctx.stroke();
          } else {
            // --- FERRARI TESTAROSSA FLAT WIDE SLATE ---
            // Aggressive wedge tapering from extra-wide rear down to narrow nose
            ctx.fillStyle = config.color;
            ctx.beginPath();
            ctx.moveTo(-carW / 1.5, carH / 2 - 2); // Extremely wide aggressive fat hips
            ctx.lineTo(-carW / 1.65, carH / 8);
            ctx.lineTo(-carW / 2.1, -carH / 5);
            ctx.lineTo(-carW / 2.5, -carH / 2.1); // Narrow sports car front
            ctx.lineTo(carW / 2.5, -carH / 2.1);
            ctx.lineTo(carW / 2.1, -carH / 5);
            ctx.lineTo(carW / 1.65, carH / 8);
            ctx.lineTo(carW / 1.5, carH / 2 - 2);
            ctx.closePath();
            ctx.fill();

            // Distinctive Pop-Up Headlights (Drawn slightly raised with light elements)
            ctx.fillStyle = '#0f1013';
            ctx.fillRect(-carW / 3.2, -carH / 2.2, carW / 5.5, 2.2);
            ctx.fillRect(carW / 3.2 - carW / 5.5, -carH / 2.2, carW / 5.5, 2.2);
            ctx.fillStyle = overdriveTimerRef.current > 0 ? '#00ffee' : '#ffffbb';
            ctx.fillRect(-carW / 3.2 + 0.5, -carH / 2.2 + 0.5, carW / 5.5 - 1, 1);
            ctx.fillRect(carW / 3.2 - carW / 5.5 + 0.5, -carH / 2.2 + 0.5, carW / 5.5 - 1, 1);

            // Wide square-cut canopy canopy
            ctx.fillStyle = '#07080b';
            ctx.beginPath();
            ctx.roundRect(-carW / 2.8, -carH / 7, (carW / 2.8) * 2, carH / 3.6, 1);
            ctx.fill();

            // Blue windscreen glance band
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(-carW / 3.2, -carH / 7 + 0.5);
            ctx.lineTo(carW / 3.2, -carH / 7 + 0.5);
            ctx.stroke();

            // THE LEGENDARY SIDE DOOR INTAKE STRAKES (Slat bands flowing along hips!)
            ctx.fillStyle = '#07070a'; // Left flank dark intake cove
            ctx.fillRect(-carW / 1.68, -carH / 12, carW / 5.5, carH / 2.5);
            ctx.fillStyle = '#07070a'; // Right flank dark intake cove
            ctx.fillRect(carW / 1.68 - carW / 5.5, -carH / 12, carW / 5.5, carH / 2.5);

            // Overlay 5 body-colored horizontal strake slats on each side
            ctx.fillStyle = config.color;
            for (let slat = 0; slat < 5; slat++) {
              const slatY = -carH / 12 + slat * 2.8;
              ctx.fillRect(-carW / 1.68, slatY, carW / 5.5, 0.7);
              ctx.fillRect(carW / 1.68 - carW / 5.5, slatY, carW / 5.5, 0.7);
            }

            // Flat wide exhaust slats section (No wing!)
            ctx.fillStyle = '#14151b';
            ctx.fillRect(-carW / 2.1, carH / 4.5, (carW / 2.1) * 2, carH / 4.4);
            // Grill fins on flat rear deck
            ctx.fillStyle = '#06070a';
            for (let f = 0; f < 4; f++) {
              ctx.fillRect(-carW / 2.1, carH / 4.5 + 1.2 + f * 2, (carW / 2.1) * 2, 0.6);
            }

            // Beautiful wide horizontal classic Testarossa tail grille band covering full rear
            ctx.fillStyle = '#050508';
            ctx.fillRect(-carW / 1.5, carH / 2 - 4.5, (carW / 1.5) * 2, 3);
            
            // Full-width red taillights stripe
            ctx.fillStyle = '#e11d48';
            ctx.fillRect(-carW / 1.5 + 1.5, carH / 2 - 3.8, (carW / 1.5) * 2 - 3, 0.8);
          }

        ctx.restore();
      };

      drawPlayerCar();

      // --- DRAW GHOST ELECTRIC CORES LUCE ---
      const drawGhosts = () => {
        ghostsRef.current.forEach(g => {
          const x = g.canvasX * cellSize + cellSize / 2;
          const y = g.canvasY * cellSize + cellSize / 2;

          ctx.save();
          ctx.translate(x, y);

          // Rotate ghost based on its direction to face forward
          let gRotation = 0;
          if (g.dir === 'UP') gRotation = 0;
          else if (g.dir === 'DOWN') gRotation = Math.PI;
          else if (g.dir === 'LEFT') gRotation = -Math.PI / 2;
          else if (g.dir === 'RIGHT') gRotation = Math.PI / 2;
          ctx.rotate(gRotation);

          if (g.state === 'eaten') {
            // Eaten state: Sleek neon electric connector lightning battery base returning fast
            ctx.fillStyle = '#00ffa0';
            ctx.beginPath();
            ctx.moveTo(-2, -5);
            ctx.lineTo(2, -5);
            ctx.lineTo(1, 4);
            ctx.lineTo(-1, 4);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(-3, -6, 6, 12);
          } else if (g.state === 'frightened') {
            // Frightened state: Shapering low-power vulnerable EV, glowing in beautiful rainbow colors
            const hue = (Date.now() / 8) % 360;
            const rainbowColor = `hsl(${hue}, 100%, 55%)`;
            const pulse = Math.sin(Date.now() * 0.015) * 2;

            const gW = cellSize * (0.44 + pulse * 0.02);
            const gH = cellSize * 0.95;

            // Draw floor shadow
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath();
            ctx.ellipse(0, gH / 4, gW * 0.8, gH * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Shuddering shake effect
            const shake = Math.sin(Date.now() * 0.08) * 0.6;
            ctx.translate(shake, 0);

            // Luce form filled with the beautiful cycle colors
            ctx.fillStyle = rainbowColor;
            ctx.beginPath();
            ctx.moveTo(-gW / 2, gH / 2 - 2);
            ctx.bezierCurveTo(-gW / 1.5, -gH / 6, -gW / 1.8, -gH / 2, 0, -gH / 2); // aerodynamic nose
            ctx.bezierCurveTo(gW / 1.8, -gH / 2, gW / 1.5, -gH / 6, gW / 2, gH / 2 - 2);
            ctx.closePath();
            ctx.fill();

            // Searing white overlay stroke
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Low charge glitch canopy
            ctx.fillStyle = '#0a0b12';
            ctx.beginPath();
            ctx.ellipse(0, -gH / 12, gW / 3.2, gH / 4.4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Warning indicators
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px sans-serif';
            ctx.fillText('⚡', -3, 3);
          } else {
            // Active state: The fully high-tech concept EV "Ferrari Luce" in stunning sky-blue paint
            const originalColor = g.color; // blinky red, pinky rose, inky cyan, clyde orange
            const bodyColor = '#5acaff'; // Beautiful Luce bright sky-blue concept paint
            
            const gW = cellSize * 0.44; 
            const gH = cellSize * 0.95;

            // Draw floor shadow
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath();
            ctx.ellipse(0, gH / 4, gW * 0.8, gH * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();

            // 4 Cyber-electric glowing wheels tucked in
            ctx.fillStyle = '#0a0a0f';
            ctx.strokeStyle = originalColor; // neon wheel rim corresponding to original ghost color
            ctx.lineWidth = 1;
            // front wheels
            ctx.fillRect(-gW / 2 - 1, -gH / 4, 1.5, gH / 5);
            ctx.fillRect(gW / 2 - 0.5, -gH / 4, 1.5, gH / 5);
            // rear wheels
            ctx.fillRect(-gW / 2 - 1, gH / 5, 1.8, gH / 5);
            ctx.fillRect(gW / 2 - 0.8, gH / 5, 1.8, gH / 5);

            // Streamlined monocoque body shell (Sleek light blue Luce look)
            ctx.fillStyle = bodyColor;
            ctx.beginPath();
            ctx.moveTo(-gW / 2, gH / 2 - 2);
            ctx.bezierCurveTo(-gW / 1.5, -gH / 6, -gW / 1.8, -gH / 2, 0, -gH / 2); // aerodynamic nose
            ctx.bezierCurveTo(gW / 1.8, -gH / 2, gW / 1.5, -gH / 6, gW / 2, gH / 2 - 2);
            ctx.closePath();
            ctx.fill();

            // Bold carbon / glossy black driver canopy & glass flowing towards center nose
            ctx.fillStyle = '#08080c';
            ctx.beginPath();
            ctx.ellipse(0, -gH / 12, gW / 2.8, gH / 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Blue windscreen/canopy highlight reflection
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, -gH / 12, gW / 2.8 - 0.5, -Math.PI / 1.4, -Math.PI / 3);
            ctx.stroke();

            // Futuristic glowing LED strip headlight bar (Luce signature)
            ctx.strokeStyle = originalColor; // original ghost color accent highlight
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-gW / 2.5, -gH / 2.5);
            ctx.quadraticCurveTo(0, -gH / 2.3, gW / 2.5, -gH / 2.5);
            ctx.stroke();

            // Active battery/energy glow grid at the rear bumper
            ctx.fillStyle = originalColor;
            ctx.fillRect(-gW / 4, gH / 2 - 2.5, gW / 2, 1);
          }

          ctx.restore();
        });
      };

      drawGhosts();
    };

    // Main run loop logic
    const gameLoop = () => {
      updateGame();
      drawGrid();
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    lastActiveTimeRef.current = Date.now();
    gameLoop();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      resizeObserver.disconnect();
    };
  }, [stage, gamePaused, lives, currentSpeed, selectedVehicle]);

  const handlePauseToggle = () => {
    setGamePaused(!gamePaused);
  };

  const handleStopMatch = () => {
    setStage('menu');
  };

  const handleDirectionPress = (dir: Direction) => {
    if (stage !== 'playing' || gamePaused) return;
    playerRef.current.nextDir = dir;
    if (playerRef.current.dir === 'NONE') {
      if (!isWall(playerRef.current.gridX, playerRef.current.gridY, dir, true)) {
        playerRef.current.dir = dir;
      }
    }
    if (soundEnabled) {
      sfx.playEatTurbo();
    }
  };

  return (
    <div id="game-arena-wrapper" className="w-full flex flex-col lg:flex-row gap-5 items-stretch">
      
      {/* LEFT COLUMN: Main Game Area Canvas */}
      <div ref={containerRef} className="flex-1 flex flex-col items-center bg-[#07070a] border-3 border-stone-800 p-4 rounded-2xl shadow-xl">
        
        {/* Score & Controls Top Header */}
        <div className="w-full flex items-center justify-between border-b border-stone-800 pb-3 mb-4 font-mono text-xs">
          <div className="flex flex-col">
            <span className="text-stone-500 uppercase tracking-widest text-[9px]">Score Canisters</span>
            <span className="text-xl font-bold text-yellow-400 tracking-wider">
              {score.toLocaleString()} <span className="text-xs text-stone-500">⚡</span>
            </span>
          </div>

          <div className="flex flex-col items-center select-none">
            <span className="text-stone-500 uppercase tracking-widest text-[9px]">CIRCUIT GRID</span>
            <span className="text-[10px] sm:text-xs font-black text-rose-500 tracking-wide uppercase border border-rose-900/30 bg-rose-950/15 px-2.5 py-1.0 rounded mt-0.5 flex items-center gap-1">
              🏁 {activeMap.name}
            </span>
          </div>

          <div className="flex items-center gap-5">
            {/* Realtime Overdrive Flame Gauge */}
            {overdriveTime > 0 && (
              <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/30 px-3 py-1 rounded-full text-red-400 font-bold animate-pulse text-xxs">
                <Flame className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />
                OVERCHARGE: <span className="text-yellow-300 font-bold">{overdriveTime}s</span>
              </div>
            )}

            <div className="flex flex-col items-end">
              <span className="text-stone-500 uppercase tracking-widest text-[9px] text-right">Top Score</span>
              <span className="text-sm font-bold text-stone-300">
                {Math.max(score, highScore).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* MOBILE HUD: Beautiful tactile F1-inspired telemetry layout displayed only on phone screens */}
        <div className="w-full lg:hidden flex justify-between items-center bg-[#101016]/90 border border-stone-800/80 px-3 py-2 rounded-xl mb-4 font-mono text-xs shadow-md select-none">
          <div className="flex flex-col gap-0.5">
            <span className="text-stone-500 uppercase tracking-widest text-[8px] leading-none">ENGINE CONDITION</span>
            <div className="flex gap-1.5 items-center mt-1">
              <EngineIcon active={lives >= 1} />
              <EngineIcon active={lives >= 2} />
              <EngineIcon active={lives >= 3} />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-stone-500 uppercase tracking-widest text-[8px] leading-none mb-1">CHASSIS STATE</span>
            <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase border ${
              overdriveTime > 0 
                ? 'bg-red-950/60 text-[#ff4848] border-red-800/80 animate-pulse font-extrabold' 
                : 'bg-stone-900/60 text-stone-400 border-stone-800'
            }`}>
              {overdriveTime > 0 ? '🔥 COMBUSTION OVERDRIVE' : '⚡ ECO DODGE'}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-stone-500 uppercase tracking-widest text-[8px] leading-none">SPEED</span>
            <span className="text-stone-100 font-extrabold text-sm tracking-wider mt-1.5">
              {(playerRef.current.speed * 20).toFixed(0)} <span className="text-[9px] text-stone-500 font-normal">MPH</span>
            </span>
          </div>
        </div>

        {/* The Action Canvas */}
        <div className="relative border-4 border-red-800 shadow-inner bg-black rounded-lg overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="block shadow-[0_0_20px_rgba(0,0,0,0.8)]" />
        </div>

        {/* On-screen tactile mobile/iframe racer controls */}
        <div id="mobile-tactile-joystick" className="mt-4 w-full max-w-[280px] flex flex-col items-center">
          <div className="text-[10px] font-mono text-stone-500 uppercase tracking-widest text-center mb-2 flex items-center gap-1 bg-[#121217] px-3 py-1 rounded-full border border-stone-900 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>Gated F1 Command Pad</span>
          </div>
          
          <div id="joystick-ring" className="w-36 h-36 rounded-full bg-[#121215] border-4 border-stone-850 shadow-[inset_0_0_15px_rgba(0,0,0,0.9)] relative flex items-center justify-center select-none">
            {/* Central Badge */}
            <div className="w-12 h-12 rounded-full bg-yellow-400 border-2 border-stone-950 shadow-md flex flex-col items-center justify-center text-stone-950 font-sans leading-none z-10 pointer-events-none">
              <span className="font-black text-xxs tracking-tighter">SF</span>
              <span className="text-[6px] font-mono tracking-widest font-bold uppercase mt-0.5">ROAR</span>
            </div>

            {/* UP BUTTON */}
            <button
              id="pad-up"
              type="button"
              onTouchStart={(e) => { e.preventDefault(); handleDirectionPress('UP'); }}
              onMouseDown={(e) => { e.preventDefault(); handleDirectionPress('UP'); }}
              className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-8.5 bg-stone-900 hover:bg-stone-850 active:bg-yellow-400 active:text-stone-950 text-stone-400 rounded-t-lg flex items-center justify-center cursor-pointer shadow-md duration-100 touch-none active:scale-90 border border-stone-800/80"
              title="Drive Up"
              aria-label="Drive Up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>

            {/* LEFT BUTTON */}
            <button
              id="pad-left"
              type="button"
              onTouchStart={(e) => { e.preventDefault(); handleDirectionPress('LEFT'); }}
              onMouseDown={(e) => { e.preventDefault(); handleDirectionPress('LEFT'); }}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8.5 h-10 bg-stone-900 hover:bg-stone-850 active:bg-yellow-400 active:text-stone-950 text-stone-400 rounded-l-lg flex items-center justify-center cursor-pointer shadow-md duration-100 touch-none active:scale-90 border border-stone-800/80"
              title="Turn Left"
              aria-label="Turn Left"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* RIGHT BUTTON */}
            <button
              id="pad-right"
              type="button"
              onTouchStart={(e) => { e.preventDefault(); handleDirectionPress('RIGHT'); }}
              onMouseDown={(e) => { e.preventDefault(); handleDirectionPress('RIGHT'); }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8.5 h-10 bg-stone-900 hover:bg-stone-850 active:bg-yellow-400 active:text-stone-950 text-stone-400 rounded-r-lg flex items-center justify-center cursor-pointer shadow-md duration-100 touch-none active:scale-90 border border-stone-800/80"
              title="Turn Right"
              aria-label="Turn Right"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* DOWN BUTTON */}
            <button
              id="pad-down"
              type="button"
              onTouchStart={(e) => { e.preventDefault(); handleDirectionPress('DOWN'); }}
              onMouseDown={(e) => { e.preventDefault(); handleDirectionPress('DOWN'); }}
              className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-10 h-8.5 bg-stone-900 hover:bg-stone-850 active:bg-yellow-400 active:text-stone-950 text-stone-400 rounded-b-lg flex items-center justify-center cursor-pointer shadow-md duration-100 touch-none active:scale-90 border border-stone-800/80"
              title="Drive Down"
              aria-label="Drive Down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[8px] text-stone-500 font-mono mt-1.5 tracking-wide uppercase select-none text-center">
            Tap Pad or Swipe Screen to Steer
          </p>
        </div>

        {/* MOBILE ACTION BUTTONS: Sleek console action toggles directly accessible under the controller */}
        <div id="mobile-control-row" className="lg:hidden w-full max-w-[280px] grid grid-cols-2 gap-2 mt-4 font-mono text-xs select-none">
          <button
            id="mobile-pause-toggle"
            type="button"
            onClick={handlePauseToggle}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl uppercase font-bold text-[10px] cursor-pointer border transition-all active:scale-95 duration-75 ${
              gamePaused 
                ? 'bg-[#00ffa0] text-stone-950 border-[#00ffcc] font-extrabold shadow-[0_0_12px_rgba(0,255,160,0.3)]' 
                : 'bg-stone-900 text-stone-300 border-stone-800'
            }`}
          >
            {gamePaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-stone-950" /> Resume
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            )}
          </button>

          <button
            id="mobile-restart-race"
            type="button"
            onClick={() => {
              sfx.playEngineRev();
              resetGameEntities();
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-stone-700 text-stone-300 rounded-xl uppercase font-bold text-[10px] cursor-pointer active:scale-95 transition-all duration-75"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart
          </button>

          <button
            id="mobile-exit-race"
            type="button"
            onClick={handleStopMatch}
            className="col-span-2 flex items-center justify-center gap-1.5 py-2 px-4 bg-red-950/20 hover:bg-red-950/40 border border-red-950/70 hover:border-red-900 leading-none text-stone-400 hover:text-red-400 rounded-xl uppercase font-bold text-[10px] cursor-pointer active:scale-95 transition-all duration-75"
          >
            Exit to Fleet Menu
          </button>
        </div>

        {/* Pause/Play panel */}
        <div className="w-full flex justify-between items-center mt-4 font-mono text-xxs text-stone-500 pt-2 border-t border-stone-900">
          <div className="flex gap-1.5 items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>DRIVING: <strong className="text-stone-300">{config.name}</strong></span>
          </div>
          <div>
            <span>TURBO COUNTER: {dotsEatenRef.current}/{totalDotsRef.current}</span>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Performance Dash & Commands - Visible only on desktop to eliminate mobile duplication */}
      <div className="hidden lg:flex w-full lg:w-64 flex-col justify-between bg-[#101016] border border-stone-800 p-4 sm:p-5 rounded-2xl gap-5 shrink-0">
        
        {/* Dynamic Telemetry Specs */}
        <div className="space-y-4">
          <div className="border-b border-stone-800 pb-2 flex items-center justify-between">
            <span className="font-extrabold uppercase text-xs tracking-wider text-stone-100 flex items-center gap-1.5">
              🏁 TELEMETRY STATS
            </span>
            <span className="text-xxs font-mono text-red-500">Maranello</span>
          </div>

          <div className="space-y-3.5 font-mono text-xs">
            {/* Lives Shaped as Engine V12 cylinders blocks */}
            <div className="space-y-1.5">
              <span className="text-stone-400 block uppercase font-mono text-[10px]">ENGINE CONDITION:</span>
              <div className="flex gap-2">
                <EngineIcon active={lives >= 1} />
                <EngineIcon active={lives >= 2} />
                <EngineIcon active={lives >= 3} />
              </div>
              <p className="text-[10px] text-stone-500 italic font-mono pt-1">
                {lives === 3 ? '⚙️ Flat-12 running nominal.' : lives === 2 ? '⚠️ Piston misfit. Spark warning!' : '🚨 Danger! Crankshaft failure warning!'}
              </p>
            </div>

            <div className="space-y-1 pt-1.5">
              <span className="text-stone-400 block uppercase font-mono text-[10px]">CHASSIS FORCE MODE:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                overdriveTime > 0 ? 'bg-red-600 text-stone-50 border border-red-500' : 'bg-stone-900 text-stone-400 border border-stone-800'
              }`}>
                {overdriveTime > 0 ? '⛽ V12 COMBUSTION OVERDRIVE' : '⚡ ECO BATTERY DODGE'}
              </span>
            </div>

            <div className="space-y-1 pt-1.5">
              <span className="text-stone-400 block uppercase font-mono text-[10px]">SPEED CONSTANT:</span>
              <span className="text-stone-300 font-bold block bg-stone-950 p-1.5 rounded text-center border border-stone-900">
                {(playerRef.current.speed * 20).toFixed(0)} MPH {highSpeedMode ? '(OVERCLOCKED)' : '(STOCK)'}
              </span>
            </div>
          </div>
        </div>

        {/* Play Commands */}
        <div className="flex flex-col gap-2.5">
          <button
            id="pause-toggle-button"
            onClick={handlePauseToggle}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl uppercase font-mono font-bold text-xs cursor-pointer border transition-all ${
              gamePaused 
                ? 'bg-[#00ffa0] text-stone-950 border-[#00ffcc] hover:bg-[#20ffb5]' 
                : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-850 hover:text-stone-50'
            }`}
          >
            {gamePaused ? (
              <>
                <Play className="w-4 h-4 fill-stone-950" /> Resume Drive
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" /> Pause Game
              </>
            )}
          </button>

          <button
            id="crash-hard-restart"
            onClick={() => {
              sfx.playEngineRev();
              resetGameEntities();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-900 border border-stone-800 hover:border-stone-700 hover:bg-stone-850 text-stone-400 hover:text-stone-100 rounded-xl uppercase font-mono text-xs cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Restart Race
          </button>

          <button
            id="exit-race-menu"
            onClick={handleStopMatch}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-950/20 border border-red-950 hover:bg-red-950/40 text-stone-400 hover:text-red-400 rounded-xl uppercase font-mono text-xs cursor-pointer transition-all"
          >
            Exit to Menu
          </button>
        </div>

      </div>

    </div>
  );
};

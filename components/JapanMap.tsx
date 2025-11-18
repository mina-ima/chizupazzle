import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Prefecture, PuzzlePiece, GameMode } from '../types';
import { RefreshCw } from 'lucide-react';

interface JapanMapProps {
  prefectures: Prefecture[];
  activePiece: PuzzlePiece | null;
  placedPieces: PuzzlePiece[];
  onPieceDrop: (prefectureCode: number) => void;
  mode: GameMode;
  hoveredRegionCode: number | null;
  setHoveredRegionCode: (code: number | null) => void;
  onRetry?: () => void;
}

interface ZoomState {
  scale: number;
  x: number;
  y: number;
}

// 1倍(全体) -> 3倍(地方) -> 6倍(県周辺) -> 12倍(詳細)
const ZOOM_LEVELS = [1, 3, 6, 12];

const JapanMap: React.FC<JapanMapProps> = ({ 
  prefectures,
  activePiece, 
  placedPieces, 
  onPieceDrop, 
  mode,
  hoveredRegionCode,
  setHoveredRegionCode,
  onRetry
}) => {
  const [zoom, setZoom] = useState<ZoomState>({ scale: 1, x: 500, y: 500 });
  const zoomIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const zoomTriggerPosRef = useRef<{x: number, y: number} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom when piece is dropped or cancelled
  // Also reset when activePiece changes (to ensure new piece drag starts fresh)
  useEffect(() => {
    if (!activePiece) {
      if (zoomIntervalRef.current) clearInterval(zoomIntervalRef.current);
      setZoom({ scale: 1, x: 500, y: 500 });
      zoomTriggerPosRef.current = null;
      lastMousePosRef.current = { x: 0, y: 0 };
    } else {
        // Reset internal trackers for new piece
        lastMousePosRef.current = { x: 0, y: 0 };
        zoomTriggerPosRef.current = null;
    }
  }, [activePiece]); 

  // Sort prefectures to ensure placed/hovered items are rendered on top (DOM order = z-index in SVG)
  const sortedPrefectures = useMemo(() => {
    return [...prefectures].sort((a, b) => {
      const aPlaced = placedPieces.some(p => p.prefectureCode === a.code);
      const bPlaced = placedPieces.some(p => p.prefectureCode === b.code);
      const aHover = hoveredRegionCode === a.code;
      const bHover = hoveredRegionCode === b.code;

      // Hovered is highest priority (render last)
      if (aHover && !bHover) return 1;
      if (!aHover && bHover) return -1;

      // Placed is next priority
      if (aPlaced && !bPlaced) return 1;
      if (!aPlaced && bPlaced) return -1;

      return 0;
    });
  }, [prefectures, placedPieces, hoveredRegionCode]);

  // Shared interaction logic for DragOver, TouchMove, and MouseMove
  const processInteraction = useCallback((currentX: number, currentY: number) => {
    // Initialize lastMousePos if it's the first event
    if (lastMousePosRef.current.x === 0 && lastMousePosRef.current.y === 0) {
        lastMousePosRef.current = { x: currentX, y: currentY };
    }

    // 1. Hit Testing using elementFromPoint
    // This is more reliable than onDragEnter during transforms/scaling
    const el = document.elementFromPoint(currentX, currentY);
    let foundCode: number | null = null;
    
    // Allow 'path' (land) or 'rect' (Okinawa hitbox)
    if (el && (el.tagName === 'path' || el.tagName === 'rect') && el.id.startsWith('pref-')) {
        const code = parseInt(el.id.replace('pref-', ''), 10);
        if (!isNaN(code)) {
            foundCode = code;
        }
    }
    
    // Only update state if changed to avoid excessive re-renders
    if (foundCode !== hoveredRegionCode) {
        setHoveredRegionCode(foundCode);
    }

    // 2. Zoom Logic
    // Calculate movement distance since last event
    const dx = currentX - lastMousePosRef.current.x;
    const dy = currentY - lastMousePosRef.current.y;
    const dist = Math.hypot(dx, dy);
    
    lastMousePosRef.current = { x: currentX, y: currentY };

    // ------------------------------------------
    // Zoom OUT Logic
    // ------------------------------------------
    if (zoom.scale > 1 && zoomTriggerPosRef.current) {
        const distFromAnchor = Math.hypot(
            currentX - zoomTriggerPosRef.current.x,
            currentY - zoomTriggerPosRef.current.y
        );
        
        // Threshold: 150px radius movement resets zoom level down
        if (distFromAnchor > 150) {
            const currentIdx = ZOOM_LEVELS.indexOf(zoom.scale);
            const prevIdx = currentIdx - 1;

            if (prevIdx >= 0) {
                const newScale = ZOOM_LEVELS[prevIdx];
                setZoom(prev => ({
                    scale: newScale,
                    x: newScale === 1 ? 500 : prev.x, 
                    y: newScale === 1 ? 500 : prev.y
                }));
                zoomTriggerPosRef.current = { x: currentX, y: currentY };
            }
            
            if (zoomIntervalRef.current) {
                clearInterval(zoomIntervalRef.current);
                zoomIntervalRef.current = null;
            }
            return;
        }
    }

    // ------------------------------------------
    // Zoom IN Logic (Continuous)
    // ------------------------------------------
    
    // If moving significantly (shaking mouse or traversing), cancel zoom interval
    if (dist > 20) { 
        if (zoomIntervalRef.current) {
          clearInterval(zoomIntervalRef.current);
          zoomIntervalRef.current = null;
        }
        return; // Exit to prevent immediate restart
    }

    const maxLevel = ZOOM_LEVELS[ZOOM_LEVELS.length - 1];

    // Trigger zoom LOOP if hovering over a region and not already zooming
    if (!zoomIntervalRef.current && activePiece && foundCode && zoom.scale < maxLevel) {
      
      // Start a repeating interval to handle continuous zoom while holding still
      zoomIntervalRef.current = setInterval(() => {
        
        // Inside the interval, we must use the LATEST known mouse position
        const { x: lx, y: ly } = lastMousePosRef.current;
        
        // Re-verify we are still over the map (in case zoom shifted it away)
        const checkEl = document.elementFromPoint(lx, ly);
        const isOverMap = checkEl && (checkEl.tagName === 'path' || checkEl.tagName === 'rect') && checkEl.id.startsWith('pref-');
        
        if (!isOverMap) {
            if (zoomIntervalRef.current) {
                clearInterval(zoomIntervalRef.current);
                zoomIntervalRef.current = null;
            }
            return;
        }

        // Identify the target prefecture to center on
        const codeStr = checkEl.id.replace('pref-', '');
        const targetCode = parseInt(codeStr, 10);
        const targetPref = prefectures.find(p => p.code === targetCode);

        setZoom(prevZoom => {
            const currentIdx = ZOOM_LEVELS.indexOf(prevZoom.scale);
            const nextIdx = currentIdx + 1;

            // Stop if we reach max level
            if (nextIdx >= ZOOM_LEVELS.length) {
                if (zoomIntervalRef.current) {
                    clearInterval(zoomIntervalRef.current);
                    zoomIntervalRef.current = null;
                }
                return prevZoom;
            }

            const newScale = ZOOM_LEVELS[nextIdx];
            
            let newCenterX = prevZoom.x;
            let newCenterY = prevZoom.y;

            // Logic change: Center on the detected prefecture instead of mouse position
            if (targetPref && targetPref.centerX && targetPref.centerY) {
                newCenterX = targetPref.centerX;
                newCenterY = targetPref.centerY;
            } else {
                // Fallback: If for some reason center is missing, use mouse logic (Fixed Point Zoom Math)
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) {
                    const mouseNormX = ((lx - rect.left) / rect.width) * 1000;
                    const mouseNormY = ((ly - rect.top) / rect.height) * 1000;
                    const currentMapX = prevZoom.x + (mouseNormX - 500) / prevZoom.scale;
                    const currentMapY = prevZoom.y + (mouseNormY - 500) / prevZoom.scale;
                    newCenterX = currentMapX - (mouseNormX - 500) / newScale;
                    newCenterY = currentMapY - (mouseNormY - 500) / newScale;
                }
            }

            // Update the anchor so Zoom Out logic knows where we are
            zoomTriggerPosRef.current = { x: lx, y: ly };

            return {
                scale: newScale,
                x: newCenterX,
                y: newCenterY
            };
        });

      }, 1000); // Slower interval (1 second)
    }
  }, [activePiece, hoveredRegionCode, zoom.scale, prefectures]);


  const handleGlobalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    processInteraction(e.clientX, e.clientY);
  };

  // Touch handlers for tablet/mobile support (Selection Mode)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (activePiece) {
        const touch = e.touches[0];
        processInteraction(touch.clientX, touch.clientY);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (activePiece) {
        const touch = e.touches[0];
        // Reset last pos to avoid jump calculation
        lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
        processInteraction(touch.clientX, touch.clientY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (activePiece) {
          processInteraction(e.clientX, e.clientY);
      }
  };

  // Global drop handler attached to SVG to ensure reliable hit testing even during animation
  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Cleanup zoom/drag state immediately
    setHoveredRegionCode(null);
    if (zoomIntervalRef.current) clearInterval(zoomIntervalRef.current);
    setZoom({ scale: 1, x: 500, y: 500 });
    zoomTriggerPosRef.current = null;
    lastMousePosRef.current = { x: 0, y: 0 };

    // Determine target using visual hit testing
    const el = document.elementFromPoint(e.clientX, e.clientY);
    let targetCode: number | null = null;

    if (el && (el.tagName === 'path' || el.tagName === 'rect') && el.id.startsWith('pref-')) {
        targetCode = parseInt(el.id.replace('pref-', ''), 10);
    }

    if (targetCode !== null && !isNaN(targetCode)) {
        onPieceDrop(targetCode);
    }
  };

  const handleContainerDragLeave = (e: React.DragEvent) => {
     if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
         setHoveredRegionCode(null);
         // Note: We do NOT clear the zoom here, relying on distance logic instead
     }
  };

  const handleClick = (code: number) => {
    if (activePiece) {
        onPieceDrop(code);
    }
  };

  const hasPaths = prefectures.some(p => !!p.path);

  return (
    <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center p-2 md:p-6 relative animate-in fade-in duration-700"
        onDragLeave={handleContainerDragLeave}
    >
      
      {!hasPaths && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-slate-400 font-bold bg-white/50 backdrop-blur-sm rounded-3xl">
          <p className="mb-4 text-slate-600 text-lg">地図データを読み込めませんでした。</p>
          {onRetry && (
            <button 
                onClick={onRetry}
                className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors shadow-md"
            >
                <RefreshCw size={18} />
                再読み込み
            </button>
          )}
        </div>
      )}

      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full max-w-full max-h-full filter drop-shadow-xl select-none touch-none aspect-square"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: '90vh', maxHeight: '90vh' }}
        onDragOver={handleGlobalDragOver}
        onDrop={handleGlobalDrop}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onMouseMove={handleMouseMove}
      >
        {/* Transparent background to catch drag events over ocean */}
        <rect x="0" y="0" width="1000" height="1000" fill="transparent" />

        {/* Zoom Wrapper Group */}
        <g
            className="transition-transform duration-300 ease-out will-change-transform"
            style={{
                transform: `translate(500px, 500px) scale(${zoom.scale}) translate(-${zoom.x}px, -${zoom.y}px)`,
                transformOrigin: '0 0'
            }}
        >
            {hasPaths && (
                <>
                    {/* Okinawa Inset Border */}
                    <rect 
                        x="110" y="110" width="140" height="100" 
                        fill="none" stroke="#cbd5e1" strokeWidth="2" rx="4" 
                        vectorEffect="non-scaling-stroke"
                    />
                    {/* Okinawa Hitbox (Transparent Rect for easier dropping) */}
                    <rect 
                        id="pref-47-hitbox" 
                        x="110" y="110" width="140" height="100" 
                        fill="transparent"
                        className="cursor-pointer"
                        style={{ pointerEvents: 'all' }}
                        onClick={() => handleClick(47)}
                    />
                    <text x="180" y="100" textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold" style={{fontFamily: 'Zen Maru Gothic'}}>沖縄</text>
                </>
            )}
            
            {sortedPrefectures.map((pref) => {
            if (!pref.path) return null;

            const isPlaced = placedPieces.some(p => p.prefectureCode === pref.code);
            const isHovered = hoveredRegionCode === pref.code;
            
            let fillColor = '#f1f5f9'; 
            let strokeColor = '#64748b'; 
            let strokeWidth = 1.5;
            let zIndex = 0;
            let className = "transition-all duration-300 ease-out outline-none pointer-events-auto";

            if (isPlaced) {
                fillColor = '#86efac'; 
                strokeColor = '#166534'; 
                strokeWidth = 2;
                zIndex = 5;
                className += " animate-in zoom-in-50 duration-500"; 
            } else if (isHovered) {
                fillColor = '#bae6fd'; 
                strokeColor = '#0284c7'; 
                strokeWidth = 3; 
                zIndex = 10;
                className += " filter drop-shadow-lg scale-[1.01]"; 
            }

            return (
                <g 
                key={pref.code}
                onClick={() => handleClick(pref.code)}
                className="cursor-pointer group"
                style={{ position: 'relative', zIndex, transformOrigin: `${pref.centerX}px ${pref.centerY}px` }}
                >
                <path
                    id={`pref-${pref.code}`}
                    d={pref.path}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={className}
                    vectorEffect="non-scaling-stroke"
                />
                
                {isPlaced && !activePiece && pref.centerX && pref.centerY && (
                    <text
                    x={pref.centerX}
                    y={pref.centerY}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize="24" 
                    fontWeight="900"
                    fill="#064e3b"
                    stroke="white"
                    strokeWidth="6"
                    paintOrder="stroke"
                    className="pointer-events-none select-none font-sans animate-in fade-in zoom-in duration-500 delay-100"
                    style={{ 
                        fontFamily: 'Zen Maru Gothic',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    >
                    {pref.name}
                    </text>
                )}
                </g>
            );
            })}
        </g>
      </svg>
    </div>
  );
};

export default JapanMap;
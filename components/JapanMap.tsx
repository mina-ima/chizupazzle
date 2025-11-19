
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Prefecture, PuzzlePiece, GameMode } from '../types';
import { RefreshCw, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

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

  // Pinch Zoom Refs
  const pinchRef = useRef<{
    startDist: number;
    startScale: number;
    startCenter: { x: number, y: number }; // Screen coordinates
    startZoom: ZoomState;
  } | null>(null);

  // Reset zoom when piece is dropped or cancelled (only if not manually zoomed via pinch)
  // We want to keep the zoom level if the user manually adjusted it to find a spot.
  // But if the activePiece becomes null (drop finished), we might want to reset IF we were in auto-zoom mode.
  // For simplicity in this hybrid mode, we reset on piece change ONLY if scale is 1 (fresh start) or if needed.
  // Actually, keeping zoom context is better for gameplay. Let's NOT auto-reset zoom on activePiece change if touched.
  useEffect(() => {
    if (!activePiece) {
      if (zoomIntervalRef.current) clearInterval(zoomIntervalRef.current);
      zoomTriggerPosRef.current = null;
      lastMousePosRef.current = { x: 0, y: 0 };
      // Note: We do NOT reset zoom here to allow users to admire their work or stay zoomed in
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

  // --- Mouse Interaction Logic (Desktop Auto-Zoom) ---
  const processMouseInteraction = useCallback((currentX: number, currentY: number) => {
    // Skip auto-zoom logic if user is pinching
    if (pinchRef.current) return;

    // Initialize lastMousePos if it's the first event
    if (lastMousePosRef.current.x === 0 && lastMousePosRef.current.y === 0) {
        lastMousePosRef.current = { x: currentX, y: currentY };
    }

    // Hit Testing
    const el = document.elementFromPoint(currentX, currentY);
    let foundCode: number | null = null;
    if (el && (el.tagName === 'path' || el.tagName === 'rect') && el.id.startsWith('pref-')) {
        const code = parseInt(el.id.replace('pref-', ''), 10);
        if (!isNaN(code)) foundCode = code;
    }
    
    if (foundCode !== hoveredRegionCode) {
        setHoveredRegionCode(foundCode);
    }

    // Zoom Logic (Auto-zoom on hover for mouse)
    // Only active if we haven't manually zoomed via pinch (heuristic: generic zoom levels)
    // If the user is using touch, we generally want to disable this auto-zoom behavior 
    // because it interferes with manual pinch/pan.
    // We'll check event type in the calling handlers or rely on the fact that touch triggers handleTouchMove.
    
    const dx = currentX - lastMousePosRef.current.x;
    const dy = currentY - lastMousePosRef.current.y;
    const dist = Math.hypot(dx, dy);
    lastMousePosRef.current = { x: currentX, y: currentY };

    // Auto zoom-out logic
    if (zoom.scale > 1 && zoomTriggerPosRef.current) {
        const distFromAnchor = Math.hypot(
            currentX - zoomTriggerPosRef.current.x,
            currentY - zoomTriggerPosRef.current.y
        );
        if (distFromAnchor > 150) {
            const currentIdx = ZOOM_LEVELS.indexOf(zoom.scale); // Might be -1 if custom zoomed
            // If custom zoomed, just zoom out to nearest level
            let newScale = 1;
            if (currentIdx > 0) newScale = ZOOM_LEVELS[currentIdx - 1];
            else if (currentIdx === -1 && zoom.scale > 1) newScale = 1;

            setZoom(prev => ({
                scale: newScale,
                x: newScale === 1 ? 500 : prev.x, 
                y: newScale === 1 ? 500 : prev.y
            }));
            zoomTriggerPosRef.current = { x: currentX, y: currentY };
            if (zoomIntervalRef.current) {
                clearInterval(zoomIntervalRef.current);
                zoomIntervalRef.current = null;
            }
            return;
        }
    }

    // Auto zoom-in logic (Only if moving slowly and over a target)
    if (dist > 20) { 
        if (zoomIntervalRef.current) {
          clearInterval(zoomIntervalRef.current);
          zoomIntervalRef.current = null;
        }
        return; 
    }

    // Trigger zoom interval
    if (!zoomIntervalRef.current && activePiece && foundCode && zoom.scale < 12) {
      zoomIntervalRef.current = setInterval(() => {
        const { x: lx, y: ly } = lastMousePosRef.current;
        
        // Only auto-zoom if NOT pinching
        if (pinchRef.current) return;

        const checkEl = document.elementFromPoint(lx, ly);
        const isOverMap = checkEl && (checkEl.tagName === 'path' || checkEl.tagName === 'rect') && checkEl.id.startsWith('pref-');
        
        if (!isOverMap) {
            if (zoomIntervalRef.current) {
                clearInterval(zoomIntervalRef.current);
                zoomIntervalRef.current = null;
            }
            return;
        }

        const codeStr = checkEl.id.replace('pref-', '');
        const targetCode = parseInt(codeStr, 10);
        const targetPref = prefectures.find(p => p.code === targetCode);

        setZoom(prevZoom => {
             // Find next logical zoom level
            let nextScale = ZOOM_LEVELS.find(z => z > prevZoom.scale);
            if (!nextScale) {
                 if (prevZoom.scale < 12) nextScale = 12;
                 else return prevZoom;
            }

            let newCenterX = prevZoom.x;
            let newCenterY = prevZoom.y;

            if (targetPref && targetPref.centerX && targetPref.centerY) {
                newCenterX = targetPref.centerX;
                newCenterY = targetPref.centerY;
            } else {
                 // Fallback logic
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) {
                    const mouseNormX = ((lx - rect.left) / rect.width) * 1000;
                    const mouseNormY = ((ly - rect.top) / rect.height) * 1000;
                    const currentMapX = prevZoom.x + (mouseNormX - 500) / prevZoom.scale;
                    const currentMapY = prevZoom.y + (mouseNormY - 500) / prevZoom.scale;
                    newCenterX = currentMapX - (mouseNormX - 500) / nextScale;
                    newCenterY = currentMapY - (mouseNormY - 500) / nextScale;
                }
            }
            zoomTriggerPosRef.current = { x: lx, y: ly };
            return { scale: nextScale, x: newCenterX, y: newCenterY };
        });
      }, 800); 
    }
  }, [activePiece, hoveredRegionCode, zoom.scale, prefectures]);

  // --- Touch Interaction Logic (Pinch & Pan) ---

  const getTouchDistance = (touches: React.TouchList) => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  };

  const getTouchCenter = (touches: React.TouchList) => {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
        // Start Pinch/Pan
        e.preventDefault(); // Prevent browser zoom
        const dist = getTouchDistance(e.touches);
        const center = getTouchCenter(e.touches);
        
        // Stop any auto-zoom
        if (zoomIntervalRef.current) {
            clearInterval(zoomIntervalRef.current);
            zoomIntervalRef.current = null;
        }

        pinchRef.current = {
            startDist: dist,
            startScale: zoom.scale,
            startCenter: center,
            startZoom: { ...zoom }
        };
    } else if (e.touches.length === 1 && activePiece) {
        // Start dragging piece logic
        const touch = e.touches[0];
        lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
        processMouseInteraction(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 2-finger Zoom/Pan
    if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const { startDist, startScale, startCenter, startZoom } = pinchRef.current;
        
        const currentDist = getTouchDistance(e.touches);
        const currentCenter = getTouchCenter(e.touches);

        // 1. Calculate New Scale
        let newScale = startScale * (currentDist / startDist);
        // Clamp scale
        newScale = Math.max(1, Math.min(newScale, 15));

        // 2. Calculate Pan (Translation)
        // Movement of fingers on screen
        const dx = currentCenter.x - startCenter.x;
        const dy = currentCenter.y - startCenter.y;

        // Convert screen movement to map units
        // The map is 1000x1000 logic. We need to know how many pixels is 1 map unit.
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const screenToMapRatio = 1000 / rect.width; // e.g., 2.5 map units per pixel
        
        // The shift in map center (zoom.x/y) needs to be opposite to finger movement
        // AND adjusted for scale.
        const mapShiftX = (dx * screenToMapRatio) / newScale;
        const mapShiftY = (dy * screenToMapRatio) / newScale;

        // 3. Zoom Focus Adjustment
        // When zooming, we want to zoom "towards" the midpoint of fingers.
        // Logic: The point under the fingers (StartCenter) should stay under the fingers.
        // Current implementation centers on (zoom.x, zoom.y).
        // Complex math simplified: We rely mainly on panning the center relative to the scale change.
        // For true "zoom to point", we need to adjust center based on offset from center screen.
        
        // Basic Pan Implementation (Good enough combined with scale)
        // Just update based on startZoom
        
        setZoom({
            scale: newScale,
            x: startZoom.x - mapShiftX, 
            y: startZoom.y - mapShiftY 
        });

        return;
    }

    // 1-finger Drag (Piece)
    if (e.touches.length === 1 && activePiece) {
        const touch = e.touches[0];
        processMouseInteraction(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
      // If we were pinching, clear the ref
      pinchRef.current = null;
  };

  // --- Standard Mouse Handlers ---
  const handleGlobalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    processMouseInteraction(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (activePiece) {
          processMouseInteraction(e.clientX, e.clientY);
      }
  };

  // Global drop handler
  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (zoomIntervalRef.current) clearInterval(zoomIntervalRef.current);
    // Don't reset zoom here abruptly
    
    const el = document.elementFromPoint(e.clientX, e.clientY);
    let targetCode: number | null = null;
    if (el && (el.tagName === 'path' || el.tagName === 'rect') && el.id.startsWith('pref-')) {
        targetCode = parseInt(el.id.replace('pref-', ''), 10);
    }
    if (targetCode !== null && !isNaN(targetCode)) {
        onPieceDrop(targetCode);
    }
    setHoveredRegionCode(null);
  };

  const handleContainerDragLeave = (e: React.DragEvent) => {
     if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
         setHoveredRegionCode(null);
     }
  };

  const handleClick = (code: number) => {
    if (activePiece) {
        onPieceDrop(code);
    }
  };

  const handleResetZoom = () => {
      setZoom({ scale: 1, x: 500, y: 500 });
      if (zoomIntervalRef.current) clearInterval(zoomIntervalRef.current);
  };

  const hasPaths = prefectures.some(p => !!p.path);

  return (
    <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center p-2 md:p-6 relative animate-in fade-in duration-700 touch-none"
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
      
      {/* Manual Zoom Controls (Visible on touch devices mainly, but useful for all) */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
          <button 
            onClick={handleResetZoom}
            className="bg-white/90 text-slate-600 p-3 rounded-full shadow-lg border border-slate-200 hover:bg-slate-100"
            title="全体に戻す"
          >
              <Maximize size={20} />
          </button>
      </div>

      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full max-w-full max-h-full filter drop-shadow-xl select-none touch-none aspect-square"
        preserveAspectRatio="xMidYMid meet"
        onDragOver={handleGlobalDragOver}
        onDrop={handleGlobalDrop}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseMove={handleMouseMove}
      >
        {/* Transparent background to catch events */}
        <rect x="0" y="0" width="1000" height="1000" fill="transparent" />

        <g
            className="transition-transform duration-100 ease-out will-change-transform"
            style={{
                transform: `translate(500px, 500px) scale(${zoom.scale}) translate(-${zoom.x}px, -${zoom.y}px)`,
                transformOrigin: '0 0'
            }}
        >
            {hasPaths && (
                <>
                    <rect 
                        x="110" y="110" width="140" height="100" 
                        fill="none" stroke="#cbd5e1" strokeWidth={2 / zoom.scale} rx="4" 
                        vectorEffect="non-scaling-stroke"
                    />
                    <rect 
                        id="pref-47-hitbox" 
                        x="110" y="110" width="140" height="100" 
                        fill="transparent"
                        className="cursor-pointer"
                        style={{ pointerEvents: 'all' }}
                        onClick={() => handleClick(47)}
                    />
                    <text x="180" y="100" textAnchor="middle" fill="#94a3b8" fontSize={14} fontWeight="bold" style={{fontFamily: 'Zen Maru Gothic'}}>沖縄</text>
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
            let className = "transition-colors duration-300 ease-out outline-none pointer-events-auto";

            if (isPlaced) {
                fillColor = '#86efac'; 
                strokeColor = '#166534'; 
                strokeWidth = 2;
                zIndex = 5;
            } else if (isHovered) {
                fillColor = '#bae6fd'; 
                strokeColor = '#0284c7'; 
                strokeWidth = 3; 
                zIndex = 10;
                className += " filter drop-shadow-lg"; 
            }

            // Scale stroke width inversely with zoom to keep lines sharp but not too thick
            const adjustedStrokeWidth = strokeWidth / Math.sqrt(zoom.scale);

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
                    strokeWidth={adjustedStrokeWidth}
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
                    fontSize={24 / Math.pow(zoom.scale, 0.3)} 
                    fontWeight="900"
                    fill="#064e3b"
                    stroke="white"
                    strokeWidth={6 / zoom.scale}
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

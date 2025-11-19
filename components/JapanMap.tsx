
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

// Helper: Calculate local SVG map coordinates from screen coordinates
// Handles "preserveAspectRatio=xMidYMid meet" logic
const getMapPointFromScreen = (screenX: number, screenY: number, rect: DOMRect, zoom: ZoomState) => {
  const viewRatio = rect.width / rect.height;
  const svgRatio = 1; // 1000x1000
  
  let scaleFactor = 1;
  let offsetX = 0;
  let offsetY = 0;
  
  if (viewRatio > svgRatio) {
    // Screen is wider than map (height constrained) -> horizontal letterboxing
    scaleFactor = rect.height / 1000;
    offsetX = (rect.width - 1000 * scaleFactor) / 2;
  } else {
    // Screen is taller than map (width constrained) -> vertical letterboxing
    scaleFactor = rect.width / 1000;
    offsetY = (rect.height - 1000 * scaleFactor) / 2;
  }

  // Convert Screen px -> SVG internal px (0-1000)
  const svgX = (screenX - rect.left - offsetX) / scaleFactor;
  const svgY = (screenY - rect.top - offsetY) / scaleFactor;

  // Convert SVG internal px -> Map Logical Coordinates (considering current zoom/pan)
  // Transformation logic: svgX = (mapX - zoom.x) * zoom.scale + 500
  // Solve for mapX:
  const mapX = (svgX - 500) / zoom.scale + zoom.x;
  const mapY = (svgY - 500) / zoom.scale + zoom.y;

  return { x: mapX, y: mapY };
};

// Helper: Calculate required Zoom Center (zoom.x/y) to place a specific map point at a specific screen point
const getZoomCenterForTarget = (targetMapPoint: {x: number, y: number}, screenX: number, screenY: number, rect: DOMRect, nextScale: number) => {
  const viewRatio = rect.width / rect.height;
  const svgRatio = 1;
  
  let scaleFactor = 1;
  let offsetX = 0;
  let offsetY = 0;
  
  if (viewRatio > svgRatio) {
    scaleFactor = rect.height / 1000;
    offsetX = (rect.width - 1000 * scaleFactor) / 2;
  } else {
    scaleFactor = rect.width / 1000;
    offsetY = (rect.height - 1000 * scaleFactor) / 2;
  }

  const svgX = (screenX - rect.left - offsetX) / scaleFactor;
  const svgY = (screenY - rect.top - offsetY) / scaleFactor;
  
  // We want: svgX = (targetMapPoint.x - newZoomX) * nextScale + 500
  // Solve for newZoomX:
  // (targetMapPoint.x - newZoomX) = (svgX - 500) / nextScale
  // newZoomX = targetMapPoint.x - (svgX - 500) / nextScale
  
  const newZoomX = targetMapPoint.x - (svgX - 500) / nextScale;
  const newZoomY = targetMapPoint.y - (svgY - 500) / nextScale;
  
  return { x: newZoomX, y: newZoomY };
};

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
    startMapPoint: { x: number, y: number }; // The map coordinate under the pinch center
  } | null>(null);

  // Reset zoom triggers when piece changes
  useEffect(() => {
    if (!activePiece) {
      if (zoomIntervalRef.current) clearInterval(zoomIntervalRef.current);
      zoomTriggerPosRef.current = null;
      lastMousePosRef.current = { x: 0, y: 0 };
    } else {
        lastMousePosRef.current = { x: 0, y: 0 };
        zoomTriggerPosRef.current = null;
    }
  }, [activePiece]); 

  // Sort prefectures to ensure placed/hovered items are rendered on top
  const sortedPrefectures = useMemo(() => {
    return [...prefectures].sort((a, b) => {
      const aPlaced = placedPieces.some(p => p.prefectureCode === a.code);
      const bPlaced = placedPieces.some(p => p.prefectureCode === b.code);
      const aHover = hoveredRegionCode === a.code;
      const bHover = hoveredRegionCode === b.code;

      if (aHover && !bHover) return 1;
      if (!aHover && bHover) return -1;
      if (aPlaced && !bPlaced) return 1;
      if (!aPlaced && bPlaced) return -1;
      return 0;
    });
  }, [prefectures, placedPieces, hoveredRegionCode]);

  // --- Mouse Interaction Logic (Desktop Auto-Zoom) ---
  const processMouseInteraction = useCallback((currentX: number, currentY: number) => {
    if (pinchRef.current) return;

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

    // Mouse Auto-Zoom logic
    const dx = currentX - lastMousePosRef.current.x;
    const dy = currentY - lastMousePosRef.current.y;
    const dist = Math.hypot(dx, dy);
    lastMousePosRef.current = { x: currentX, y: currentY };

    // Auto zoom-out
    if (zoom.scale > 1 && zoomTriggerPosRef.current) {
        const distFromAnchor = Math.hypot(
            currentX - zoomTriggerPosRef.current.x,
            currentY - zoomTriggerPosRef.current.y
        );
        if (distFromAnchor > 150) {
            const currentIdx = ZOOM_LEVELS.indexOf(zoom.scale); 
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

    // Auto zoom-in cancellation on movement
    if (dist > 20) { 
        if (zoomIntervalRef.current) {
          clearInterval(zoomIntervalRef.current);
          zoomIntervalRef.current = null;
        }
        return; 
    }

    // Trigger auto-zoom interval
    if (!zoomIntervalRef.current && activePiece && foundCode && zoom.scale < 12) {
      zoomIntervalRef.current = setInterval(() => {
        const { x: lx, y: ly } = lastMousePosRef.current;
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

        setZoom(prevZoom => {
            let nextScale = ZOOM_LEVELS.find(z => z > prevZoom.scale);
            if (!nextScale) {
                 if (prevZoom.scale < 12) nextScale = 12;
                 else return prevZoom;
            }

            // Smart zoom center logic for mouse
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return prevZoom;
            
            // Zoom towards mouse cursor
            const currentMapPoint = getMapPointFromScreen(lx, ly, rect, prevZoom);
            const newCenter = getZoomCenterForTarget(currentMapPoint, lx, ly, rect, nextScale);
            
            zoomTriggerPosRef.current = { x: lx, y: ly };
            return { scale: nextScale, x: newCenter.x, y: newCenter.y };
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
        e.preventDefault(); 
        
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const dist = getTouchDistance(e.touches);
        const center = getTouchCenter(e.touches);
        
        if (zoomIntervalRef.current) {
            clearInterval(zoomIntervalRef.current);
            zoomIntervalRef.current = null;
        }

        // Calculate where on the map we are pinching
        const startMapPoint = getMapPointFromScreen(center.x, center.y, rect, zoom);

        pinchRef.current = {
            startDist: dist,
            startScale: zoom.scale,
            startMapPoint
        };
    } else if (e.touches.length === 1 && activePiece) {
        const touch = e.touches[0];
        lastMousePosRef.current = { x: touch.clientX, y: touch.clientY };
        processMouseInteraction(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const { startDist, startScale, startMapPoint } = pinchRef.current;
        
        const currentDist = getTouchDistance(e.touches);
        const currentCenter = getTouchCenter(e.touches);

        // 1. Calculate New Scale
        let newScale = startScale * (currentDist / startDist);
        newScale = Math.max(1, Math.min(newScale, 15));

        // 2. Calculate New Zoom Center
        // We want the startMapPoint to stay at currentCenter on screen
        const newZoomCenter = getZoomCenterForTarget(startMapPoint, currentCenter.x, currentCenter.y, rect, newScale);

        setZoom({
            scale: newScale,
            x: newZoomCenter.x, 
            y: newZoomCenter.y
        });

        return;
    }

    if (e.touches.length === 1 && activePiece) {
        const touch = e.touches[0];
        processMouseInteraction(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
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

  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (zoomIntervalRef.current) clearInterval(zoomIntervalRef.current);
    
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
        <rect x="0" y="0" width="1000" height="1000" fill="transparent" />

        <g
            className="will-change-transform"
            style={{
                transform: `translate(500px, 500px) scale(${zoom.scale}) translate(-${zoom.x}px, -${zoom.y}px)`,
                transformOrigin: '0 0',
                // Disable transition during pinch to keep it responsive
                transition: pinchRef.current ? 'none' : 'transform 0.1s ease-out'
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

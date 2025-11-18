
import React from 'react';
import { PuzzlePiece, GameMode } from '../types';

interface PieceProps {
  piece: PuzzlePiece;
  onDragStart: (piece: PuzzlePiece) => void;
  onDragEnd: () => void;
  selected: boolean;
  onSelect: (piece: PuzzlePiece) => void;
  mode: GameMode;
}

const Piece: React.FC<PieceProps> = ({ piece, onDragStart, onDragEnd, selected, onSelect, mode }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', piece.id.toString());
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(piece);
    onSelect(piece);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    onDragEnd();
  };

  const baseClasses = `
    relative w-full h-full p-2 rounded-2xl border-4 cursor-grab active:cursor-grabbing 
    transition-all duration-200 flex flex-col items-center justify-center text-center
    hover:-translate-y-1 select-none
  `;

  const colorClasses = selected 
    ? 'bg-indigo-100 border-indigo-400 text-indigo-900 shadow-lg scale-105' 
    : 'bg-white border-orange-100 text-slate-700 hover:border-orange-300 shadow-sm';

  // Special rendering for Shape Mode
  if (mode === GameMode.SHAPE && piece.path && piece.bbox) {
    let viewBox = "0 0 100 100";
    
    if (piece.bbox) {
      const w = piece.bbox.width;
      const h = piece.bbox.height;
      const x = piece.bbox.x;
      const y = piece.bbox.y;
      const maxDim = Math.max(w, h);
      
      // Add some padding
      const cx = x + w / 2;
      const cy = y + h / 2;
      const size = maxDim * 1.2; 
      
      viewBox = `${cx - size/2} ${cy - size/2} ${size} ${size}`;
    }

    return (
      <div
        draggable={!piece.isPlaced}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => onSelect(piece)}
        className={`${baseClasses} ${colorClasses}`}
      >
         <div className="w-full flex-1 flex items-center justify-center p-2">
             <svg viewBox={viewBox} className="w-full h-full pointer-events-none drop-shadow-sm">
                <path 
                    d={piece.path} 
                    fill={selected ? '#818cf8' : '#cbd5e1'} 
                    stroke={selected ? '#4f46e5' : '#94a3b8'}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke" 
                />
             </svg>
         </div>
         <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full mb-1">
             #{piece.prefectureCode}
         </span>
      </div>
    );
  }

  return (
    <div
      draggable={!piece.isPlaced}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(piece)}
      className={`${baseClasses} ${colorClasses}`}
    >
      <span className="font-black text-lg leading-snug break-words w-full line-clamp-3">
        {piece.content}
      </span>
      <span className="mt-2 text-[10px] text-slate-300 font-bold absolute bottom-2">
          No.{piece.prefectureCode}
      </span>
    </div>
  );
};

export default Piece;

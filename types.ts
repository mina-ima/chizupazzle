
export interface Prefecture {
  code: number;
  name: string; // Kanji name e.g., "北海道"
  romaji: string; // e.g., "Hokkaido"
  // Path and geometry are now loaded dynamically
  path?: string; 
  centerX?: number; 
  centerY?: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export enum GameMode {
  NAME = 'NAME',
  SHAPE = 'SHAPE',
  CAPITAL = 'CAPITAL',
  GOURMET = 'GOURMET',     // Static
  LANDMARK = 'LANDMARK',   // Static
  MASCOT = 'MASCOT',       // Static
  RANKING = 'RANKING',     // Static (No.1 Production/Industry)
  CRAFT = 'CRAFT',         // Static (Traditional Crafts)
  POPULATION = 'POPULATION', // New Static
  AREA = 'AREA',           // New Static
  SOUVENIR = 'SOUVENIR',   // AI
  CUSTOM = 'CUSTOM'        // AI
}

export interface PuzzlePiece {
  id: number;
  prefectureCode: number;
  content: string; // Text to display (Name, Food, etc.) or "SHAPE"
  isPlaced: boolean;
  // Geometry data attached to the piece for rendering
  path?: string;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  imageUrl?: string; // URL for background image (Mascot, Landmark, etc.)
}

export interface GameState {
  mode: GameMode;
  pieces: PuzzlePiece[];
  placedCount: number;
  isLoading: boolean;
  isComplete: boolean;
  startTime: number | null;
  endTime: number | null;
  customTopic?: string;
}

export interface GeminiContentResponse {
  items: {
    prefectureName: string;
    content: string;
  }[];
}

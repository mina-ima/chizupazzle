import React, { useState, useMemo, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Brain, Map as MapIcon, Sparkles, RefreshCw, Info, Home, Trophy, ArrowDown, Key, AlertCircle } from 'lucide-react';
import { GameMode, GameState, PuzzlePiece, Prefecture } from './types';
import { PREFECTURES, CAPITALS, GOURMET_DATA, LANDMARK_DATA, MASCOT_DATA, RANKING_DATA, CRAFT_DATA, POPULATION_DATA, AREA_DATA } from './constants';
import { generateGameContent, getHint } from './services/geminiService';
import { fetchAndProcessMapData } from './utils/geoUtils';
import JapanMap from './components/JapanMap';
import Piece from './components/Piece';
import HomeScreen from './components/HomeScreen';

// Add global declaration for AI Studio environment
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [showHome, setShowHome] = useState(true);
  const [prefecturesData, setPrefecturesData] = useState<Prefecture[]>(PREFECTURES);
  const [isMapDataLoading, setIsMapDataLoading] = useState(true);
  const [mapLoadError, setMapLoadError] = useState(false);
  
  const [gameState, setGameState] = useState<GameState>({
    mode: GameMode.NAME,
    pieces: [],
    placedCount: 0,
    isLoading: false,
    isComplete: false,
    startTime: null,
    endTime: null,
    customTopic: ''
  });

  const [activePiece, setActivePiece] = useState<PuzzlePiece | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<{name: string, sub: string} | null>(null);
  const [apiKeyError, setApiKeyError] = useState(false);

  // Load Map Data
  const loadMapData = useCallback(async () => {
    setIsMapDataLoading(true);
    setMapLoadError(false);
    try {
      const data = await fetchAndProcessMapData();
      // Check if paths were actually populated
      const hasPaths = data.some(p => !!p.path);
      if (hasPaths) {
        setPrefecturesData(data);
      } else {
        setMapLoadError(true);
      }
    } catch (e) {
      console.error(e);
      setMapLoadError(true);
    } finally {
      setIsMapDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  // Initialize Game Pieces based on mode
  const initializeGame = useCallback(async (mode: GameMode, topic?: string) => {
    // Map data check
    if (isMapDataLoading) {
        setMessage("地図データを準備中です...");
        setTimeout(() => setMessage(null), 2000);
        return;
    }

    // Reset states
    setApiKeyError(false);
    setMessage(null);
    setHint(null);
    setActivePiece(null);
    setLastCorrect(null);
    setShowHome(false);
    
    // Proactively check for API key if using AI modes and we are in AI Studio
    if ([GameMode.SOUVENIR, GameMode.CUSTOM].includes(mode)) {
        if (window.aistudio) {
            try {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await window.aistudio.openSelectKey();
                }
            } catch (e) {
                console.error("Failed to check/open API key selector", e);
            }
        }
    }

    setGameState(prev => ({ 
        ...prev, 
        isLoading: true, 
        isComplete: false, 
        placedCount: 0, 
        pieces: [], 
        startTime: Date.now(), 
        endTime: null, 
        mode, 
        customTopic: topic 
    }));

    let newPieces: PuzzlePiece[] = [];

    try {
      // Static Data Modes
      let staticData: Record<number, string> | null = null;
      
      if (mode === GameMode.CAPITAL) staticData = CAPITALS;
      else if (mode === GameMode.GOURMET) staticData = GOURMET_DATA;
      else if (mode === GameMode.LANDMARK) staticData = LANDMARK_DATA;
      else if (mode === GameMode.MASCOT) staticData = MASCOT_DATA;
      else if (mode === GameMode.RANKING) staticData = RANKING_DATA;
      else if (mode === GameMode.CRAFT) staticData = CRAFT_DATA;
      else if (mode === GameMode.POPULATION) staticData = POPULATION_DATA;
      else if (mode === GameMode.AREA) staticData = AREA_DATA;

      if (staticData) {
         newPieces = prefecturesData.map(p => ({ 
            id: p.code, 
            prefectureCode: p.code, 
            content: staticData![p.code], 
            isPlaced: false,
            path: p.path,
            bbox: p.bbox
        }));
      }
      else if (mode === GameMode.NAME) {
        newPieces = prefecturesData.map(p => ({ 
            id: p.code, 
            prefectureCode: p.code, 
            content: p.name, 
            isPlaced: false,
            path: p.path, // Attach geometry
            bbox: p.bbox
        }));
      } else if (mode === GameMode.SHAPE) {
        newPieces = prefecturesData.map(p => ({ 
            id: p.code, 
            prefectureCode: p.code, 
            content: 'SHAPE', 
            isPlaced: false,
            path: p.path,
            bbox: p.bbox
        }));
      } else if ([GameMode.SOUVENIR, GameMode.CUSTOM].includes(mode)) {
        // AI Generated Modes
        const data = await generateGameContent(mode, topic);
        if (data) {
            newPieces = data.map(item => {
                const pref = prefecturesData.find(p => p.code === item.prefectureCode);
                return { 
                    id: item.prefectureCode, 
                    prefectureCode: item.prefectureCode, 
                    content: item.content, 
                    isPlaced: false,
                    path: pref?.path,
                    bbox: pref?.bbox
                };
            });
        } else {
            throw new Error("Failed to generate content");
        }
      }

      // Shuffle pieces
      newPieces.sort(() => Math.random() - 0.5);

      setGameState(prev => ({
        ...prev,
        pieces: newPieces,
        isLoading: false
      }));
    } catch (error: any) {
      console.error("Init error", error);
      setGameState(prev => ({ ...prev, isLoading: false }));
      
      const isApiKeyError = error?.message?.includes("API Key") || error?.message?.includes("API_KEY");
      
      if (isApiKeyError) {
          setApiKeyError(true);
      } else {
          setMessage("えらーがおきました。もういちどためしてね。");
          setTimeout(() => setShowHome(true), 4000);
      }
    }
  }, [prefecturesData, isMapDataLoading]);

  const handleReturnHome = () => {
    setShowHome(true);
    setGameState(prev => ({ ...prev, isComplete: false, placedCount: 0, pieces: [] }));
    setApiKeyError(false);
  };

  const handlePieceDrop = (regionCode: number) => {
    if (!activePiece) return;

    if (activePiece.prefectureCode === regionCode) {
      // Success
      const updatedPieces = gameState.pieces.map(p => 
        p.id === activePiece.id ? { ...p, isPlaced: true } : p
      );
      
      const newCount = gameState.placedCount + 1;
      const isComplete = newCount === 47;
      
      // Show celebration popup
      const pref = prefecturesData.find(p => p.code === regionCode);
      if (pref) {
        setLastCorrect({ name: pref.name, sub: activePiece.content });
        // Hide after 2 seconds
        setTimeout(() => setLastCorrect(null), 2000);
      }

      setGameState(prev => ({
        ...prev,
        pieces: updatedPieces,
        placedCount: newCount,
        isComplete,
        endTime: isComplete ? Date.now() : null
      }));

      setActivePiece(null);
      setHint(null);
      
      // Sound or visual feedback could go here
      if (isComplete) {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#F472B6', '#60A5FA', '#FBBF24', '#34D399'] 
        });
      }
    } else {
      // Failure
      setMessage("ちがうかも？ もういっかい！");
      setTimeout(() => setMessage(null), 1500);
      // Do NOT reset activePiece here, let user retry or dragEnd handle it
    }
  };

  const handleDragEnd = () => {
    // Ensure drag state is cleared when operation ends (even if dropped in ocean/inventory)
    setActivePiece(null);
  };

  const handleGetHint = async () => {
    if (!activePiece) {
        setMessage("ピースをえらんでね！");
        setTimeout(() => setMessage(null), 2000);
        return;
    }
    
    // Proactively check key for hints too if in AI Studio
    if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await window.aistudio.openSelectKey();
            // Don't return, try to proceed, if it fails catch block will handle
        }
    }

    setIsHintLoading(true);
    const pref = prefecturesData.find(p => p.code === activePiece.prefectureCode);
    if (pref) {
        try {
            const hintText = await getHint(pref.name, gameState.mode, activePiece.content);
            setHint(hintText);
        } catch (e: any) {
             const isApiKeyError = e?.message?.includes("API Key") || e?.message?.includes("API_KEY");
             if (isApiKeyError) {
                 setApiKeyError(true);
             } else {
                 setHint("ヒントがだせませんでした。");
             }
        }
    }
    setIsHintLoading(false);
  };

  const handleResolveApiKey = async () => {
      if (window.aistudio) {
          try {
            await window.aistudio.openSelectKey();
            // Retry the game initialization after key selection
            initializeGame(gameState.mode, gameState.customTopic);
          } catch (e) {
            console.error("API key selection cancelled or failed", e);
          }
      }
  };

  const unplacedPieces = useMemo(() => gameState.pieces.filter(p => !p.isPlaced), [gameState.pieces]);
  const placedPieces = useMemo(() => gameState.pieces.filter(p => p.isPlaced), [gameState.pieces]);

  // Always render home screen if showHome is true (even if map is loading)
  if (showHome) {
    return <HomeScreen onStartGame={initializeGame} isMapLoading={isMapDataLoading} />;
  }

  // Only show full loading screen if we are IN GAME mode and map is missing
  if (isMapDataLoading) {
     return (
         <div className="h-[100dvh] flex flex-col items-center justify-center bg-orange-50 relative">
             <button 
                onClick={() => setShowHome(true)}
                className="absolute top-4 left-4 p-2 rounded-full bg-white/90 backdrop-blur text-slate-500 shadow-lg hover:bg-slate-100 transition-all z-50 border-2 border-white"
                title="ホームにもどる"
             >
                <Home size={24} />
            </button>
             <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
             <p className="text-slate-600 font-bold animate-pulse">地図データを準備中...</p>
         </div>
     )
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-orange-50 overflow-hidden font-sans relative">
      
      {/* API Key Error Modal */}
      {apiKeyError && (
          <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-rose-200">
                  <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">APIキーが必要です</h3>
                  
                  {window.aistudio ? (
                      <>
                        <p className="text-slate-600 mb-6 text-sm font-bold">
                            AIを使って問題を作るには、APIキーの設定が必要です。
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleResolveApiKey}
                                className="w-full py-3 bg-indigo-500 text-white rounded-xl font-black hover:bg-indigo-600 transition-colors shadow-lg flex items-center justify-center gap-2"
                            >
                                <Key size={18} />
                                キーを設定してリトライ
                            </button>
                            <button 
                                onClick={handleReturnHome}
                                className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                            >
                                ホームにもどる
                            </button>
                        </div>
                      </>
                  ) : (
                      <>
                        <div className="bg-slate-50 p-4 rounded-xl text-left mb-6 border border-slate-200">
                            <p className="text-slate-600 text-sm font-bold mb-2">
                                環境変数の設定を確認してください
                            </p>
                            <p className="text-xs text-slate-500 leading-relaxed mb-2">
                                Vercelの設定画面(Settings &gt; Environment Variables)で、以下のキーを追加してください。
                            </p>
                            
                            <div className="flex flex-col gap-1 mb-2">
                                <div className="text-[10px] text-slate-400 font-bold">Viteの場合 (推奨):</div>
                                <code className="block bg-slate-200 text-slate-700 text-xs p-2 rounded font-mono select-all">
                                    VITE_API_KEY
                                </code>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="text-[10px] text-slate-400 font-bold">Next.jsの場合:</div>
                                <code className="block bg-slate-200 text-slate-700 text-xs p-2 rounded font-mono select-all">
                                    NEXT_PUBLIC_API_KEY
                                </code>
                            </div>

                            <p className="text-[10px] text-slate-400 mt-3 font-bold">
                                <span className="text-rose-500">重要:</span> 設定を追加・保存した後に、必ずVercel上で<span className="underline">Redeploy（再デプロイ）</span>を行ってください。
                            </p>
                        </div>
                        <button 
                            onClick={handleReturnHome}
                            className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                            ホームにもどる
                        </button>
                      </>
                  )}

                  <div className="mt-4 text-[10px] text-slate-400">
                      <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-500">
                          料金について (Google AI Studio)
                      </a>
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b-4 border-orange-200 z-30 shadow-sm flex-none h-16">
        <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button 
                    onClick={handleReturnHome}
                    className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                    title="ホームにもどる"
                >
                    <Home size={20} />
                </button>
                <div className="hidden md:flex items-center gap-2">
                    <div className="bg-red-500 text-white px-2 py-1 rounded-lg font-bold text-sm shadow-sm transform -rotate-3">JP</div>
                    <h1 className="text-lg font-black text-slate-700 tracking-tight">地図パズル</h1>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border-2 border-indigo-100">
                     <span className="text-xs font-bold text-indigo-400">あつめた数</span>
                     <span className="text-lg font-black text-indigo-600 leading-none">
                        {gameState.placedCount} <span className="text-xs text-indigo-300">/ 47</span>
                     </span>
                </div>

                <div className="hidden md:flex gap-2">
                    {[
                        { m: GameMode.NAME, icon: <MapIcon size={14}/>, label: "なまえ" },
                        { m: GameMode.SHAPE, icon: <Brain size={14}/>, label: "かたち" },
                    ].map((opt) => (
                        <button
                            key={opt.m}
                            onClick={() => initializeGame(opt.m)}
                            className={`p-2 rounded-full ${gameState.mode === opt.m ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                            title={opt.label}
                        >
                            {opt.icon}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </header>

      {/* Main Map Area - Takes remaining height minus inventory */}
      <main className="flex-1 relative w-full overflow-hidden bg-sky-50/30 flex items-center justify-center p-2">
            
            {/* Correct Answer Overlay */}
            {lastCorrect && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-in zoom-in fade-in duration-300 pointer-events-none">
                     <div className="bg-white/95 backdrop-blur border-8 border-yellow-300 rounded-full p-8 shadow-[0_10px_40px_rgba(0,0,0,0.2)] text-center min-w-[280px]">
                        <div className="text-yellow-400 font-black text-xl mb-1 animate-bounce">せいかい！</div>
                        <div className="text-4xl md:text-6xl font-black text-slate-800 tracking-widest mb-2">{lastCorrect.name}</div>
                        {lastCorrect.sub && lastCorrect.sub !== 'SHAPE' && lastCorrect.sub !== lastCorrect.name && (
                            <div className="text-slate-500 font-bold text-lg bg-slate-100 inline-block px-3 py-1 rounded-lg max-w-[300px] truncate">{lastCorrect.sub}</div>
                        )}
                     </div>
                </div>
            )}

            {/* Desktop/Mobile Hint/Status overlay (Floating) */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none max-w-[60%] md:max-w-xs">
                 {activePiece && (
                    <div className="pointer-events-auto bg-white/90 backdrop-blur p-3 rounded-2xl shadow-lg border-2 border-white animate-in slide-in-from-left-2">
                        <div className="text-xs font-bold text-slate-400 mb-1">いまもってるピース</div>
                        <div className="font-bold text-lg text-slate-800 text-center whitespace-pre-line leading-tight">
                            {gameState.mode === GameMode.SHAPE ? "このかたち" : activePiece.content}
                        </div>
                        
                        <div className="mt-2 mb-2 text-xs font-bold text-center text-indigo-500 bg-indigo-50 py-1 rounded border border-indigo-100 animate-pulse">
                            地図をタップして配置！
                        </div>

                         <button 
                            onClick={handleGetHint}
                            disabled={isHintLoading}
                            className="mt-2 w-full text-xs font-bold flex items-center justify-center gap-1 bg-amber-400 text-white py-1.5 rounded-lg hover:bg-amber-500 transition-colors shadow-sm"
                        >
                            {isHintLoading ? <RefreshCw className="animate-spin w-3 h-3"/> : <Sparkles className="w-3 h-3"/>}
                            ヒント
                        </button>
                    </div>
                 )}
            </div>

             {/* Hint Bubble */}
             {hint && (
                 <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-40 max-w-[200px] md:max-w-xs bg-white border-4 border-amber-300 text-slate-700 p-4 rounded-2xl shadow-xl text-sm animate-in zoom-in duration-300">
                    <p className="font-black mb-1 flex items-center gap-1 text-amber-500"><Info size={16}/> ヒント</p>
                    {hint}
                    <button onClick={() => setHint(null)} className="absolute -top-3 -right-3 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 shadow-sm text-slate-400 border-2 border-white">✕</button>
                 </div>
            )}

            {/* Error Message (General) */}
            {message && !apiKeyError && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-50 w-full flex justify-center px-4">
                    <div className="bg-rose-500 text-white px-6 py-3 rounded-full shadow-xl font-black text-lg animate-bounce border-4 border-white flex items-center gap-4 max-w-full flex-wrap justify-center">
                        <span>{message}</span>
                    </div>
                </div>
            )}

            {gameState.isLoading ? (
                <div className="flex flex-col items-center gap-4 text-slate-500">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="font-bold">じゅんび中...</p>
                </div>
            ) : (
                <JapanMap 
                    prefectures={prefecturesData}
                    activePiece={activePiece}
                    placedPieces={placedPieces}
                    onPieceDrop={handlePieceDrop}
                    mode={gameState.mode}
                    hoveredRegionCode={hoveredRegion}
                    setHoveredRegionCode={setHoveredRegion}
                    onRetry={loadMapData}
                />
            )}

             {/* Completion Overlay */}
             {gameState.isComplete && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl text-center max-w-md w-full mx-auto animate-in zoom-in duration-300 border-8 border-yellow-300 relative overflow-hidden">
                        <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4 drop-shadow-md" />
                        <h2 className="text-3xl font-black text-slate-800 mb-2">かんせい！</h2>
                        <p className="text-slate-600 mb-6 font-bold">
                            すごい！ 47都道府県すべてせいかいしたよ！
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button 
                                onClick={() => handleReturnHome()}
                                className="flex-1 bg-slate-100 text-slate-600 px-4 py-3 rounded-xl font-black hover:bg-slate-200"
                            >
                                メニュー
                            </button>
                            <button 
                                onClick={() => initializeGame(gameState.mode, gameState.customTopic)}
                                className="flex-1 bg-indigo-500 text-white px-4 py-3 rounded-xl font-black hover:bg-indigo-600 shadow-lg"
                            >
                                もういちど
                            </button>
                        </div>
                    </div>
                </div>
            )}
      </main>

      {/* Bottom Inventory Area - Reduced height */}
      <div className="flex-none bg-white border-t-4 border-orange-200 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex flex-col h-[20vh] min-h-[140px] max-h-[220px]">
        <div className="flex justify-between items-center px-4 py-2 bg-orange-50/80 border-b border-orange-100">
             <div className="flex items-center gap-2 text-sm font-black text-slate-600">
                <ArrowDown size={16} className="text-orange-400 animate-bounce" />
                <span>のこりのピース</span>
                <span className="bg-orange-200 text-orange-800 text-xs px-2 py-0.5 rounded-full">{unplacedPieces.length}</span>
             </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-hidden p-2 bg-orange-50/30 custom-scrollbar">
             {unplacedPieces.length === 0 && !gameState.isLoading && (
                 <div className="h-full flex items-center justify-center text-slate-400 gap-2 font-bold">
                    <Sparkles className="text-yellow-400"/> ぜんぶできたね！
                 </div>
             )}
             <div className="flex gap-2 h-full items-center px-2">
                {unplacedPieces.map((piece) => (
                    <div key={piece.id} className="w-28 md:w-36 flex-shrink-0 h-full pb-1">
                         <Piece
                            piece={piece}
                            onDragStart={setActivePiece}
                            onDragEnd={handleDragEnd}
                            selected={activePiece?.id === piece.id}
                            onSelect={setActivePiece}
                            mode={gameState.mode}
                        />
                    </div>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
};

export default App;
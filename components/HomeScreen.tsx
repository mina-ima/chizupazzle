
import React, { useState } from 'react';
// Simplified imports to prevent potential loading issues with less common icons
import { Brain, Map as MapIcon, Utensils, Gift, Search, Sparkles, Play, Star, Camera, Smile, Factory, Paintbrush, Users, Scaling } from 'lucide-react';
import { GameMode } from '../types';

interface HomeScreenProps {
  onStartGame: (mode: GameMode, customTopic?: string) => void;
  isMapLoading?: boolean;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame, isMapLoading = false }) => {
  const [customInput, setCustomInput] = useState("");

  const handleStart = (mode: GameMode, customTopic?: string) => {
    if (isMapLoading) {
        return;
    }
    onStartGame(mode, customTopic);
  };

  const modes = [
    { 
      id: GameMode.NAME, 
      title: "なまえ", 
      desc: "県の名前をあてよう！", 
      icon: <MapIcon className="w-10 h-10 text-white" />, 
      bg: "bg-blue-400",
      border: "border-blue-500",
      shadow: "shadow-blue-200"
    },
    { 
      id: GameMode.SHAPE, 
      title: "かたち", 
      desc: "シルエットでわかるかな？", 
      icon: <Brain className="w-10 h-10 text-white" />, 
      bg: "bg-indigo-400",
      border: "border-indigo-500",
      shadow: "shadow-indigo-200"
    },
    { 
      id: GameMode.RANKING, 
      title: "日本一・産業", 
      desc: "なにが有名かな？", 
      icon: <Factory className="w-10 h-10 text-white" />, 
      bg: "bg-amber-500",
      border: "border-amber-600",
      shadow: "shadow-amber-200"
    },
    { 
      id: GameMode.CRAFT, 
      title: "伝統工芸", 
      desc: "歴史あるものづくり", 
      icon: <Paintbrush className="w-10 h-10 text-white" />, 
      bg: "bg-rose-600",
      border: "border-rose-700",
      shadow: "shadow-rose-200"
    },
    { 
      id: GameMode.POPULATION, 
      title: "人口ランキング", 
      desc: "人が多いのはどこ？", 
      icon: <Users className="w-10 h-10 text-white" />, 
      bg: "bg-violet-500",
      border: "border-violet-600",
      shadow: "shadow-violet-200"
    },
    { 
      id: GameMode.AREA, 
      title: "面積ランキング", 
      desc: "ひろいのはどこ？", 
      // Use simpler Scaling icon
      icon: <Scaling className="w-10 h-10 text-white" />, 
      bg: "bg-cyan-500",
      border: "border-cyan-600",
      shadow: "shadow-cyan-200"
    },
    { 
      id: GameMode.CAPITAL, 
      title: "県庁所在地", 
      desc: "有名な都市をおぼえよう！", 
      icon: <Search className="w-10 h-10 text-white" />, 
      bg: "bg-emerald-400",
      border: "border-emerald-500",
      shadow: "shadow-emerald-200"
    },
    { 
      id: GameMode.GOURMET, 
      title: "おいしいもの", 
      desc: "ごとうちグルメだ！", 
      icon: <Utensils className="w-10 h-10 text-white" />, 
      bg: "bg-orange-400",
      border: "border-orange-500",
      shadow: "shadow-orange-200"
    },
    { 
      id: GameMode.LANDMARK, 
      title: "めいしょ", 
      desc: "有名な場所はどこ？", 
      icon: <Camera className="w-10 h-10 text-white" />, 
      bg: "bg-teal-400",
      border: "border-teal-500",
      shadow: "shadow-teal-200"
    },
    { 
      id: GameMode.MASCOT, 
      title: "ゆるキャラ", 
      desc: "かわいいキャラたち！", 
      icon: <Smile className="w-10 h-10 text-white" />, 
      bg: "bg-lime-400",
      border: "border-lime-500",
      shadow: "shadow-lime-200"
    },
    { 
      id: GameMode.SOUVENIR, 
      title: "おみやげ (AI)", 
      desc: "AIがもんだいをつくるよ！", 
      icon: <Gift className="w-10 h-10 text-white" />, 
      bg: "bg-pink-400",
      border: "border-pink-500",
      shadow: "shadow-pink-200"
    },
  ];

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden overflow-y-auto">
      
      {/* Background decorations */}
      <div className="absolute top-10 left-10 text-yellow-200 transform -rotate-12"><Star size={100} fill="currentColor" /></div>
      <div className="absolute bottom-10 right-10 text-pink-200 transform rotate-12"><Star size={80} fill="currentColor" /></div>
      <div className="absolute top-1/2 right-5 text-blue-100 transform rotate-45"><Star size={60} fill="currentColor" /></div>

      <div className="max-w-5xl w-full space-y-8 z-10 py-10">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center px-6 py-2 bg-red-500 text-white rounded-full shadow-lg mb-2 border-4 border-white transform -rotate-3">
            <span className="text-xl font-bold tracking-widest">にほん</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tight drop-shadow-sm">
            地図パズル <span className="text-indigo-500 inline-block transform hover:scale-110 transition-transform">AI</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-xl mx-auto font-bold">
            なまえ、かたち、おいしいもの。<br/>
            いろいろなモードであそんでみよう！
          </p>
          {isMapLoading && (
              <div className="flex items-center justify-center gap-2 text-amber-600 font-bold animate-pulse">
                  <span className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
                  地図データを準備中...（もう少し待ってね）
              </div>
          )}
        </div>

        {/* Mode Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleStart(mode.id)}
              disabled={isMapLoading}
              className={`
                relative group p-6 rounded-3xl border-b-8 transition-all duration-200 active:border-b-0 active:translate-y-2
                flex flex-col items-center text-center gap-3 
                ${mode.bg} ${mode.border}
                ${isMapLoading ? 'opacity-60 cursor-not-allowed grayscale' : 'hover:brightness-105'}
              `}
            >
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm group-hover:scale-110 transition-transform">
                {mode.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white drop-shadow-md">{mode.title}</h3>
                <p className="text-white/90 font-bold text-sm">{mode.desc}</p>
              </div>
            </button>
          ))}

          {/* Custom Card */}
          <div className={`relative p-6 rounded-3xl border-b-8 border-purple-500 bg-purple-400 flex flex-col items-center text-center gap-3 ${isMapLoading ? 'opacity-60 grayscale' : ''}`}>
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-black text-white drop-shadow-md">すきなテーマ (AI)</h3>
            <p className="text-white/90 font-bold text-sm mb-1">AIがもんだいをつくるよ！</p>
            
            <div className="w-full flex gap-2 mt-auto bg-white p-2 rounded-2xl shadow-inner">
              <input 
                type="text" 
                placeholder="例: アニメ、歴史" 
                className="flex-1 px-2 py-1 text-slate-700 font-bold bg-transparent focus:outline-none placeholder:text-slate-300 text-center"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && customInput.trim() && handleStart(GameMode.CUSTOM, customInput)}
                disabled={isMapLoading}
              />
              <button 
                onClick={() => customInput.trim() && handleStart(GameMode.CUSTOM, customInput)}
                disabled={!customInput.trim() || isMapLoading}
                className="bg-purple-500 text-white p-2 rounded-xl hover:bg-purple-600 disabled:opacity-50 transition-colors"
              >
                <Play className="w-5 h-5 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;

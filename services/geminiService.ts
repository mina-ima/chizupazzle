import { GoogleGenAI, Type } from "@google/genai";
import { PREFECTURES } from '../constants';
import { GameMode } from '../types';

const getClient = () => {
  // Support various environment variable prefixes for Vercel/Vite/CRA/Next.js
  // This ensures the key is accessible in client-side builds
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || 
                 process.env.VITE_API_KEY || 
                 process.env.REACT_APP_API_KEY || 
                 process.env.API_KEY;

  if (!apiKey) {
    console.error("API_KEY is missing");
    throw new Error("API Key is required");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateGameContent = async (mode: GameMode, customTopic?: string) => {
  const ai = getClient();
  
  let promptTopic = "";
  switch (mode) {
    case GameMode.SOUVENIR:
      promptTopic = "有名なお土産や特産品（子供にもわかるような短い名前、例: 白い恋人）";
      break;
    case GameMode.CUSTOM:
      promptTopic = customTopic || "有名な観光地";
      break;
    default:
      return null;
  }

  // 小学生向けに日本語で出力するように指示
  const prompt = `
    日本の47都道府県すべてについて、それぞれの都道府県で最も「${promptTopic}」を1つずつ選んでリストにしてください。
    他の都道府県と被らないユニークなものを選んでください。
    出力はJSON形式で、'items'という配列を含めてください。
    各アイテムには以下のフィールドを持たせてください：
    - prefectureName: 都道府県名（漢字、例: "北海道"）
    - content: その都道府県の答え（日本語、小学生でも読めるもの）

    例: { "items": [{ "prefectureName": "北海道", "content": "夕張メロン" }, ...] }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  prefectureName: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ["prefectureName", "content"]
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return mapAiResponseToIds(data.items);
    }
    return null;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

const mapAiResponseToIds = (items: { prefectureName: string, content: string }[]) => {
  const mapped = [];
  
  for (const p of PREFECTURES) {
    // Match logic using Kanji names (e.g. "北海道" == "北海道") or partial match
    const found = items.find(i => 
      p.name === i.prefectureName || 
      i.prefectureName.includes(p.name) ||
      p.name.includes(i.prefectureName)
    );
    
    if (found) {
      mapped.push({ prefectureCode: p.code, content: found.content });
    } else {
      // Fallback
      mapped.push({ prefectureCode: p.code, content: "？" }); 
    }
  }
  return mapped;
};

export const getHint = async (prefectureName: string, currentMode: GameMode, currentContent: string) => {
  const ai = getClient();
  const prompt = `
    僕は日本の地図パズルゲームをしています。
    今、「${prefectureName}」のピース（内容: ${currentContent}）をどこに置けばいいか迷っています。
    モードは「${currentMode}」です。
    
    小学生にもわかるように、この都道府県が日本のどこにあるか（地方や特徴など）を短いヒント（20文字以内）で教えてください。
    都道府県の名前自体は答えになるので言わないでください。
    例：「日本の北のほうにあるよ」「九州の南にあるよ」
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  
  return response.text;
};
import { GoogleGenAI } from "@google/genai";
import { Shift } from "../types";

// Safely retrieve API Key to avoid "process is not defined" in browser environments without bundlers
const getApiKey = () => {
  try {
    // Prioritize the requested GEMINI_API_KEY, fallback to standard API_KEY
    return process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  } catch (e) {
    console.warn("process.env is not available in this environment");
    return '';
  }
};

const API_KEY = getApiKey();

// We handle the case where API_KEY might be missing gracefully in the UI
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeShift = async (shift: Shift): Promise<string> => {
  if (!API_KEY) return "AI ключ не найден. Анализ недоступен (Check .env.local).";

  const durationHours = shift.endTime 
    ? ((shift.endTime - shift.startTime) / (1000 * 60 * 60)).toFixed(2) 
    : 'N/A';
  
  const platformSummary = shift.platforms
    .filter(p => p.isActive)
    .map(p => `${p.name}: ${p.tokensEarned} токенов`)
    .join(', ');

  const prompt = `
    Ты менеджер вебкам студии PRIMA. Проанализируй эту смену оператора:
    Имя: ${shift.userName}
    Длительность: ${durationHours} часов
    Всего токенов: ${shift.totalTokens}
    Детали по площадкам: ${platformSummary}

    Напиши короткий (максимум 2-3 предложения) мотивирующий комментарий на русском языке. 
    Похвали, если результат хороший (>500 токенов/час), или подбодри, если меньше.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Отличная работа!";
  } catch (error) {
    console.error("AI Error:", error);
    return "Смена сохранена. Отдыхайте!";
  }
};
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
    .map(p => `${p.name}: ${p.tokensEarned} тк`)
    .join(', ');

  const prompt = `
    Ты — ведущий аналитик и коуч вебкам-студии PRIMA. Твоя задача — проанализировать смену оператора и дать конструктивный фидбек.

    ДАННЫЕ СМЕНЫ:
    - Оператор: ${shift.userName}
    - Длительность: ${durationHours} ч.
    - Общий доход: ${shift.totalTokens} токенов.
    - Детализация по площадкам: ${platformSummary}

    ЗАДАЧА:
    Сформируй отчет на русском языке, содержащий следующие пункты (используй эмодзи):
    1. 📊 **Эффективность**: Рассчитай средний заработок в час. Оцени, насколько это соответствует норме (цель: >500 тк/час).
    2. 🔎 **Анализ площадок**: Выдели лучшую площадку и ту, которая просела.
    3. 💡 **Стратегия роста**: Дай 1 конкретный совет, как поднять доход на отстающей площадке (например, обновить тему комнаты, использовать игрушку, проверить битрейт).

    Будь краток, профессионален и мотивируй оператора на рост. Максимум 4-5 предложений.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Смена проанализирована. Отличная работа!";
  } catch (error) {
    console.error("AI Error:", error);
    return "Смена сохранена. Отдыхайте!";
  }
};
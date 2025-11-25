import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Using the requested lite model for low latency
const MODEL_NAME = 'gemini-2.5-flash-lite';

export const generateTaskDescription = async (title: string, clientName: string): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning mock response.");
    return "API ключ не найден. Пожалуйста, настройте окружение.";
  }

  try {
    const prompt = `
      Ты — опытный технолог в современной типографии.
      Твоя задача — составить краткое, но технически грамотное описание задачи (техническое задание) для заказа.
      
      Название заказа: "${title}"
      Клиент: "${clientName}"

      Сгенерируй список необходимых действий для этого заказа, учитывая типичные процессы (проверка макетов, цветопроба, выбор бумаги, печать, резка, фальцовка и т.д., если применимо к названию).
      Пиши кратко, по пунктам. Тон профессиональный. Не используй markdown форматирование, просто текст.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        maxOutputTokens: 300,
        temperature: 0.4, // Lower temperature for more consistent technical instructions
      }
    });

    return response.text || "Не удалось сгенерировать описание.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ошибка при генерации описания. Проверьте соединение или ключи.";
  }
};

export const suggestTechSpecs = async (description: string): Promise<string> => {
    if (!apiKey) return "";

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `На основе этого описания заказа: "${description}", предложи рекомендуемую плотность бумаги (г/м2) и тип покрытия (мат/глянец), если это применимо. Ответь одним предложением.`,
        });
        return response.text || "";
    } catch (e) {
        return "";
    }
}
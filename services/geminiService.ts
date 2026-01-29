import { GoogleGenAI } from "@google/genai";

// Helper to safely get the API instance
// This prevents top-level crashes in browsers where 'process' is not defined
const getAI = () => {
  let apiKey = '';
  try {
    // Safe access for browser environments
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Could not access process.env");
  }

  // Fallback or empty string (will cause API calls to fail, but app won't crash on load)
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a blog post draft based on a topic using Gemini 3 Pro.
 */
export const generateBlogPost = async (topic: string, category: string): Promise<string> => {
  try {
    const ai = getAI();
    
    const prompt = `
      Write a professional, engaging blog post for "Azul 360 Parceiros" (a corporate partner blog).
      Topic: ${topic}
      Category: ${category}
      
      Structure:
      1. An engaging introduction.
      2. 2-3 detailed paragraphs with subtitles.
      3. A conclusion.
      
      Tone: Professional, innovative, and encouraging.
      Language: Portuguese (Brazil).
      Format: Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using the specific requested model for complex text tasks
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 }, // Enable thinking for better structure
      }
    });

    return response.text || "Não foi possível gerar o conteúdo.";
  } catch (error) {
    console.error("Error generating blog post:", error);
    return "Erro ao conectar com o Gemini AI. Verifique se a chave de API está configurada corretamente.";
  }
};

/**
 * Generates a short excerpt/summary for a blog post.
 */
export const generateExcerpt = async (content: string): Promise<string> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', // Flash is sufficient for summarization
            contents: `Resuma o seguinte texto em um parágrafo curto e chamativo (máximo 120 caracteres) para um card de blog, em Português: ${content.substring(0, 1000)}...`
        });
        return response.text || "";
    } catch (e) {
        return "Resumo automático indisponível.";
    }
}
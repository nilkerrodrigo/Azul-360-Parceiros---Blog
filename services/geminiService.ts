import { GoogleGenAI } from "@google/genai";

// Ensure API key is available
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a blog post draft based on a topic using Gemini 3 Pro.
 */
export const generateBlogPost = async (topic: string, category: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  try {
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
    throw new Error("Falha ao conectar com o Gemini AI.");
  }
};

/**
 * Generates a short excerpt/summary for a blog post.
 */
export const generateExcerpt = async (content: string): Promise<string> => {
    if (!apiKey) return "Resumo indisponível (sem chave API).";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', // Flash is sufficient for summarization
            contents: `Resuma o seguinte texto em um parágrafo curto e chamativo (máximo 120 caracteres) para um card de blog, em Português: ${content.substring(0, 1000)}...`
        });
        return response.text || "";
    } catch (e) {
        return "Resumo automático indisponível.";
    }
}

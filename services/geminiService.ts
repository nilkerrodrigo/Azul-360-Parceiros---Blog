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
    
    // Prompt altamente específico para o público alvo (Agências de Viagens Parceiras da Azul)
    const prompt = `
      Escreva um artigo de blog profissional e envolvente para o portal "Azul 360 Parceiros".
      
      Público Alvo: Agentes de viagens e parceiros comerciais da Azul Viagens.
      Objetivo: Educar, informar e incentivar vendas de produtos turísticos ou melhoria de gestão.
      
      Tópico: ${topic}
      Categoria: ${category}
      
      Estrutura Obrigatória:
      1. Uma introdução cativante que conecte com a realidade do agente de viagens.
      2. 3 parágrafos de desenvolvimento com subtítulos claros (use ## para subtítulos Markdown).
      3. Uma conclusão prática ou chamada para ação (ex: "Consulte o portal de emissões...").
      
      Tom de Voz: Profissional, parceiro, encorajador e especialista.
      Idioma: Português do Brasil.
      Formato: Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Modelo de alta capacidade para textos complexos
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 }, // Permite "pensar" para estruturar melhor o argumento de venda
      }
    });

    return response.text || "Não foi possível gerar o conteúdo.";
  } catch (error) {
    console.error("Error generating blog post:", error);
    return "Erro ao conectar com o Gemini AI. Verifique se a chave de API está configurada no arquivo .env.";
  }
};

/**
 * Generates a short excerpt/summary for a blog post.
 */
export const generateExcerpt = async (content: string): Promise<string> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview', // Flash é mais rápido e suficiente para resumos
            contents: `Crie um resumo curto e cativante (máximo 160 caracteres, em Português) do seguinte artigo para ser usado como subtítulo ou prévia em um blog: ${content.substring(0, 1500)}...`
        });
        const generatedExcerpt = response.text || "";
        // Remove aspas se a IA devolver o texto entre aspas
        return generatedExcerpt.replace(/^"|"$/g, '').trim(); 
    } catch (e) {
        console.error("Error generating excerpt:", e);
        return "Resumo automático indisponível.";
    }
}
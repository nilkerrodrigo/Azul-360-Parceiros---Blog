// Configuration for the application

// Verifica se estamos rodando no navegador
const isBrowser = typeof window !== 'undefined';

// Determina se é produção verificando se o hostname inclui o domínio oficial
// Agora verificamos especificamente o subdomínio 'blog' ou o principal
const isProduction = isBrowser && (
  window.location.hostname.includes('azul360parceiros.com.br')
);

// Se for produção, use caminho relativo '/api'. 
// Se for localhost, use o domínio CORRETO: blog.azul360parceiros.com.br
export const API_BASE_URL = isProduction
  ? '/api' 
  : 'https://blog.azul360parceiros.com.br/api';

export const UPLOADS_URL = isProduction
  ? '/api/uploads'
  : 'https://blog.azul360parceiros.com.br/api/uploads';

console.log(`Configuração API: ${isProduction ? 'Produção (Relativo)' : 'Dev (Absoluto)'} -> ${API_BASE_URL}`);
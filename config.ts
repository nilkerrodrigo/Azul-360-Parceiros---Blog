// Configuration for the application

// Domínio onde a API PHP está hospedada
// Atualizado para usar o subdomínio 'blog' conforme instrução recente
const API_DOMAIN = 'https://blog.azul360parceiros.com.br'; 

// Verifica se o site está rodando no domínio oficial
const isProduction = typeof window !== 'undefined' && (
  window.location.hostname === 'blog.azul360parceiros.com.br' ||
  window.location.hostname === 'azul360parceiros.com.br' || 
  window.location.hostname === 'www.azul360parceiros.com.br'
);

// URL Base da API
// Se estiver em produção, usa caminho relativo para evitar problemas de CORS/SSL
export const API_BASE_URL = isProduction
  ? '/api' 
  : `${API_DOMAIN}/api`;

export const UPLOADS_URL = isProduction
  ? '/api/uploads'
  : `${API_DOMAIN}/api/uploads`;

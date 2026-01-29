// Configuration for the application

// Domínio onde a API PHP está hospedada
// Ajustado para o domínio principal para garantir conexão
const API_DOMAIN = 'https://azul360parceiros.com.br'; 

// Verifica se o site está rodando no domínio oficial
const isProduction = typeof window !== 'undefined' && (
  window.location.hostname === 'azul360parceiros.com.br' || 
  window.location.hostname === 'www.azul360parceiros.com.br'
);

// URL Base da API
export const API_BASE_URL = isProduction
  ? '/api' 
  : `${API_DOMAIN}/api`;

export const UPLOADS_URL = isProduction
  ? '/api/uploads'
  : `${API_DOMAIN}/api/uploads`;
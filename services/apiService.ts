import { Article, Category, Banner, User } from '../types';
import { API_BASE_URL } from '../config';
import { INITIAL_ARTICLES, INITIAL_BANNERS, INITIAL_CATEGORIES, INITIAL_USERS } from '../constants';

// Helper for Fetch
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}/${endpoint}`;
    try {
        const fetchOptions: RequestInit = {
            ...options,
            mode: 'cors', // Garante que tentativas locais usem CORS
        };

        const response = await fetch(url, fetchOptions);
        const text = await response.text();
        
        // Verifica erros HTTP
        if (!response.ok) {
             console.warn(`[API Warning] ${response.status} em ${url}:`, text);
             throw new Error(`Erro ${response.status}: Falha ao conectar em ${url}`);
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            // Se a resposta não for JSON, pode ser um erro do servidor PHP ou 404
            throw new Error(`Resposta inválida do servidor em ${endpoint}.`);
        }
    } catch (error: any) {
        // Reduzimos o nível do log para warn para não assustar no console se for esperado (demo mode)
        console.warn(`Falha na requisição API (${endpoint}):`, error.message);
        throw error; // Re-throw to be handled by caller
    }
};

// --- Articles ---
export const getArticles = async (): Promise<Article[]> => {
    try {
        const data = await apiRequest('articles.php');
        if (!Array.isArray(data)) return [];
        
        return data.map((d: any) => ({ 
            id: String(d.id),
            title: d.title,
            excerpt: d.excerpt,
            content: d.content,
            category: d.category,
            imageUrl: d.image_url,
            author: d.author,
            date: d.publish_date,
            views: Number(d.views || 0),
            featured: false // Default
        }));
    } catch (error) {
        console.info("Usando dados de demonstração para Artigos (API indisponível).");
        return INITIAL_ARTICLES;
    }
};

export const addArticle = async (article: Omit<Article, 'id'>) => {
    try {
        const payload = {
            title: article.title,
            excerpt: article.excerpt,
            content: article.content,
            category: article.category,
            image_url: article.imageUrl,
            author: article.author,
            publish_date: article.date
        };
        return await apiRequest('articles.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.warn("Modo Demo: Artigo não salvo no servidor real.");
        return { success: true, id: 'demo-' + Date.now() };
    }
};

export const incrementArticleView = async (id: string) => {
    try {
        await apiRequest('metrics.php', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'view', id: id })
        });
    } catch (e) {
        // Silently fail for metrics
    }
};

// --- Banners ---
export const getBanners = async (): Promise<Banner[]> => {
    try {
        const data = await apiRequest('banners.php');
        if (!Array.isArray(data)) return [];
        return data.map((d: any) => ({ 
            id: String(d.id), 
            image: d.image_url,
            title: d.title,
            subtitle: d.subtitle,
            cta: d.cta,
            link: d.link, // Mapped from PHP response
            clicks: Number(d.clicks || 0)
        }));
    } catch (error) {
        console.info("Usando dados de demonstração para Banners (API indisponível).");
        return INITIAL_BANNERS;
    }
};

export const addBanner = async (banner: Omit<Banner, 'id'>) => {
    try {
        const payload = {
            title: banner.title,
            subtitle: banner.subtitle,
            image_url: banner.image,
            cta: banner.cta,
            link: banner.link // Included in payload
        };
        return await apiRequest('banners.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.warn("Modo Demo: Banner não salvo no servidor real.");
        return { success: true };
    }
};

export const deleteBanner = async (id: string) => {
    try {
        return await apiRequest('banners.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
    } catch (e) {
        return { success: true };
    }
};

export const incrementBannerClick = async (id: string) => {
    try {
        await apiRequest('metrics.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'click', id: id })
        });
    } catch (e) {
        // Silently fail
    }
};

// --- Categories ---
export const getCategories = async (): Promise<Category[]> => {
    try {
        const data = await apiRequest('categories.php');
        if (!Array.isArray(data)) return [];
        return data.map((d: any) => ({ 
            id: String(d.id),
            name: d.name,
            icon: d.icon,
            description: d.description
        }));
    } catch (error) {
        console.info("Usando dados de demonstração para Categorias (API indisponível).");
        return INITIAL_CATEGORIES;
    }
};

export const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
        return await apiRequest('categories.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category)
        });
    } catch (e) {
         console.warn("Modo Demo: Categoria não salva no servidor real.");
         return { success: true };
    }
};

export const deleteCategory = async (id: string) => {
    try {
        return await apiRequest('categories.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
    } catch (e) {
        return { success: true };
    }
};

// --- Auth ---
export const loginUser = async (email: string, password: string) => {
    try {
        const result = await apiRequest('login.php', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (result.success) {
            return result.user;
        } else {
            throw new Error(result.message || "Falha no login");
        }
    } catch (e: any) {
        // Fallback for Demo Mode login if API fails
        if (email === 'admin@azul360.com.br' && password === 'admin') {
            console.warn("API Offline: Login realizado em modo demonstração.");
            return { id: 'demo-admin', name: 'Admin Demo', email: email };
        }
        throw e;
    }
};

// --- Users (New) ---
export const getUsers = async (): Promise<User[]> => {
    try {
        const data = await apiRequest('users.php');
        if (!Array.isArray(data)) return [];
        return data.map((d: any) => ({
            id: String(d.id),
            name: d.name,
            email: d.email
        }));
    } catch (error) {
        console.info("Usando dados de demonstração para Usuários (API indisponível).");
        return INITIAL_USERS;
    }
};

export const addUser = async (name: string, email: string, password: string) => {
    try {
        return await apiRequest('users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
    } catch (e) {
         console.warn("Modo Demo: Usuário não salvo no servidor real.");
         return { success: true };
    }
};

export const deleteUser = async (id: string) => {
    try {
        return await apiRequest('users.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
    } catch (e) {
        return { success: true };
    }
};


// --- Upload ---
export const uploadImage = async (file: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const endpoint = 'upload.php';
        const url = `${API_BASE_URL}/${endpoint}`;
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status} no upload.`);
        }

        const text = await response.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            throw new Error("Resposta inválida do servidor de upload: " + text);
        }

        if (result.url) {
            return result.url;
        }
        throw new Error(result.error || "Falha no upload");
    } catch (e) {
        console.warn("API de upload falhou, usando imagem local (Blob) para demonstração.");
        return URL.createObjectURL(file);
    }
};
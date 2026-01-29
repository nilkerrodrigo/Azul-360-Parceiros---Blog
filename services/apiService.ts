import { Article, Category, Banner, User } from '../types';
import { API_BASE_URL } from '../config';
import { INITIAL_ARTICLES, INITIAL_BANNERS, INITIAL_CATEGORIES, INITIAL_USERS } from '../constants';

// Helper for Fetch
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    // Remove barras duplicadas se existirem
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const url = `${baseUrl}/${endpoint}`;
    
    try {
        const fetchOptions: RequestInit = {
            ...options,
            mode: 'cors', // Necessário para comunicação cross-origin se domínios forem diferentes
        };

        const response = await fetch(url, fetchOptions);
        const text = await response.text();
        
        // Verifica erros HTTP
        if (!response.ok) {
             console.warn(`[API Warning] ${response.status} em ${url}:`, text);
             throw new Error(`Erro ${response.status}: Falha ao conectar com o servidor.`);
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            // Se a resposta não for JSON (ex: erro fatal do PHP impresso na tela), lança erro
            console.error("Resposta inválida (não-JSON) do servidor:", text);
            throw new Error(`O servidor retornou uma resposta inválida em ${endpoint}.`);
        }
    } catch (error: any) {
        console.error(`Falha na requisição API (${endpoint}):`, error.message);
        throw error; 
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
            featured: false
        }));
    } catch (error) {
        console.info("API Offline ou vazia. Usando dados iniciais.");
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
        console.error("Erro ao salvar artigo no banco:", e);
        throw e;
    }
};

export const deleteArticle = async (id: string) => {
    try {
        return await apiRequest('articles.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
    } catch (e) {
        console.error("Erro ao excluir artigo:", e);
        throw e;
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
            link: d.link,
            clicks: Number(d.clicks || 0)
        }));
    } catch (error) {
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
            link: banner.link 
        };
        return await apiRequest('banners.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        throw e;
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
        throw e;
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
         throw e;
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
        throw e;
    }
};

// --- Auth & Users ---
export const loginUser = async (email: string, password: string) => {
    try {
        const result = await apiRequest('login.php', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        // Se a API retornar success: false, lançamos erro com a mensagem do servidor
        if (result.success) {
            return result.user;
        } else {
            throw new Error(result.error || "Credenciais inválidas");
        }
    } catch (e: any) {
        throw e;
    }
};

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
        return INITIAL_USERS;
    }
};

export const addUser = async (name: string, email: string, password: string) => {
    try {
        const result = await apiRequest('users.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        if (!result.success) {
            throw new Error(result.error || "Erro ao criar usuário");
        }
        return result;
    } catch (e) {
         throw e;
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
        throw e;
    }
};


// --- Upload ---
export const uploadImage = async (file: File): Promise<string> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const endpoint = 'upload.php';
        // Remove barras duplicadas para evitar //upload.php
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        const url = `${baseUrl}/${endpoint}`;
        
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
            throw new Error("Servidor retornou resposta inválida no upload.");
        }

        if (result.url) {
            return result.url;
        }
        throw new Error(result.error || "Falha no upload");
    } catch (e) {
        console.error("Upload falhou:", e);
        // Fallback apenas visual se o upload falhar
        return URL.createObjectURL(file);
    }
};
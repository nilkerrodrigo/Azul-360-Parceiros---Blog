import { Article, Category, Banner, User } from '../types';
import { API_BASE_URL } from '../config';

// Helper para chamadas de API
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    // Garante URL correta sem barras duplas
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    // Adiciona timestamp para evitar cache agressivo em GETs
    const cacheBuster = options.method === 'POST' ? '' : `?t=${new Date().getTime()}`;
    const url = `${baseUrl}/${endpoint}${cacheBuster}`;
    
    try {
        const response = await fetch(url, {
            ...options,
            mode: 'cors'
        });

        const text = await response.text();
        
        // Erro HTTP (404, 500, etc)
        if (!response.ok) {
            console.error(`[API Error] ${response.status} em ${endpoint}:`, text);
            throw new Error(`Erro do Servidor (${response.status}): Verifique se o arquivo ${endpoint} existe na pasta /api/`);
        }

        try {
            const json = JSON.parse(text);
            return json;
        } catch (e) {
            console.error(`[API Parse Error] Resposta não é JSON em ${endpoint}:`, text);
            // Se o texto conter "Connection failed", o PHP imprimiu erro fora do JSON
            if (text.includes("Connection failed") || text.includes("SQLSTATE")) {
                 throw new Error("Erro de conexão com o Banco de Dados. Verifique config.php.");
            }
            throw new Error("Resposta inválida do servidor. Verifique os logs.");
        }
    } catch (error: any) {
        // Erro de rede (Failed to fetch)
        if (error.message === 'Failed to fetch') {
            console.error(`[Network Error] Não foi possível conectar a ${url}`);
            throw new Error(`Falha de conexão: O sistema não encontrou a API em ${url}. Verifique se a pasta 'api' foi enviada para o servidor.`);
        }
        throw error;
    }
};

// --- Articles ---

export const getArticles = async (): Promise<Article[]> => {
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
};

export const addArticle = async (article: Omit<Article, 'id'>) => {
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
};

export const deleteArticle = async (id: string) => {
    return await apiRequest('articles.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
};

export const incrementArticleView = async (id: string) => {
    try {
        await apiRequest('metrics.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'view', id })
        });
    } catch (e) {
        // Ignora erros de métrica para não atrapalhar navegação
    }
};

// --- Banners ---

export const getBanners = async (): Promise<Banner[]> => {
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
};

export const addBanner = async (banner: Omit<Banner, 'id'>) => {
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
};

export const deleteBanner = async (id: string) => {
    return await apiRequest('banners.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
};

export const incrementBannerClick = async (id: string) => {
    try {
        await apiRequest('metrics.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'click', id })
        });
    } catch (e) {
        // Ignora
    }
};

// --- Categories ---

export const getCategories = async (): Promise<Category[]> => {
    const data = await apiRequest('categories.php');
    if (!Array.isArray(data)) return [];
    return data.map((d: any) => ({
        id: String(d.id),
        name: d.name,
        icon: d.icon,
        description: d.description
    }));
};

export const addCategory = async (category: Omit<Category, 'id'>) => {
    return await apiRequest('categories.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
    });
};

export const deleteCategory = async (id: string) => {
    return await apiRequest('categories.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
};

// --- Users & Auth ---

export const getUsers = async (): Promise<User[]> => {
    const data = await apiRequest('users.php');
    if (!Array.isArray(data)) return [];
    return data.map((d: any) => ({
        id: String(d.id),
        name: d.name,
        email: d.email
    }));
};

export const addUser = async (name: string, email: string, password: string) => {
    const result = await apiRequest('users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    if (!result.success) throw new Error(result.error);
    return result;
};

export const deleteUser = async (id: string) => {
    return await apiRequest('users.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
};

export const loginUser = async (email: string, password: string) => {
    const result = await apiRequest('login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (result.success) {
        return result.user;
    } else {
        throw new Error(result.error || "Login falhou");
    }
};

// --- Upload ---

export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    
    const response = await fetch(`${baseUrl}/upload.php`, {
        method: 'POST',
        body: formData,
        mode: 'cors'
    });

    if (!response.ok) {
        throw new Error("Erro no upload da imagem");
    }

    const result = await response.json();
    if (result.url) {
        return result.url;
    } else {
        throw new Error(result.error || "Falha ao salvar imagem");
    }
};
import { Article, Category, Banner } from '../types';
import { API_BASE_URL } from '../config';

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
             console.error(`[API Error] ${response.status} em ${url}:`, text);
             throw new Error(`Erro ${response.status}: Falha ao conectar em ${url}`);
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("[API Parse Error] Resposta não é JSON válido:", text.substring(0, 200));
            
            if (text.includes("404") || text.includes("File not found") || text.includes("Not Found")) {
                throw new Error(`Endpoint não encontrado: ${url}. Verifique se a pasta 'api' e os arquivos PHP estão no local correto na hospedagem.`);
            }
            throw new Error(`Resposta inválida do servidor em ${endpoint}. Verifique o console.`);
        }
    } catch (error: any) {
        console.error("Falha na requisição API:", error);
        
        if (error.message === 'Failed to fetch') {
            throw new Error(`Não foi possível conectar ao servidor (${url}). Isso pode ser bloqueio de CORS (local) ou o endereço está incorreto.`);
        }
        
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
        console.warn("Erro ao buscar artigos, retornando lista vazia.", error);
        return [];
    }
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
            clicks: Number(d.clicks || 0)
        }));
    } catch (error) {
        console.warn("Erro ao buscar banners, retornando lista vazia.", error);
        return [];
    }
};

export const addBanner = async (banner: Omit<Banner, 'id'>) => {
    const payload = {
        title: banner.title,
        subtitle: banner.subtitle,
        image_url: banner.image,
        cta: banner.cta
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
        console.warn("Erro ao buscar categorias, retornando lista vazia.", error);
        return [];
    }
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

// --- Auth ---
export const loginUser = async (email: string, password: string) => {
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
};

// --- Upload ---
export const uploadImage = async (file: File): Promise<string> => {
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
};

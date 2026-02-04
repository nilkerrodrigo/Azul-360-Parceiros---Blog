import { Article, Category, Banner, User, Comment } from '../types';
import { supabase } from '../supabaseClient';

// --- Articles ---

export const getArticles = async (): Promise<Article[]> => {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
    
    return data.map((d: any) => ({
        id: d.id,
        title: d.title,
        excerpt: d.excerpt,
        content: d.content,
        category: d.category,
        imageUrl: d.image_url,
        author: d.author,
        date: d.publish_date,
        views: d.views || 0,
        likes: d.likes || 0,
        featured: false
    }));
};

export const addArticle = async (article: Omit<Article, 'id'>) => {
    const { data, error } = await supabase
        .from('articles')
        .insert([{
            title: article.title,
            excerpt: article.excerpt,
            content: article.content,
            category: article.category,
            image_url: article.imageUrl,
            author: article.author,
            publish_date: article.date,
            views: 0,
            likes: 0
        }])
        .select();

    if (error) throw error;
    return data;
};

export const deleteArticle = async (id: string) => {
    const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const incrementArticleView = async (id: string) => {
    const { error } = await supabase.rpc('increment_views', { row_id: id });
    if (error) console.error("Error incrementing view:", error);
};

export const incrementArticleLike = async (id: string) => {
    const { error } = await supabase.rpc('increment_likes', { row_id: id });
    if (error) console.error("Error incrementing like:", error);
};

// --- Comments ---

export const getComments = async (articleId: string): Promise<Comment[]> => {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false }); // Mais recentes primeiro

    if (error) {
        console.error("Error fetching comments", error);
        return [];
    }

    return data.map((c: any) => ({
        id: c.id,
        articleId: c.article_id,
        authorName: c.author_name,
        content: c.content,
        createdAt: new Date(c.created_at).toLocaleDateString('pt-BR')
    }));
};

export const addComment = async (articleId: string, authorName: string, content: string) => {
    const { data, error } = await supabase
        .from('comments')
        .insert([{
            article_id: articleId,
            author_name: authorName,
            content: content
        }])
        .select();
    
    if (error) throw error;
    return data;
};

// --- Banners ---

export const getBanners = async (): Promise<Banner[]> => {
    const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching banners:', error);
        return [];
    }

    return data.map((d: any) => ({
        id: d.id,
        image: d.image_url,
        title: d.title,
        subtitle: d.subtitle,
        cta: d.cta,
        link: d.link,
        clicks: d.clicks
    }));
};

export const addBanner = async (banner: Omit<Banner, 'id'>) => {
    const { data, error } = await supabase
        .from('banners')
        .insert([{
            image_url: banner.image,
            title: banner.title,
            subtitle: banner.subtitle,
            cta: banner.cta,
            link: banner.link,
            clicks: 0
        }])
        .select();

    if (error) throw error;
    return data;
};

export const deleteBanner = async (id: string) => {
    const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

export const incrementBannerClick = async (id: string) => {
    const { error } = await supabase.rpc('increment_clicks', { row_id: id });
    if (error) console.error("Error incrementing click:", error);
};

// --- Categories ---

export const getCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    // Deduplicação no Frontend: Garante que nomes repetidos não apareçam na tela
    const uniqueCategories = new Map();
    data.forEach((d: any) => {
        if (!uniqueCategories.has(d.name)) {
            uniqueCategories.set(d.name, {
                id: d.id,
                name: d.name,
                icon: d.icon,
                description: d.description
            });
        }
    });

    return Array.from(uniqueCategories.values());
};

export const addCategory = async (category: Omit<Category, 'id'>) => {
    const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select();

    if (error) throw error;
    return data;
};

export const deleteCategory = async (id: string) => {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

// --- Users & Auth ---

export const getUsers = async (): Promise<User[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
        return [{ id: user.id, name: 'Admin', email: user.email }];
    }
    return [];
};

export const addUser = async (name: string, email: string, password: string) => {
    throw new Error("Por segurança, convide novos administradores através do Painel do Supabase (Authentication > Invite).");
};

export const deleteUser = async (id: string) => {
    throw new Error("Remova usuários pelo Painel do Supabase.");
};

export const loginUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return { id: data.user.id, email: data.user.email, name: 'Admin' };
};

export const logoutUser = async () => {
    await supabase.auth.signOut();
};

// --- Upload ---

export const uploadImage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    
    const { data, error } = await supabase
        .storage
        .from('blog-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;

    const { data: { publicUrl } } = supabase
        .storage
        .from('blog-images')
        .getPublicUrl(fileName);

    return publicUrl;
};
export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  author: string;
  date: string;
  featured?: boolean;
  views?: number;
  likes?: number; // New metric
}

export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  link?: string;
  clicks?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export type ViewState = 'HOME' | 'ADMIN' | 'ARTICLE_DETAIL' | 'LOGIN' | 'SEARCH_RESULTS' | 'ABOUT';

export interface AdminDraft {
  title: string;
  excerpt: string; // Adicionado para o campo de resumo/subtítulo
  category: string;
  content: string;
  author: string;
}
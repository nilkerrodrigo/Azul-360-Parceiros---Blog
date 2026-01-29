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
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Banner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
}

export type ViewState = 'HOME' | 'ADMIN' | 'ARTICLE_DETAIL' | 'LOGIN' | 'SEARCH_RESULTS';

export interface AdminDraft {
  title: string;
  category: string;
  content: string;
  author: string;
}
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
  views?: number; // New metric
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Banner {
  id: string; // Changed from number to string for Firestore IDs
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  clicks?: number; // New metric
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export type ViewState = 'HOME' | 'ADMIN' | 'ARTICLE_DETAIL' | 'LOGIN' | 'SEARCH_RESULTS' | 'ABOUT';

export interface AdminDraft {
  title: string;
  category: string;
  content: string;
  author: string;
}
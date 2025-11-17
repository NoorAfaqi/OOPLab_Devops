// Shared types and interfaces for the application

export interface Service {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  imageUrl?: string;
}

// Database product structure from API
export interface DatabaseProduct {
  PID: number;
  NAME: string;
  P_URL: string;
  DESCRIPTION: string;
  LOGO: string;
  features: Array<{
    FID: number;
    DESCRIPTION: string;
  }>;
}

// Transformed product for UI display
export interface DisplayProduct {
  id: number;
  name: string;
  description: string;
  features: string[];
  url: string;
  logo: string;
  color: string;
  category: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  readTime: number;
  imageUrl?: string;
}

export interface TeamMember {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export interface ContactInfo {
  icon: React.ReactNode;
  title: string;
  details: string;
  description: string;
}

export interface BusinessHours {
  day: string;
  hours: string;
}

export interface FormData {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}

export interface NavigationItem {
  name: string;
  href: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  total?: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  category?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  avatar?: string;
}

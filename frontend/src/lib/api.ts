// API service functions for communicating with the backend

const API_BASE_URL = ${NEXT_PUBLIC_API_URL} || 'https://ooplab-backend-exprress.onrender.com/api';

export interface ApiProduct {
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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}

export interface ProductsResponse {
  products: ApiProduct[];
  total: number;
}

// Authentication interfaces
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  dateOfBirth?: string;
  nationality?: string;
  phoneNumber?: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Subscription interfaces
export interface SubscribeResponse {
  id: number;
  email: string;
  subscribedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  dateOfBirth?: string;
  nationality?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

// Authentication API functions
export async function login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

export async function register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
}

export async function getProfile(token: string): Promise<ApiResponse<{ user: User }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
}

export async function updateProfile(token: string, userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function changePassword(token: string, currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change password');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

// Fetch all products from the backend API
export async function fetchProducts(): Promise<ApiResponse<ProductsResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control for development
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products from the server');
  }
}

// Health check endpoint
export async function checkApiHealth(): Promise<ApiResponse<{ uptime: number; timestamp: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking API health:', error);
    throw new Error('Failed to connect to the server');
  }
}

// Blog interfaces
export interface BlogAuthor {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  authorId: number;
  coverImage?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: BlogAuthor;
  commentCount: number;
  likeCount: number;
}

export interface BlogPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BlogsResponse {
  blogs: BlogPost[];
  pagination: BlogPagination;
}

export interface BlogsByUsernameResponse {
  author: BlogAuthor;
  blogs: BlogPost[];
  pagination: BlogPagination;
}

export interface BlogSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Analytics interfaces
export interface BlogAnalytics {
  blog: {
    id: number;
    title: string;
    slug: string;
    createdAt: string;
  };
  timeFilter: string;
  overview: {
    totalViews: number;
    uniqueViews: number;
    commentsCount: number;
    likesCount: number;
    engagementRate: string;
  };
  viewsOverTime: Array<{
    date: string;
    views: number;
  }>;
  referralData: Array<{
    domain: string;
    url: string;
    count: number;
  }>;
  deviceData: Array<{
    type: string;
    count: number;
  }>;
  browserData: Array<{
    browser: string;
    count: number;
  }>;
  osData: Array<{
    os: string;
    count: number;
  }>;
  countryData: Array<{
    country: string;
    count: number;
  }>;
}

export interface UserBlogsAnalytics {
  timeFilter: string;
  summary: {
    totalBlogs: number;
    totalViews: number;
    uniqueViews: number;
    totalComments: number;
    totalLikes: number;
  };
  blogs: Array<{
    id: number;
    title: string;
    slug: string;
    coverImage?: string;
    createdAt: string;
    published: boolean;
    stats: {
      totalViews: number;
      uniqueViews: number;
      commentsCount: number;
      likesCount: number;
    };
  }>;
}

export interface CreateBlogData {
  title: string;
  content: string;
  coverImage?: string;
  published?: boolean;
}

// Blog API functions
export async function fetchBlogs(params: BlogSearchParams = {}): Promise<ApiResponse<BlogsResponse>> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const url = `${API_BASE_URL}/blogs/list${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw new Error('Failed to fetch blogs from the server');
  }
}

export async function fetchBlogsByUsername(username: string, params: BlogSearchParams = {}, token?: string): Promise<ApiResponse<BlogsByUsernameResponse>> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const url = `${API_BASE_URL}/blogs/${username}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blogs by username:', error);
    throw new Error('Failed to fetch blogs from the server');
  }
}

export async function fetchBlogBySlug(username: string, slug: string, token?: string): Promise<ApiResponse<{ blog: BlogPost }>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const url = `${API_BASE_URL}/blogs/${username}/${slug}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Blog not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    throw new Error('Blog not found');
  }
}

export async function fetchBlogById(id: number): Promise<ApiResponse<{ blog: BlogPost }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/id/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching blog by ID:', error);
    throw new Error('Failed to fetch blog from the server');
  }
}

export async function createBlog(token: string, blogData: CreateBlogData): Promise<ApiResponse<{ blog: BlogPost }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw new Error('Failed to create blog');
  }
}

export interface UpdateBlogData {
  title?: string;
  content?: string;
  coverImage?: string;
  published?: boolean;
}

// Comment interfaces
export interface Comment {
  id: number;
  content: string;
  blogId: number;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    profilePicture?: string;
  };
}

export interface CommentResponse {
  comments: Comment[];
}

export interface CreateCommentData {
  content: string;
}

export async function updateBlog(token: string, blogId: number, blogData: UpdateBlogData): Promise<ApiResponse<{ blog: BlogPost }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update blog');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
}

// Comment API functions
export async function fetchComments(blogId: number, token?: string): Promise<ApiResponse<CommentResponse>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comments`, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch comments');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

export async function createComment(token: string, blogId: number, commentData: CreateCommentData): Promise<ApiResponse<{ comment: Comment }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create comment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

export async function updateComment(token: string, commentId: number, commentData: CreateCommentData): Promise<ApiResponse<{ comment: Comment }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update comment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
}

export async function deleteComment(token: string, commentId: number): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete comment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

// Like API functions
export async function toggleLike(token: string, blogId: number): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to toggle like');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

// Random blogs API function
export async function fetchRandomBlogs(limit: number = 5): Promise<ApiResponse<BlogsResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/random?limit=${limit}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch random blogs');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching random blogs:', error);
    throw error;
  }
}

// Analytics API functions
export async function trackBlogView(blogId: number): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/track-view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to track view');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error tracking blog view:', error);
    throw error;
  }
}

export async function getBlogAnalytics(blogId: number, timeFilter: string = 'total', token: string): Promise<ApiResponse<BlogAnalytics>> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/analytics?timeFilter=${timeFilter}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get blog analytics');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting blog analytics:', error);
    throw error;
  }
}

export async function getUserBlogsAnalytics(timeFilter: string = 'total', token: string): Promise<ApiResponse<UserBlogsAnalytics>> {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/analytics/user?timeFilter=${timeFilter}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get user blogs analytics');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting user blogs analytics:', error);
    throw error;
  }
}

// Subscription API
export async function subscribeToNewsletter(email: string): Promise<ApiResponse<SubscribeResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to subscribe');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    throw error;
  }
}
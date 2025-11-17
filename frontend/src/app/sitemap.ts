import { MetadataRoute } from 'next';

// Force dynamic rendering (don't pre-render at build time)
export const dynamic = 'force-dynamic';

// Revalidate sitemap every hour in production
export const revalidate = 3600; // 1 hour

async function getBlogs() {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${API_BASE_URL}/blogs/list?limit=100&sortBy=createdAt&sortOrder=DESC`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.success ? data.data.blogs : [];
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org';
  const currentDate = new Date().toISOString();

  // Fetch all blogs
  const blogs = await getBlogs();

  // Build blog URLs
  const blogRoutes = blogs.map((blog: any) => ({
    url: `${baseUrl}/blogs/${blog.author?.username}/${blog.slug}`,
    lastModified: new Date(blog.updatedAt || blog.createdAt).toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // Combine static and dynamic routes
  return [...staticRoutes, ...blogRoutes];
}


import { Metadata } from 'next';
import { fetchBlogBySlug } from '@/lib/api';

interface BlogMetadataProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogMetadataProps): Promise<Metadata> {
  const { username, slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org';
  
  try {
    const response = await fetchBlogBySlug(username, slug);
    
    if (response.success && response.data.blog) {
      const blog = response.data.blog;
      const plainText = blog.content.replace(/<[^>]*>/g, '').substring(0, 160);
      const description = plainText || `${blog.title} by ${blog.author?.firstName} ${blog.author?.lastName} on OOPLab.`;
      
      const canonicalUrl = `${baseUrl}/blogs/${username}/${slug}`;
      const blogImage = blog.coverImage ? blog.coverImage : `${baseUrl}/logo.png`;
      
      return {
        title: `${blog.title} | ${blog.author?.firstName} ${blog.author?.lastName} | OOPLab`,
        description: description,
        keywords: [
          'blog',
          'software development',
          'web development',
          'programming',
          'technology',
          'Next.js',
          'React',
          blog.title,
          blog.author?.firstName,
          blog.author?.lastName,
        ],
        authors: [{ name: `${blog.author?.firstName} ${blog.author?.lastName}`, url: `${baseUrl}/blogs/${username}` }],
        openGraph: {
          title: blog.title,
          description: description,
          url: canonicalUrl,
          siteName: 'OOPLab',
          images: [
            {
              url: blogImage,
              width: 1200,
              height: 630,
              alt: blog.title,
              secureUrl: blogImage.startsWith('http') ? blogImage : `${baseUrl}${blogImage}`,
            }
          ],
          locale: 'en_US',
          type: 'article',
          publishedTime: blog.createdAt,
          modifiedTime: blog.updatedAt,
          authors: [`${blog.author?.firstName} ${blog.author?.lastName}`],
        },
        twitter: {
          card: 'summary_large_image',
          title: blog.title,
          description: description,
          images: [blogImage],
        },
        alternates: {
          canonical: canonicalUrl,
        },
        other: {
          'article:published_time': blog.createdAt,
          'article:modified_time': blog.updatedAt,
          'article:author': `${blog.author?.firstName} ${blog.author?.lastName}`,
          'article:section': 'Technology',
          'article:tag': 'software development, web development',
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata for blog:', error);
  }
  
  return {
    title: 'Blog Post - OOPLab',
    description: 'Read our latest blog posts and insights',
    robots: { index: false, follow: false },
  };
}


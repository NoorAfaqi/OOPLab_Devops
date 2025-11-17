import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // This will be replaced with actual Google Sheets API integration
    const mockArticles = [
      {
        id: "1",
        title: "Getting Started with Next.js 14",
        excerpt: "Learn the fundamentals of Next.js 14 and how to build modern web applications with the latest features.",
        content: "Full article content here...",
        author: "John Doe",
        publishedAt: "2024-01-15",
        category: "Web Development",
        readTime: 5,
        imageUrl: "/api/placeholder/600/300"
      },
      {
        id: "2",
        title: "Understanding Object-Oriented Programming",
        excerpt: "A comprehensive guide to OOP principles and how to apply them in modern software development.",
        content: "Full article content here...",
        author: "Jane Smith",
        publishedAt: "2024-01-10",
        category: "Programming",
        readTime: 8,
        imageUrl: "/api/placeholder/600/300"
      },
      {
        id: "3",
        title: "Building Scalable APIs with Node.js",
        excerpt: "Best practices for creating robust and scalable API endpoints using Node.js and Express.",
        content: "Full article content here...",
        author: "Mike Johnson",
        publishedAt: "2024-01-05",
        category: "Backend Development",
        readTime: 6,
        imageUrl: "/api/placeholder/600/300"
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockArticles,
      total: mockArticles.length
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // This will be replaced with actual Google Sheets API integration
    // For now, just return success
    
    return NextResponse.json({
      success: true,
      message: 'Article submitted successfully',
      data: { id: Date.now().toString(), ...body }
    });
  } catch (error) {
    console.error('Error submitting article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit article' },
      { status: 500 }
    );
  }
}

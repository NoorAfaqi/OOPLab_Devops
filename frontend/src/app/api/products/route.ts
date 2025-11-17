import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock products data - replace with actual database integration
    const products = [
      {
        id: "1",
        name: "Web Development Solutions",
        description: "Custom web applications built with modern frameworks like Next.js, React, and Node.js.",
        features: ["Responsive Design", "SEO Optimized", "Fast Performance", "Scalable Architecture"],
        price: "Starting at $2,500",
        category: "Web Development",
        imageUrl: "/api/placeholder/400/300"
      },
      {
        id: "2",
        name: "Mobile App Development",
        description: "Native and cross-platform mobile applications for iOS and Android devices.",
        features: ["Cross-Platform", "Native Performance", "App Store Ready", "Push Notifications"],
        price: "Starting at $5,000",
        category: "Mobile Development",
        imageUrl: "/api/placeholder/400/300"
      },
      {
        id: "3",
        name: "API Development",
        description: "RESTful APIs and microservices architecture for scalable backend solutions.",
        features: ["RESTful Design", "Microservices", "Database Integration", "Authentication"],
        price: "Starting at $1,500",
        category: "Backend Development",
        imageUrl: "/api/placeholder/400/300"
      },
      {
        id: "4",
        name: "Cloud Solutions",
        description: "Cloud infrastructure setup and deployment using AWS, Azure, or Google Cloud.",
        features: ["Auto Scaling", "Load Balancing", "CDN Integration", "Monitoring"],
        price: "Starting at $1,000",
        category: "Cloud Services",
        imageUrl: "/api/placeholder/400/300"
      }
    ];

    return NextResponse.json({
      success: true,
      data: products,
      total: products.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // This would integrate with your database to create a new product
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: { id: Date.now().toString(), ...body }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

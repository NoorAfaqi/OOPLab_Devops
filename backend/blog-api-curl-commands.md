# Blog API Curl Commands
# =====================

# 1. Health Check
curl -X GET "http://localhost:5000/api/health" \
  -H "Content-Type: application/json"

# 2. Get All Blogs (Public)
curl -X GET "http://localhost:5000/api/blogs/list" \
  -H "Content-Type: application/json"

# 3. Get Blog by Username and Slug (SSR URL Structure)
curl -X GET "http://localhost:5000/api/blogs/blogauthor/my-first-blog-post-22" \
  -H "Content-Type: application/json"

# 4. Get Blog by ID
curl -X GET "http://localhost:5000/api/blogs/id/23" \
  -H "Content-Type: application/json"

# 5. Get Blog Comments
curl -X GET "http://localhost:5000/api/blogs/23/comments" \
  -H "Content-Type: application/json"

# 6. Get All Blogs with Pagination
curl -X GET "http://localhost:5000/api/blogs/list?page=1&limit=5" \
  -H "Content-Type: application/json"

# 7. Get All Blogs with Search
curl -X GET "http://localhost:5000/api/blogs/list?search=blog" \
  -H "Content-Type: application/json"

# 8. Get All Blogs with Sorting
curl -X GET "http://localhost:5000/api/blogs/list?sortBy=createdAt&sortOrder=DESC" \
  -H "Content-Type: application/json"

# 9. Test Non-existent Blog (should return 404)
curl -X GET "http://localhost:5000/api/blogs/blogauthor/non-existent-blog" \
  -H "Content-Type: application/json"

# 10. Test Invalid Blog ID (should return 400)
curl -X GET "http://localhost:5000/api/blogs/id/invalid" \
  -H "Content-Type: application/json"

# ===========================================
# Authentication Required Endpoints
# ===========================================

# Note: These require authentication tokens. First get a token by logging in:

# Login to get authentication token
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "blog.author@example.com",
    "password": "password123"
  }'

# Then use the token in subsequent requests:

# Create Blog (replace TOKEN with actual token)
curl -X POST "http://localhost:5000/api/blogs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "My New Blog Post",
    "content": "This is the content of my new blog post.",
    "coverImage": "https://example.com/cover.jpg",
    "published": true
  }'

# Like Blog (replace TOKEN with actual token)
curl -X POST "http://localhost:5000/api/blogs/23/like" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create Comment (replace TOKEN with actual token)
curl -X POST "http://localhost:5000/api/blogs/23/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "content": "This is a great blog post!"
  }'

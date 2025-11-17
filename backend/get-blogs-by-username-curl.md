# Get Blogs by Username - New Endpoint
# ====================================

# Basic request to get all blogs by username
curl -X GET "http://localhost:5000/api/blogs/blogauthor" \
  -H "Content-Type: application/json"

# With pagination
curl -X GET "http://localhost:5000/api/blogs/blogauthor?page=1&limit=5" \
  -H "Content-Type: application/json"

# With search
curl -X GET "http://localhost:5000/api/blogs/blogauthor?search=blog" \
  -H "Content-Type: application/json"

# With sorting
curl -X GET "http://localhost:5000/api/blogs/blogauthor?sortBy=createdAt&sortOrder=DESC" \
  -H "Content-Type: application/json"

# Combined parameters
curl -X GET "http://localhost:5000/api/blogs/blogauthor?page=1&limit=3&search=first&sortBy=title&sortOrder=ASC" \
  -H "Content-Type: application/json"

# Test error cases
curl -X GET "http://localhost:5000/api/blogs/nonexistentuser" \
  -H "Content-Type: application/json"

curl -X GET "http://localhost:5000/api/blogs/invalid-username!" \
  -H "Content-Type: application/json"

# ===========================================
# Response Format
# ===========================================

# The response will include:
# {
#   "success": true,
#   "data": {
#     "author": {
#       "id": 10,
#       "firstName": "Blog",
#       "lastName": "Author",
#       "username": "blogauthor",
#       "profilePicture": null
#     },
#     "blogs": [
#       {
#         "id": 23,
#         "title": "My First Blog Post",
#         "slug": "my-first-blog-post-22",
#         "content": "This is the content...",
#         "authorId": 10,
#         "coverImage": "https://example.com/cover-image.jpg",
#         "published": true,
#         "createdAt": "2025-10-25T13:13:26.868Z",
#         "updatedAt": "2025-10-25T13:13:26.868Z",
#         "author": { ... },
#         "commentCount": 1,
#         "likeCount": 1
#       }
#     ],
#     "pagination": {
#       "currentPage": 1,
#       "totalPages": 5,
#       "totalItems": 23,
#       "itemsPerPage": 10,
#       "hasNextPage": true,
#       "hasPrevPage": false
#     }
#   }
# }

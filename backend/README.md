# OOP Lab Products API

A production-ready Express.js API that returns product details with their features from your existing MySQL database. Fully containerized with Docker support.

## 🏗️ Project Structure

```
src/
├── config/
│   ├── database.js      # Database configuration
│   └── index.js         # Application configuration
├── controllers/
│   ├── productController.js  # Products controller (CRUD operations)
│   └── userController.js     # User controller (Auth & Profile)
├── middleware/
│   ├── auth.js          # JWT & Google OAuth authentication
│   ├── errorHandler.js  # Error handling & logging
│   ├── index.js         # Middleware setup
│   └── validation.js    # Input validation
├── models/
│   ├── Product.js       # Product model
│   ├── P_Features.js    # Features model
│   ├── User.js          # User model
│   └── index.js         # Model associations
├── routes/
│   ├── products.js      # Products routes (with validation)
│   └── auth.js          # Authentication routes
└── server.js            # Main server file
```

## 📊 Database Tables

### USERS Table
- `id` (Primary Key, Auto Increment)
- `first_name` (First Name)
- `last_name` (Last Name)
- `email` (Email Address, Unique)
- `username` (Username, Unique, 3-50 characters, alphanumeric + underscore)
- `password` (Hashed Password)
- `date_of_birth` (Date of Birth)
- `nationality` (Nationality)
- `phone_number` (Phone Number)
- `profile_picture` (Profile Picture URL)
- `google_id` (Google OAuth ID, Unique)
- `is_email_verified` (Email Verification Status)
- `is_active` (Account Status)
- `last_login` (Last Login Timestamp)
- `created_at` (Creation Timestamp)
- `updated_at` (Update Timestamp)

## 🚀 Getting Started

### Option 1: Docker (Recommended)

**Prerequisites:**
- Docker Desktop installed and running

**Quick Start:**
```bash
# Windows
build.bat run

# Linux/macOS
chmod +x build.sh
./build.sh run
```

**Manual Docker:**
```bash
# Build image
docker build -t ooplab-backend-api .

# Run container
docker run -d --name ooplab-backend-api -p 5000:5000 --env-file .env ooplab-backend-api

# View logs
docker logs -f ooplab-backend-api
```

### Option 2: Manual Setup

**Prerequisites:**
- Node.js 18+
- MySQL 8.0+

**Steps:**
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   ```bash
   # Windows
   setup-env.bat
   
   # Linux/macOS
   chmod +x setup-env.sh
   ./setup-env.sh
   ```

3. **Setup Database**
   ```bash
   npm run setup:db
   ```

4. **Setup Blog Tables**
   ```bash
   npm run setup:blogs
   ```

5. **Add Username Field (if upgrading existing database)**
   ```bash
   npm run migrate:username
   ```

6. **Start the Server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

7. **Test the API**
   ```bash
   # Test products API
   npm test
   
   # Test authentication API
   npm run test:auth
   
   # Test Google OAuth integration
   npm run test:google
   
   # Test username functionality
   npm run test:username
   
   # Test blog API
   npm run test:blogs
   ```

8. **Configure Google OAuth (Optional)**
   ```bash
   # Edit .env file and uncomment Google OAuth settings
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

## 📚 API Endpoints

### Blog Endpoints

#### GET /api/blogs/list
Get all published blogs with pagination, search, and sorting.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in title and content
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): ASC or DESC (default: DESC)
- `authorId` (optional): Filter by author ID

**Response:**
```json
{
  "success": true,
  "data": {
    "blogs": [
      {
        "id": 1,
        "title": "My First Blog Post",
        "slug": "my-first-blog-post",
        "content": "This is the content...",
        "coverImage": "https://example.com/cover.jpg",
        "published": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "author": {
          "id": 1,
          "firstName": "John",
          "lastName": "Doe",
          "username": "johndoe",
          "profilePicture": "https://example.com/profile.jpg"
        },
        "commentCount": 5,
        "likeCount": 12
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### GET /api/blogs/:username/:slug
Get blog by username and slug (for SSR URL structure: baseURL/blogs/Username/BlogName).

**Response:**
```json
{
  "success": true,
  "data": {
    "blog": {
      "id": 1,
      "title": "My First Blog Post",
      "slug": "my-first-blog-post",
      "content": "This is the content...",
      "coverImage": "https://example.com/cover.jpg",
      "published": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "author": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "username": "johndoe",
        "profilePicture": "https://example.com/profile.jpg"
      },
      "comments": [
        {
          "id": 1,
          "content": "Great post!",
          "createdAt": "2024-01-15T11:00:00.000Z",
          "author": {
            "id": 2,
            "firstName": "Jane",
            "lastName": "Smith",
            "username": "janesmith"
          },
          "replies": []
        }
      ],
      "likeCount": 12,
      "userLiked": false,
      "commentCount": 5
    }
  }
}
```

#### POST /api/blogs
Create new blog (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "My New Blog Post",
  "content": "This is the content of my blog post...",
  "coverImage": "https://example.com/cover.jpg",
  "published": true
}
```

#### PUT /api/blogs/:id
Update blog (requires authentication, author only).

**Headers:**
```
Authorization: Bearer <token>
```

#### DELETE /api/blogs/:id
Delete blog (requires authentication, author only).

**Headers:**
```
Authorization: Bearer <token>
```

#### POST /api/blogs/:id/like
Like/Unlike blog (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

#### GET /api/blogs/:blogId/comments
Get comments for a blog.

#### POST /api/blogs/:blogId/comments
Create comment (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "This is a great post!",
  "parentId": null
}
```

#### PUT /api/blogs/comments/:commentId
Update comment (requires authentication, author only).

#### DELETE /api/blogs/comments/:commentId
Delete comment (requires authentication, author only).

### Product Endpoints

#### GET /api/products
Returns all products with their features. Supports pagination, search, and sorting.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in name and description
- `sortBy` (optional): Sort field (default: PID)
- `sortOrder` (optional): ASC or DESC (default: ASC)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "PID": 1,
        "NAME": "FitFuel-Energize Your Fitness Journey",
        "P_URL": "https://fitfuel.ooplab.org",
        "DESCRIPTION": "FitFuel is your AI-powered personal trainer and di...",
        "LOGO": "https://fitfuel.ooplab.org/fitfuel_logo.jpg",
        "features": [
          {
            "FID": 1,
            "DESCRIPTION": "AI Workout Tracking"
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### GET /api/products/:id
Returns a single product by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "PID": 1,
      "NAME": "FitFuel-Energize Your Fitness Journey",
      "P_URL": "https://fitfuel.ooplab.org",
      "DESCRIPTION": "FitFuel is your AI-powered personal trainer and di...",
      "LOGO": "https://fitfuel.ooplab.org/fitfuel_logo.jpg",
      "features": [
        {
          "FID": 1,
          "DESCRIPTION": "AI Workout Tracking"
        }
      ]
    }
  }
}
```

### POST /api/products
Creates a new product with features.

**Request Body:**
```json
{
  "NAME": "New Product",
  "P_URL": "https://example.com",
  "DESCRIPTION": "Product description",
  "LOGO": "https://example.com/logo.jpg",
  "features": [
    {
      "DESCRIPTION": "Feature 1"
    },
    {
      "DESCRIPTION": "Feature 2"
    }
  ]
}
```

### PUT /api/products/:id
Updates an existing product.

### DELETE /api/products/:id
Deletes a product and its associated features.

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456
}
```

## 🔐 Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "password": "password123",
  "dateOfBirth": "1990-01-01",
  "nationality": "American",
  "phoneNumber": "+1234567890",
  "profilePicture": "https://example.com/profile.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "isActive": true,
      "isEmailVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### GET /api/auth/google
Initiate Google OAuth login. Redirects to Google's OAuth consent screen.

### GET /api/auth/google/callback
Google OAuth callback endpoint. Handles the OAuth response and redirects to frontend.

### GET /api/auth/profile
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

### PUT /api/auth/profile
Update current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "Johnny",
  "username": "johnny_doe",
  "nationality": "Canadian",
  "phoneNumber": "+1987654321"
}
```

### POST /api/auth/change-password
Change user password (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

### POST /api/auth/deactivate
Deactivate user account (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

## 🔧 Configuration

### Environment Variables
```env
# Database Configuration
DB_HOST=srv659.hstgr.io
DB_NAME=u647222294_OOPLab
DB_USER=u647222294_AnyUser
DB_PASSWORD=LafdPbtA2s[6
DB_PORT=3306

# Server Configuration
PORT=4000
NODE_ENV=development
```

## 🐳 Docker Support

### Available Docker Files
- `Dockerfile` - Development and basic production
- `Dockerfile.prod` - Production-optimized with multi-stage build
- `docker-compose.yml` - Full stack with API, MySQL, and Nginx
- `nginx.conf` - Reverse proxy configuration

### Build Scripts
- `build.bat` - Windows build script
- `build.sh` - Linux/macOS build script

### Docker Commands
```bash
# Build and run
build.bat run          # Windows
./build.sh run         # Linux/macOS

# View logs
build.bat logs
./build.sh logs

# Test API
build.bat test
./build.sh test

# Clean up
build.bat clean
./build.sh clean
```

### Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🛡️ Features

- **Docker Ready**: Fully containerized with production optimizations
- **Database Integration**: Works with your existing MySQL tables
- **Error Handling**: Comprehensive error logging and handling
- **CORS Support**: Cross-origin resource sharing enabled
- **Security**: Helmet security headers, rate limiting
- **Logging**: Winston-based structured logging
- **Health Checks**: Built-in health monitoring
- **Production Ready**: Optimized for deployment

## 📝 Usage Examples

### Using curl
```bash
# Get all products
curl http://localhost:4000/api/products

# Health check
curl http://localhost:4000/api/health
```

### Using JavaScript/Fetch
```javascript
// Get all products
fetch('http://localhost:4000/api/products')
  .then(response => response.json())
  .then(data => {
    console.log('Products:', data.data.products);
    data.data.products.forEach(product => {
      console.log(`Product: ${product.NAME}`);
      console.log(`Features: ${product.features.length}`);
    });
  });
```

## 🚨 Troubleshooting

### Database Connection Issues
- Verify your database credentials in `.env`
- Ensure MySQL server is running
- Check if the database and tables exist

### Port Already in Use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

## 📄 License

This project is licensed under the MIT License.
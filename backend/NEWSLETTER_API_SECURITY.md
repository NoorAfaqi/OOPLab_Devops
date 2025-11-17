# Newsletter API Security

## 🔒 Security Overview

The newsletter sending API is **STRICTLY** protected and can only be accessed by users with admin privileges.

## Protection Layers

### 1. Route-Level Protection
```
POST /api/subscribers/send-newsletter
```

**Middleware Stack:**
- `authenticate` - Validates JWT token
- `adminOnly` - Verifies user has admin role

### 2. Controller-Level Check
Additional admin verification inside the controller function:
```javascript
if (!req.user || req.user.role !== 'admin') {
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin privileges required.'
  });
}
```

### 3. User Role Verification
The `authenticate` middleware fetches fresh user data from the database to ensure the role field is always up-to-date.

## Authentication Flow

1. **Token Validation**: JWT token is verified
2. **User Lookup**: Fresh user data is fetched from database
3. **Role Check**: User role must be 'admin'
4. **Request Processing**: Only if all checks pass

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication failed. Please log in again."
}
```

### 403 Forbidden (Not Admin)
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

## Testing Admin Access

To test if admin access is working:

```bash
# Get your JWT token after logging in
curl -X POST http://localhost:5000/api/subscribers/send-newsletter \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Newsletter",
    "html": "<h1>Test Content</h1>"
  }'
```

**Expected Result:**
- If admin: Success (200 OK)
- If not admin: 403 Forbidden

## Current Admin User

- **ID**: 14
- **Email**: noorafaqi@ooplab.org
- **Role**: admin


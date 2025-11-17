# Subscribers API Documentation

## Overview

The Subscribers API allows users to subscribe to the OOPLab newsletter and receive confirmation emails. This API manages the SUBSCRIBERS table in your database.

## Setup

### 1. Database Setup

Run the migration to create the SUBSCRIBERS table:

```bash
npm run setup:subscribers
```

Or manually execute the SQL file:

```sql
mysql -u your_username -p your_database < create_subscribers_table.sql
```

### 2. Environment Variables

Add the following SMTP configuration to your `.env` file:

```env
# SMTP Configuration for Email (Hostinger)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=subscribe@ooplab.org
SMTP_PASS=QwertyAsdf123$
```

**Note:** These are the configured credentials for Hostinger SMTP. Make sure your `.env` file is in the `ooplab-backend-express` folder root.

## API Endpoints

### 1. Subscribe to Newsletter

**Endpoint:** `POST /api/subscribers`

**Description:** Subscribe an email to the OOPLab newsletter

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully subscribed to OOPLab newsletter",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "subscribedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (Already Subscribed):**
```json
{
  "success": false,
  "message": "This email is already subscribed"
}
```

**Response (Invalid Email):**
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

---

### 2. Get All Subscribers (Admin)

**Endpoint:** `GET /api/subscribers`

**Description:** Get all subscribers with pagination

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (default: subscribedAt)
- `sortOrder` (optional): Sort order - ASC or DESC (default: DESC)

**Example:**
```
GET /api/subscribers?page=1&limit=20&sortBy=subscribedAt&sortOrder=DESC
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscribers": [
      {
        "id": 1,
        "email": "user@example.com",
        "subscribedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

### 3. Unsubscribe

**Endpoint:** `POST /api/subscribers/unsubscribe`

**Description:** Unsubscribe an email from the OOPLab newsletter

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully unsubscribed from OOPLab newsletter"
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "message": "Email not found in subscribers list"
}
```

---

## Email Configuration

### Current Setup (Hostinger)

The email service is currently configured to use Hostinger's SMTP:

- **Host:** smtp.hostinger.com
- **Port:** 587 (STARTTLS)
- **Username:** subscribe@ooplab.org
- **Authentication:** Required (username/password)

### Testing Email Configuration

To test if the email service is working correctly, you can:

1. Check server logs on startup (should show "Email service is ready")
2. Subscribe a test email via the API
3. Check the test email's inbox (and spam folder)

### Changing Email Provider

If you need to use a different SMTP provider, update your `.env` file:

```env
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=your-email@yourprovider.com
SMTP_PASS=your-password
```

**Note:** Make sure your email provider allows SMTP access and that your credentials are correct.

## Testing

### Test Subscription (using curl)

```bash
curl -X POST http://localhost:5000/api/subscribers \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Test with Node.js

Create a test file `test-subscribers.js`:

```javascript
const axios = require('axios');

async function testSubscription() {
  try {
    const response = await axios.post('http://localhost:5000/api/subscribers', {
      email: 'test@example.com'
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

testSubscription();
```

## Database Structure

The SUBSCRIBERS table has the following structure:

```sql
CREATE TABLE SUBSCRIBERS (
  id INT AUTO_INCREMENT PRIMARY KEY,
  EMAIL VARCHAR(255) NOT NULL UNIQUE,
  SUBSCRIBED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Features

- ✅ Email validation
- ✅ Duplicate email prevention
- Automatic welcome email
- ✅ Pagination support
- ✅ Sorting capabilities
- ✅ Admin endpoint for viewing all subscribers
- ✅ Unsubscribe functionality
- ✅ Graceful error handling
- ✅ Email delivery tracking

## Notes

- The email service uses Nodemailer
- Subscribers automatically receive a welcome email
- Email sending failures don't block subscription (graceful degradation)
- All emails are sent in HTML and plain text format
- The API is currently public (add authentication if needed for admin endpoints)

## Troubleshooting

### Email Not Sending

1. Check SMTP credentials in `.env`
2. Verify SMTP port (587 for TLS, 465 for SSL)
3. Check spam folder
4. Ensure App Password is used for Gmail
5. Check server logs for detailed error messages

### Database Connection Issues

1. Verify database credentials in `.env`
2. Ensure the database exists
3. Check database user permissions
4. Run the setup script: `npm run setup:subscribers`

## License

MIT © OOPLab.org


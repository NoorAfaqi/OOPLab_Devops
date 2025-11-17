# Contact API Documentation

This API handles contact form submissions from the website.

## Setup

### 1. Database Migration

Run the following command to create the contacts table:

```bash
npm run setup:contact
```

Or manually run:

```bash
mysql -u your_username -p your_database < migrations/create_contacts_table.sql
```

### 2. Environment Variables

The API uses the same SMTP configuration as the Subscribers API. Make sure these are set in your `.env` file:

```env
# SMTP Configuration for Email (Hostinger)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=subscribe@ooplab.org
SMTP_PASS=your_password_here
```

## API Endpoints

### POST /api/contact

Submit a contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Example Corp",  // Optional
  "subject": "web-development",
  "message": "I need help with..."
}
```

**Required Fields:**
- `name` (string): Full name (2-255 characters)
- `email` (string): Valid email address
- `subject` (string): Subject of inquiry (2-255 characters)
- `message` (string): Message content (10-5000 characters)

**Optional Fields:**
- `company` (string): Company name (2-255 characters)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Thank you for your message! We will get back to you soon.",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "web-development",
    "createdAt": "2025-01-26T12:00:00.000Z"
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Email Notifications

When a contact form is submitted:

1. **Email sent to:** `subscribe@ooplab.org` (TO)
2. **Email CC'd to:** The contactor's email address
3. **Subject:** "New Contact Form Submission: {subject}"
4. **Content:** HTML email with all contact details

## Admin Endpoints

### GET /api/contact

Get all contact submissions (with pagination).

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string, optional): Filter by status (`pending`, `read`, `replied`, `archived`)
- `sortBy` (string, default: `createdAt`)
- `sortOrder` (string, default: `DESC`)

**Example:**
```bash
curl http://localhost:5000/api/contact?page=1&limit=10&status=pending
```

### GET /api/contact/:id

Get a specific contact submission.

**Example:**
```bash
curl http://localhost:5000/api/contact/1
```

### PATCH /api/contact/:id/status

Update contact status.

**Request Body:**
```json
{
  "status": "read"  // Must be one of: pending, read, replied, archived
}
```

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/contact/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "replied"}'
```

## Database Schema

```sql
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('pending', 'read', 'replied', 'archived') DEFAULT 'pending',
    replied_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Test the Contact Form

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Example Corp",
    "subject": "web-development",
    "message": "I need help with building a new web application. Can you assist?"
  }'
```

## Features

- ✅ Form validation (required fields, email format, message length)
- ✅ Email notifications to subscribe@ooplab.org
- ✅ Contact receives CC of notification
- ✅ Database persistence
- ✅ Status tracking (pending, read, replied, archived)
- ✅ Pagination for admin view
- ✅ Sorting and filtering capabilities

## Notes

- The contact form does not require authentication (public endpoint)
- Admin endpoints (GET, PATCH) should have authentication middleware added for production
- Emails are sent asynchronously; failures in email sending won't prevent contact from being saved
- Contact status is automatically set to `pending` on creation
- When status is updated to `replied`, the `replied_at` timestamp is automatically set


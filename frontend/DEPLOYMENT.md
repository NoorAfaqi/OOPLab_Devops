# OOPLab Frontend - Deployment Guide

## Architecture Overview

This project follows a hybrid deployment strategy:

- **Static Pages (Hostinger)**: Home, About, Products, Contact
- **Dynamic Content (Vercel)**: Articles, API routes, Admin panel
- **Optional Backend**: Oracle VPS for heavy processing
- **Database**: MySQL on Hostinger for dynamic data

## Deployment Steps

### 1. Hostinger Deployment (Static Pages)

1. **Build for Static Export**:
   ```bash
   npm run build
   npm run export
   ```

2. **Upload to Hostinger**:
   - Upload the `out/` folder contents to your Hostinger public_html directory
   - Configure domain DNS to point to Hostinger

3. **Configure HTTPS**:
   - Enable SSL certificate in Hostinger control panel
   - Force HTTPS redirects

### 2. Vercel Deployment (Dynamic Content)

1. **Deploy API Routes**:
   ```bash
   vercel --prod
   ```

2. **Environment Variables**:
   - Set all required environment variables in Vercel dashboard
   - Configure Google Sheets API credentials
   - Set up NextAuth.js secrets

3. **Custom Domain**:
   - Configure subdomain (e.g., `blog.ooplab.org`) to point to Vercel
   - Update DNS records

### 3. Google Sheets CMS Setup

1. **Create Spreadsheet**:
   - Create a new Google Sheet
   - Add headers: ID, Title, Excerpt, Content, Author, PublishedAt, Category, ReadTime, ImageUrl

2. **API Configuration**:
   - Enable Google Sheets API in Google Cloud Console
   - Create API key with Sheets access
   - Share spreadsheet with service account

### 4. Form Integration

1. **Formspree Setup**:
   - Create account at formspree.io
   - Get form endpoint URL
   - Update environment variables

2. **Getform Alternative**:
   - Create account at getform.io
   - Configure form endpoint
   - Test form submissions

### 5. Security Configuration

1. **reCAPTCHA**:
   - Register site at google.com/recaptcha
   - Add site key to environment variables
   - Implement in contact forms

2. **JWT Tokens**:
   - Configure NextAuth.js with secure secret
   - Set up proper session management

### 6. Database Setup (Optional)

1. **MySQL on Hostinger**:
   - Create database in Hostinger control panel
   - Configure connection string
   - Set up tables for dynamic content

2. **Oracle VPS**:
   - Deploy backend services
   - Configure API endpoints
   - Set up monitoring

## Environment Variables

### Required for Production

```env
NEXTAUTH_URL=https://ooplab.org
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_SHEETS_API_KEY=your-sheets-api-key
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

### Optional

```env
DATABASE_URL=mysql://user:pass@hostinger-host:3306/db
ORACLE_VPS_URL=https://your-oracle-vps.com/api
```

## Testing Checklist

- [ ] Static pages load correctly on Hostinger
- [ ] Dynamic content loads from Vercel
- [ ] Contact forms submit successfully
- [ ] Admin authentication works
- [ ] Articles load from Google Sheets
- [ ] HTTPS is properly configured
- [ ] Mobile responsiveness works
- [ ] SEO metadata is correct
- [ ] Performance is optimized
- [ ] Security headers are in place

## Monitoring

1. **Uptime Monitoring**: Set up monitoring for both Hostinger and Vercel
2. **Error Tracking**: Implement error tracking (Sentry, LogRocket)
3. **Analytics**: Configure Google Analytics or similar
4. **Performance**: Monitor Core Web Vitals

## Backup Strategy

1. **Code**: Git repository with regular commits
2. **Content**: Google Sheets with version history
3. **Database**: Regular MySQL backups
4. **Static Files**: Hostinger backup system

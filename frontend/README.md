# OOPLab Company Website

A modern, responsive company website built with Next.js, featuring static hosting on Hostinger and dynamic content on Vercel.

## 🏗️ Architecture

- **Frontend**: Next.js 16 with TypeScript and Tailwind CSS
- **Static Hosting**: Hostinger (Home, About, Products, Contact)
- **Dynamic Content**: Vercel (Articles, API routes, Admin panel)
- **CMS**: Google Sheets for easy content management
- **Authentication**: NextAuth.js for admin access
- **Forms**: Formspree/Getform integration
- **Security**: HTTPS, reCAPTCHA, JWT tokens

## 🚀 Features

### Pages
- **Home**: Hero section, services overview, company highlights
- **About**: Company mission, team information, values
- **Products**: Service offerings with pricing and features
- **Articles**: Dynamic blog powered by Google Sheets CMS
- **Contact**: Interactive contact form with validation

### Technical Features
- Responsive design with dark mode support
- SEO optimized with proper metadata
- Fast loading with static generation
- Secure admin authentication
- Real-time form submissions
- Dynamic content management

## 📦 Tech Stack

- **Framework**: Next.js 16.0.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth.js
- **CMS**: Google Sheets API
- **Forms**: React Hook Form
- **Animations**: Framer Motion
- **HTTP Client**: Axios

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Cloud Console account (for Sheets API)
- Formspree/Getform account (for forms)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ooplab-frontend-next
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Sheets API
GOOGLE_SHEETS_API_KEY=your-sheets-api-key
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# Form Handling
FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id

# Security
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

## 📁 Project Structure

```
src/
├── app/
│   ├── about/           # About page
│   ├── articles/        # Articles/blog page
│   ├── api/             # API routes
│   │   ├── articles/    # Articles API
│   │   ├── contact/     # Contact form API
│   │   ├── products/    # Products API
│   │   └── auth/       # NextAuth.js routes
│   ├── components/      # Reusable components
│   │   ├── Navigation.tsx
│   │   ├── AuthButton.tsx
│   │   └── AuthProvider.tsx
│   ├── contact/         # Contact page
│   ├── products/        # Products page
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── lib/
│   └── googleSheets.ts  # Google Sheets CMS integration
└── types/               # TypeScript type definitions
```

## 🚀 Deployment

### Static Export (Hostinger)

```bash
npm run build
npm run export
```

Upload the `out/` folder contents to your Hostinger public_html directory.

### Dynamic Content (Vercel)

```bash
vercel --prod
```

Configure environment variables in Vercel dashboard.

## 📝 Content Management

### Adding Articles

1. **Via Google Sheets**:
   - Open your configured Google Sheet
   - Add new row with article data
   - Articles appear automatically on the website

2. **Via Admin Panel**:
   - Sign in with admin credentials
   - Use the admin interface to add/edit articles

### Google Sheets Format

| ID | Title | Excerpt | Content | Author | PublishedAt | Category | ReadTime | ImageUrl |
|----|-------|---------|---------|--------|-------------|----------|----------|----------|
| 1 | Article Title | Short description | Full content | Author Name | 2024-01-15 | Web Dev | 5 | /image.jpg |

## 🔒 Security

- HTTPS enforcement
- reCAPTCHA protection on forms
- JWT token authentication
- Input validation and sanitization
- Security headers configuration
- Rate limiting on API routes

## 📊 Performance

- Static site generation for fast loading
- Image optimization
- Code splitting
- Lazy loading
- CDN integration
- Core Web Vitals optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Email: noorafaqi@ooplab.org
- Website: https://ooplab.org
- Documentation: [Deployment Guide](./DEPLOYMENT.md)
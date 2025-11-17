# Blog Analytics System

A comprehensive analytics system for tracking blog views, user engagement, and detailed insights for blog authors.

## 🚀 Features

### 📊 **View Tracking**
- **Automatic view tracking** when users visit blog posts
- **Unique view counting** based on IP address, session, and user ID
- **Duplicate view prevention** (30-minute cooldown)
- **Real-time analytics** updates

### 📈 **Time-based Filtering**
- **Last 24 Hours** - Recent activity
- **Last 7 Days** - Weekly trends
- **Last Month** - Monthly performance
- **Last Year** - Annual insights
- **All Time** - Complete lifetime data

### 🔍 **Detailed Analytics**
- **Views Over Time** - Line charts showing daily view trends
- **Device Analytics** - Mobile, Desktop, Tablet breakdown
- **Browser Distribution** - Chrome, Firefox, Safari, Edge, etc.
- **Operating System** - Windows, macOS, Linux, Android, iOS
- **Referral Sources** - Top referring websites and domains
- **Geographic Data** - Country and city-level insights
- **Recent Views** - Detailed view history with user info

### 🛡️ **Security & Privacy**
- **Author-only access** - Analytics visible only to blog authors
- **IP anonymization** - Privacy-focused tracking
- **Session management** - Secure view counting
- **Rate limiting** - Prevents abuse

## 🏗️ **Architecture**

### **Backend Components**

#### **Models**
- `BlogAnalytics` - Aggregated analytics data per blog
- `BlogView` - Individual view records with detailed metadata

#### **API Endpoints**
```
POST /api/blogs/:blogId/track-view          # Track a blog view (public)
GET  /api/blogs/:blogId/analytics          # Get blog analytics (author only)
GET  /api/blogs/analytics/user             # Get user's blogs analytics (authenticated)
```

#### **Database Schema**
```sql
-- Aggregated analytics per blog
CREATE TABLE blog_analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blog_id INT NOT NULL,
  view_count INT DEFAULT 0,
  unique_view_count INT DEFAULT 0,
  referral_data JSON,
  device_data JSON,
  location_data JSON,
  last_viewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Individual view records
CREATE TABLE blog_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blog_id INT NOT NULL,
  user_id INT DEFAULT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(500),
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(50),
  os VARCHAR(50),
  session_id VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **Frontend Components**

#### **Analytics Dashboard** (`/blogs/[username]/analytics`)
- **Overview Tab** - All blogs performance summary
- **Individual Blog Tab** - Detailed analytics for specific blog
- **Interactive Charts** - Recharts-based visualizations
- **Time Filters** - Easy period selection
- **Real-time Updates** - Live data refresh

#### **View Tracking Integration**
- **Automatic tracking** on blog post visits
- **Non-intrusive** - No impact on user experience
- **Error handling** - Graceful failure without affecting page load

## 🚀 **Setup Instructions**

### **1. Database Migration**
```bash
# Run the analytics setup script
cd OOPLab-Backend-EXPRRESS/ooplab-backend-express
node setup-analytics.js
```

### **2. Install Frontend Dependencies**
```bash
# Install charting library
cd OOPLab-Frontend-NEXT/ooplab-frontend-next
npm install recharts
```

### **3. Environment Variables**
Ensure your backend has the required database configuration:
```env
DB_HOST=localhost
DB_NAME=ooplab
DB_USER=root
DB_PASSWORD=your_password
DB_PORT=3306
```

## 📱 **Usage Guide**

### **For Blog Authors**

#### **Accessing Analytics**
1. Navigate to your blog profile: `/blogs/[your-username]`
2. Click the **Analytics** button (📊) on any blog card
3. Or visit directly: `/blogs/[your-username]/analytics`

#### **Understanding the Dashboard**

**Overview Tab:**
- **Summary Stats** - Total views, unique views, blogs count, unique rate
- **Blog Performance Cards** - Individual blog statistics
- **Quick Actions** - View analytics or visit blog

**Individual Blog Tab:**
- **Key Metrics** - Views, unique views, comments, likes
- **Views Over Time** - Line chart showing daily trends
- **Device Breakdown** - Pie chart of device types
- **Referral Sources** - Bar chart of top referrers
- **Browser Distribution** - Pie chart of browser usage
- **Recent Views Table** - Detailed view history

#### **Time Filtering**
- Use the dropdown to select time periods
- **Last 24 Hours** - Recent activity
- **Last 7 Days** - Weekly performance
- **Last Month** - Monthly trends
- **Last Year** - Annual insights
- **All Time** - Complete data

### **For Developers**

#### **API Usage Examples**

**Track a Blog View:**
```javascript
import { trackBlogView } from '@/lib/api';

// Track view when blog loads
await trackBlogView(blogId);
```

**Get Blog Analytics:**
```javascript
import { getBlogAnalytics } from '@/lib/api';

// Get analytics for specific blog
const analytics = await getBlogAnalytics(blogId, '7d', token);
```

**Get User's Blogs Analytics:**
```javascript
import { getUserBlogsAnalytics } from '@/lib/api';

// Get analytics for all user's blogs
const userAnalytics = await getUserBlogsAnalytics('total', token);
```

## 📊 **Analytics Data Structure**

### **Blog Analytics Response**
```typescript
interface BlogAnalytics {
  blog: {
    id: number;
    title: string;
    slug: string;
    createdAt: string;
  };
  timeFilter: string;
  overview: {
    totalViews: number;
    uniqueViews: number;
    commentsCount: number;
    likesCount: number;
    engagementRate: string;
  };
  viewsOverTime: Array<{
    date: string;
    views: number;
  }>;
  referralData: Array<{
    domain: string;
    url: string;
    count: number;
  }>;
  deviceData: Array<{
    type: string;
    count: number;
  }>;
  browserData: Array<{
    browser: string;
    count: number;
  }>;
  osData: Array<{
    os: string;
    count: number;
  }>;
  countryData: Array<{
    country: string;
    count: number;
  }>;
  recentViews: Array<{
    id: number;
    user: User | null;
    ipAddress: string;
    location: string;
    device: string;
    browser: string;
    os: string;
    viewedAt: string;
  }>;
}
```

## 🔧 **Customization**

### **Adding New Metrics**
1. **Backend**: Update `analyticsController.js` to include new data
2. **Frontend**: Add new chart components to analytics dashboard
3. **Database**: Add new fields to `blog_views` table if needed

### **Custom Time Filters**
```javascript
// Add new time filter in analyticsController.js
case 'custom':
  startDate = new Date(customStartDate);
  endDate = new Date(customEndDate);
  break;
```

### **Additional Chart Types**
```javascript
// Add new chart components using Recharts
import { AreaChart, Area } from 'recharts';

<AreaChart data={data}>
  <Area type="monotone" dataKey="views" stroke="#007AFF" fill="#007AFF" />
</AreaChart>
```

## 🛠️ **Troubleshooting**

### **Common Issues**

**Views Not Tracking:**
- Check if `trackBlogView` is called on blog load
- Verify API endpoint is accessible
- Check browser console for errors

**Analytics Not Loading:**
- Ensure user is authenticated
- Verify user is the blog author
- Check API response for error messages

**Charts Not Displaying:**
- Verify Recharts is installed
- Check data format matches chart expectations
- Ensure responsive container has proper dimensions

### **Performance Optimization**

**Database Indexing:**
```sql
-- Add indexes for better query performance
CREATE INDEX idx_blog_views_blog_created ON blog_views(blog_id, created_at);
CREATE INDEX idx_blog_views_ip_address ON blog_views(ip_address);
```

**Caching:**
- Consider Redis caching for frequently accessed analytics
- Implement data aggregation for large datasets
- Use pagination for recent views table

## 🔮 **Future Enhancements**

### **Planned Features**
- **Real-time Analytics** - WebSocket-based live updates
- **Email Reports** - Weekly/monthly analytics summaries
- **A/B Testing** - Compare blog performance
- **Advanced Segmentation** - Filter by user demographics
- **Export Functionality** - Download analytics as CSV/PDF
- **API Rate Limiting** - Prevent analytics abuse
- **Geographic Heatmaps** - Visual location data
- **Social Media Integration** - Track social referrals

### **Technical Improvements**
- **Data Archiving** - Move old data to cold storage
- **Machine Learning** - Predictive analytics
- **Real-time Processing** - Stream processing for views
- **Advanced Caching** - Multi-layer caching strategy

## 📄 **License**

This analytics system is part of the OOPLab project and follows the same licensing terms.

---

**Need Help?** Check the main project documentation or create an issue for specific analytics-related questions.

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Divider,
  Stack,
} from "@mui/material";
import {
  Dashboard,
  Analytics,
  DarkMode,
  LightMode,
  Logout,
  TrendingUp,
  BarChart,
  PieChart,
  People,
} from "@mui/icons-material";
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Footer from "../../components/Footer";

interface BlogAnalytics {
  totalViews: number;
  totalLikes: number;
  averageViewsPerBlog: number;
  totalBlogs: number;
  changes?: {
    views?: {
      current: number;
      previous: number;
      change: number;
      period: string;
    };
    likes?: {
      current: number;
      previous: number;
      change: number;
      period: string;
    };
  };
}

interface SubscriberStats {
  total: number;
  growth: number;
}

interface ContactStats {
  total: number;
  pending: number;
  replied: number;
  archived: number;
}

interface UserStats {
  total: number;
  newToday: number;
  newThisWeek: number;
  newThisMonth: number;
  newThisYear: number;
  totalVisits: number;
  changes?: {
    total?: {
      current: number;
      previous: number;
      change: number;
      period: string;
    };
  };
}

type TimeFilter = 'day' | 'week' | 'month' | 'year' | 'all';

// Line graph component for analytics using recharts
const LineGraphComponent = ({ 
  data, 
  color, 
  label, 
  darkMode 
}: { 
  data: number[]; 
  color: string; 
  label: string;
  darkMode: boolean;
}) => {
  // Convert array to chart data format
  const chartData = data.map((value, index) => ({
    name: index + 1,
    value: value
  }));
  
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '0.7rem', mb: 1.5, display: 'block' }}>
        {label}
      </Typography>
      <Box sx={{ height: 220, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10 }}
              stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            />
            <YAxis 
              tick={{ fill: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10 }}
              stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                borderRadius: '8px'
              }}
              labelStyle={{ color: darkMode ? '#ffffff' : '#000000' }}
              itemStyle={{ color: darkMode ? '#ffffff' : '#000000' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              fill={color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default function AdminAnalytics() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminDarkMode');
      return saved === 'true';
    }
    return false;
  });

  const [blogAnalytics, setBlogAnalytics] = useState<BlogAnalytics | null>(null);
  const [subscriberStats, setSubscriberStats] = useState<SubscriberStats | null>(null);
  const [contactStats, setContactStats] = useState<ContactStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [trendsData, setTrendsData] = useState<{
    views: number[];
    likes: number[];
    users: number[];
    subscribers: number[];
    period: string;
  } | null>(null);
  
  // Calculate default array size based on time filter
  const getDefaultArraySize = () => {
    switch (timeFilter) {
      case 'day': return 24;
      case 'week': return 7;
      case 'month': return 30;
      case 'year': return 12;
      case 'all': return 12;
      default: return 30;
    }
  };
  
  // Calculate percentage changes from API data
  const statChanges = {
    views: { 
      current: blogAnalytics?.totalViews || 0, 
      change: (blogAnalytics as any)?.changes?.views?.change || 0,
      period: (blogAnalytics as any)?.changes?.views?.period || 'vs last period' 
    },
    likes: { 
      current: blogAnalytics?.totalLikes || 0, 
      change: (blogAnalytics as any)?.changes?.likes?.change || 0,
      period: (blogAnalytics as any)?.changes?.likes?.period || 'vs last period' 
    },
    users: { 
      current: userStats?.total || 0, 
      change: (userStats as any)?.changes?.total?.change || 0,
      period: (userStats as any)?.changes?.total?.period || 'vs last period' 
    },
    subscribers: { 
      current: subscriberStats?.total || 0, 
      change: subscriberStats?.growth || 0,
      period: 'growth rate' 
    },
  };

  useEffect(() => {
    localStorage.setItem('adminDarkMode', darkMode.toString());
  }, [darkMode]);
  
  // Listen for dark mode changes from other admin pages
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('adminDarkMode');
      if (saved !== null) {
        setDarkMode(saved === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen to custom events for same-tab updates
    const interval = setInterval(() => {
      const saved = localStorage.getItem('adminDarkMode');
      if (saved !== null) {
        const shouldBeDark = saved === 'true';
        if (shouldBeDark !== darkMode) {
          setDarkMode(shouldBeDark);
        }
      }
    }, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/');
      return;
    }

    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, authLoading, router]);
  
  // Graph state
  const [graphMetric, setGraphMetric] = useState<'views' | 'likes' | 'users' | 'subscribers'>('views');

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const usersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/users/stats`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUserStats(usersData.data);
        }
      } catch (err) {
        console.error('User stats fetch error:', err);
      }
    };

    fetchUserStats();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');

        // Map frontend timeFilter to backend query params
        const rangeMap: Record<string, string> = {
          'day': '24h',
          'week': '7d',
          'month': '30d',
          'year': '1y',
          'all': 'total'
        };
        
        const timeFilterParam = rangeMap[timeFilter] || 'total';

        const blogsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/blogs/analytics?timeFilter=${timeFilterParam}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (blogsResponse.ok) {
          const blogsData = await blogsResponse.json();
          setBlogAnalytics(blogsData.data);
        }

        const subscribersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/subscribers`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (subscribersResponse.ok) {
          const subscribersData = await subscribersResponse.json();
          const total = subscribersData.data?.subscribers?.length || 0;
          setSubscriberStats({ total, growth: 5.2 });
        }

        const contactsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/contact`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          const contacts = contactsData.data?.contacts || [];
          const total = contacts.length;
          const pending = contacts.filter((c: any) => c.status === 'pending').length;
          const replied = contacts.filter((c: any) => c.status === 'replied').length;
          const archived = contacts.filter((c: any) => c.status === 'archived').length;
          setContactStats({ total, pending, replied, archived });
        }

      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeFilter]);
  
  // Separate useEffect for trends to avoid re-fetching analytics on time filter change
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        // Map frontend timeFilter to backend range parameter
        const rangeMap: Record<string, string> = {
          'day': 'day',
          'week': 'week',
          'month': 'month',
          'year': 'year',
          'all': 'month' // Show last month for 'all'
        };
        
        const trendsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/blogs/analytics/trends?range=${rangeMap[timeFilter]}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (trendsResponse.ok) {
          const trends = await trendsResponse.json();
          setTrendsData(trends.data);
        }
      } catch (err) {
        console.error('Trends fetch error:', err);
      }
    };

    fetchTrends();
  }, [timeFilter]);

  if (!user || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: darkMode ? '#121212' : '#fafafa' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Skeleton variant="rectangular" height={400} />
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        backgroundColor: darkMode ? '#121212' : '#f5f5f5',
        animation: 'fadeIn 0.3s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      }}
    >
      {/* Minimal Header - Same as admin dashboard */}
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: '#007AFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Analytics sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', color: darkMode ? '#ffffff' : '#000000' }}>
                  Admin Analytics
                </Typography>
                <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.75rem' }}>
                  OOPLab.org
                </Typography>
              </Box>
            </Box>
            
            {/* Navigation Tabs */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                onClick={() => router.push('/admin')}
                startIcon={<Dashboard />}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  fontWeight: 500,
                  color: darkMode ? '#ffffff' : '#000000',
                  border: '1px solid',
                  borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  },
                }}
              >
                Dashboard
              </Button>
              <Button
                startIcon={<Analytics />}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  fontWeight: 500,
                  backgroundColor: '#007AFF',
                  color: '#ffffff',
                  border: '1px solid',
                  borderColor: '#007AFF',
                  '&:hover': {
                    backgroundColor: '#0056CC',
                  },
                }}
              >
                Analytics
              </Button>
            </Box>
            
            {/* Right side actions */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => setDarkMode(!darkMode)}
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'transparent',
                  color: darkMode ? '#ffffff' : '#000000',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  },
                }}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <DarkMode /> : <LightMode />}
              </IconButton>
              <Button
                onClick={logout}
                startIcon={<Logout />}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  fontWeight: 500,
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Minimal Title Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, color: darkMode ? '#ffffff' : '#000000' }}>
              Analytics Overview
            </Typography>
            <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
              Track your website performance metrics
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: '0.75rem' }}>
              Time Range:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                      border: '1px solid',
                      borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      borderRadius: 2,
                      mt: 0.5,
                    }
                  }
                }}
                sx={{
                  borderRadius: 1.5,
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
                  border: '1px solid',
                  borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '& .MuiSelect-select': {
                    py: 1.25,
                    fontSize: '0.875rem',
                    color: darkMode ? '#ffffff' : '#000000',
                  },
                  '& .MuiSelect-icon': {
                    color: darkMode ? '#ffffff' : '#000000',
                  },
                }}
              >
                <MenuItem value="day" sx={{ color: darkMode ? '#ffffff' : '#000000', '&:hover': { backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' } }}>Today</MenuItem>
                <MenuItem value="week" sx={{ color: darkMode ? '#ffffff' : '#000000', '&:hover': { backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' } }}>This Week</MenuItem>
                <MenuItem value="month" sx={{ color: darkMode ? '#ffffff' : '#000000', '&:hover': { backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' } }}>This Month</MenuItem>
                <MenuItem value="year" sx={{ color: darkMode ? '#ffffff' : '#000000', '&:hover': { backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' } }}>This Year</MenuItem>
                <MenuItem value="all" sx={{ color: darkMode ? '#ffffff' : '#000000', '&:hover': { backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' } }}>All Time</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Minimal Stat Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
          <Card
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3, backgroundColor: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BarChart sx={{ fontSize: 24, color: '#007AFF' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.75rem' }}>
                    Total Views
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1.2, color: darkMode ? '#ffffff' : '#000000' }}>
                    {(blogAnalytics?.totalViews || 0).toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    {statChanges.views.change > 0 ? (
                      <TrendingUp sx={{ fontSize: 14, color: '#34C759' }} />
                    ) : (
                      <TrendingUp sx={{ fontSize: 14, color: '#FF3B30', transform: 'rotate(180deg)' }} />
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: statChanges.views.change > 0 ? '#34C759' : '#FF3B30',
                        fontWeight: 500
                      }}
                    >
                      {statChanges.views.change > 0 ? '+' : ''}{statChanges.views.change.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3, backgroundColor: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: 'rgba(52, 199, 89, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BarChart sx={{ fontSize: 24, color: '#34C759' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.75rem' }}>
                    Total Likes
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1.2, color: darkMode ? '#ffffff' : '#000000' }}>
                    {(blogAnalytics?.totalLikes || 0).toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    {statChanges.likes.change > 0 ? (
                      <TrendingUp sx={{ fontSize: 14, color: '#34C759' }} />
                    ) : (
                      <TrendingUp sx={{ fontSize: 14, color: '#FF3B30', transform: 'rotate(180deg)' }} />
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: statChanges.likes.change > 0 ? '#34C759' : '#FF3B30',
                        fontWeight: 500
                      }}
                    >
                      {statChanges.likes.change > 0 ? '+' : ''}{statChanges.likes.change.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3, backgroundColor: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 149, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <People sx={{ fontSize: 24, color: '#FF9500' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.75rem' }}>
                    Total Users
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1.2, color: darkMode ? '#ffffff' : '#000000' }}>
                    {(userStats?.total || 0).toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    {statChanges.users.change > 0 ? (
                      <TrendingUp sx={{ fontSize: 14, color: '#34C759' }} />
                    ) : (
                      <TrendingUp sx={{ fontSize: 14, color: '#FF3B30', transform: 'rotate(180deg)' }} />
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: statChanges.users.change > 0 ? '#34C759' : '#FF3B30',
                        fontWeight: 500
                      }}
                    >
                      {statChanges.users.change > 0 ? '+' : ''}{statChanges.users.change.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
              boxShadow: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent sx={{ p: 3, backgroundColor: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: 'rgba(175, 82, 222, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BarChart sx={{ fontSize: 24, color: '#AF52DE' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.75rem' }}>
                    Subscribers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1.2, color: darkMode ? '#ffffff' : '#000000' }}>
                    {(subscriberStats?.total || 0).toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    {statChanges.subscribers.change > 0 ? (
                      <TrendingUp sx={{ fontSize: 14, color: '#34C759' }} />
                    ) : (
                      <TrendingUp sx={{ fontSize: 14, color: '#FF3B30', transform: 'rotate(180deg)' }} />
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: statChanges.subscribers.change > 0 ? '#34C759' : '#FF3B30',
                        fontWeight: 500
                      }}
                    >
                      {statChanges.subscribers.change > 0 ? '+' : ''}{statChanges.subscribers.change.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Line Graph Section */}
        <Card
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            boxShadow: 'none',
            mb: 4,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#000000' }}>
                {graphMetric === 'views' && 'Views Trend'}
                {graphMetric === 'likes' && 'Likes Trend'}
                {graphMetric === 'users' && 'New Users Trend'}
                {graphMetric === 'subscribers' && 'Subscribers Trend'}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {(['views', 'likes', 'users', 'subscribers'] as const).map((metric) => (
                  <Button
                    key={metric}
                    onClick={() => setGraphMetric(metric)}
                    size="small"
                    sx={{
                      textTransform: 'none',
                      px: 2,
                      py: 0.75,
                      borderRadius: 2,
                      backgroundColor: graphMetric === metric 
                        ? (metric === 'views' ? '#007AFF' : 
                           metric === 'likes' ? '#34C759' : 
                           metric === 'users' ? '#FF9500' : 
                           '#AF52DE')
                        : darkMode 
                          ? 'rgba(255,255,255,0.05)' 
                          : 'rgba(0,0,0,0.05)',
                      color: graphMetric === metric 
                        ? '#ffffff' 
                        : darkMode ? '#ffffff' : '#000000',
                      '&:hover': {
                        backgroundColor: graphMetric === metric 
                          ? (metric === 'views' ? '#0056CC' : 
                             metric === 'likes' ? '#2DB249' : 
                             metric === 'users' ? '#E68500' : 
                             '#9B46C6')
                          : darkMode 
                            ? 'rgba(255,255,255,0.1)' 
                            : 'rgba(0,0,0,0.1)',
                      },
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                  >
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </Button>
                ))}
              </Box>
            </Box>
            
            {graphMetric === 'views' && (
              <LineGraphComponent 
                data={trendsData?.views || Array(getDefaultArraySize()).fill(0)} 
                color="#007AFF" 
                label={`Views ${trendsData?.period || 'over time'}`}
                darkMode={darkMode}
              />
            )}
            {graphMetric === 'likes' && (
              <LineGraphComponent 
                data={trendsData?.likes || Array(getDefaultArraySize()).fill(0)} 
                color="#34C759" 
                label={`Likes ${trendsData?.period || 'over time'}`}
                darkMode={darkMode}
              />
            )}
            {graphMetric === 'users' && (
              <LineGraphComponent 
                data={trendsData?.users || Array(getDefaultArraySize()).fill(0)} 
                color="#FF9500" 
                label={`New Users ${trendsData?.period || 'over time'}`}
                darkMode={darkMode}
              />
            )}
            {graphMetric === 'subscribers' && (
              <LineGraphComponent 
                data={trendsData?.subscribers || Array(getDefaultArraySize()).fill(0)}
                color="#AF52DE" 
                label={`Subscribers ${trendsData?.period || 'over time'}`}
                darkMode={darkMode}
              />
            )}
          </CardContent>
        </Card>

        {/* Beautiful Analytics Sections */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 3 }}>
          {/* Left Column */}
          <Box>
            <Stack spacing={3}>
              {/* User Activity */}
              <Card
                sx={{
                  background: darkMode ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                  border: '1px solid',
                  borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}
              >
                <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#000000', letterSpacing: '-0.02em' }}>
                      User Activity
                    </Typography>
                    <PieChart sx={{ fontSize: 20, color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
                  </Box>
                  <Divider sx={{ mb: 4, borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
                  <Stack spacing={4}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontWeight: 500 }}>
                          Total Users
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#000000' }}>
                          {userStats?.total || 0}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: '100%',
                            background: 'linear-gradient(90deg, #007AFF, #5856D6)',
                            borderRadius: 3,
                          }}
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontWeight: 500 }}>
                          New Users ({timeFilter === 'all' ? 'All' : timeFilter})
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#34C759' }}>
                          {timeFilter === 'day' && userStats?.newToday || 
                           timeFilter === 'week' && userStats?.newThisWeek || 
                           timeFilter === 'month' && userStats?.newThisMonth || 
                           timeFilter === 'year' && userStats?.newThisYear || 
                           userStats?.total || 0}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: userStats?.total ? `${Math.min(((timeFilter === 'day' && userStats?.newToday || 
                              timeFilter === 'week' && userStats?.newThisWeek || 
                              timeFilter === 'month' && userStats?.newThisMonth || 
                              timeFilter === 'year' && userStats?.newThisYear || 
                              userStats?.total || 0) / userStats.total) * 100, 100)}%` : '0%',
                            background: 'linear-gradient(90deg, #34C759, #30D158)',
                            borderRadius: 3,
                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontWeight: 500 }}>
                          Active Visits
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#FF9500' }}>
                          {userStats?.totalVisits || 0}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: userStats?.total ? `${Math.min(((userStats?.totalVisits || 0) / userStats.total) * 100, 100)}%` : '0%',
                            background: 'linear-gradient(90deg, #FF9500, #FF6B00)',
                            borderRadius: 3,
                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>

          {/* Right Column */}
          <Box>
            <Card
              sx={{
                background: darkMode ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                border: '1px solid',
                borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 4, color: darkMode ? '#ffffff' : '#000000', letterSpacing: '-0.02em' }}>
                  Contact Messages
                </Typography>

                <Divider sx={{ mb: 4, borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

                {contactStats && (
                  <Stack spacing={4}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontWeight: 500 }}>
                          Pending
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#000000' }}>
                          {contactStats.pending} / {contactStats.total}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${contactStats.total > 0 ? (contactStats.pending / contactStats.total) * 100 : 0}%`,
                            background: 'linear-gradient(90deg, #FF9500, #FF6B00)',
                            borderRadius: 3,
                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontWeight: 500 }}>
                          Replied
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#34C759' }}>
                          {contactStats.replied} / {contactStats.total}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${contactStats.total > 0 ? (contactStats.replied / contactStats.total) * 100 : 0}%`,
                            background: 'linear-gradient(90deg, #34C759, #30D158)',
                            borderRadius: 3,
                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontWeight: 500 }}>
                          Archived
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                          {contactStats.archived} / {contactStats.total}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${contactStats.total > 0 ? (contactStats.archived / contactStats.total) * 100 : 0}%`,
                            background: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                            borderRadius: 3,
                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        />
                      </Box>
                    </Box>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
      
      {/* Footer */}
      <Footer />
    </Box>
  );
}

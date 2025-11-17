"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { getBlogAnalytics, getUserBlogsAnalytics, BlogAnalytics, UserBlogsAnalytics } from '../../../../lib/api';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Grid,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Pagination,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Analytics,
  Visibility,
  Person,
  Comment,
  Favorite,
  TrendingUp,
  Refresh,
  ArrowBack,
  OpenInNew,
  Search,
  Clear,
  ThumbUp,
  ChatBubbleOutline,
  AccessTime,
  CalendarToday,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

interface AnalyticsPageProps {
  params: Promise<{ username: string }>;
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { username } = React.use(params);
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState(0);
  const [timeFilter, setTimeFilter] = useState('total');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userBlogsAnalytics, setUserBlogsAnalytics] = useState<UserBlogsAnalytics | null>(null);
  const [selectedBlogAnalytics, setSelectedBlogAnalytics] = useState<BlogAnalytics | null>(null);
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 6; // Show 6 blogs per page
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const isOwnProfile = isAuthenticated && user?.username === username;

  // Search and pagination calculations
  const filteredBlogs = userBlogsAnalytics?.blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  const totalBlogs = filteredBlogs.length;
  const totalPages = Math.ceil(totalBlogs / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const endIndex = startIndex + blogsPerPage;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  // Reset pagination when time filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, searchQuery]);

  useEffect(() => {
    // Only fetch analytics if user is authenticated and viewing their own profile
    if (isOwnProfile && token && isAuthenticated) {
      fetchUserBlogsAnalytics();
    } else {
      // If not authenticated or not own profile, just stop loading
      setLoading(false);
    }
  }, [isOwnProfile, token, timeFilter, isAuthenticated]);

  useEffect(() => {
    if (selectedBlogId && token) {
      fetchBlogAnalytics(selectedBlogId);
    }
  }, [selectedBlogId, token, timeFilter]);

  const fetchUserBlogsAnalytics = async () => {
    // Guard: Only fetch if authenticated, is own profile, and has token
    if (!token || !isOwnProfile || !isAuthenticated) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getUserBlogsAnalytics(timeFilter, token);
      if (response.success) {
        setUserBlogsAnalytics(response.data);
      } else {
        // Only show error if it's not a 401 (authentication issue)
        if (response.message && !response.message.toLowerCase().includes('unauthorized')) {
          setError(response.message);
        }
      }
    } catch (error) {
      // Silently handle 401 errors - they're expected for unauthenticated users
      // Only log non-401 errors in development
      if (process.env.NODE_ENV === 'development' && error instanceof Error) {
        if (!error.message.includes('401') && !error.message.includes('Unauthorized')) {
          console.error('Error fetching user blogs analytics:', error);
        }
      }
      // Don't show error message for auth issues
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('Unauthorized')) {
        setError('Failed to load analytics. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogAnalytics = async (blogId: number) => {
    // Guard: Only fetch if authenticated and has token
    if (!token || !isAuthenticated) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getBlogAnalytics(blogId, timeFilter, token);
      if (response.success) {
        setSelectedBlogAnalytics(response.data);
      } else {
        // Only show error if it's not auth-related
        if (response.message && !response.message.toLowerCase().includes('unauthorized')) {
          setError(response.message);
        }
      }
    } catch (error) {
      // Silently handle auth errors in production
      if (error instanceof Error && !error.message.includes('401') && !error.message.includes('Unauthorized')) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching blog analytics:', error);
        }
        setError('Failed to load blog analytics. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTimeFilterChange = (newFilter: string) => {
    setTimeFilter(newFilter);
  };

  const handleBlogSelect = (blogId: number) => {
    setSelectedBlogId(blogId);
    setActiveTab(1);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTimeFilterLabel = (filter: string) => {
    switch (filter) {
      case '24h': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '1m': return 'Last Month';
      case '1y': return 'Last Year';
      default: return 'All Time';
    }
  };

  if (!isOwnProfile) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">
          You don't have permission to view this analytics page.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: 'background.default',
      pt: 8 // Add top padding to account for navbar
    }}>
      <VercelAnalytics />
      {/* Minimal Mac-Style Header */}
      <Box sx={{ 
        backgroundColor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 3
      }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <IconButton 
              onClick={() => router.back()}
              sx={{ 
                backgroundColor: 'background.paper',
                color: 'text.primary',
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                width: 36,
                height: 36,
                '&:hover': { 
                  backgroundColor: 'action.hover'
                },
                transition: 'all 0.15s ease'
              }}
            >
              <ArrowBack sx={{ fontSize: 18 }} />
            </IconButton>
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              fontSize: '1.5rem', 
              color: 'text.primary',
              letterSpacing: '-0.01em'
            }}>
              Analytics
            </Typography>
          </Stack>

          {/* Clean Time Filter */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="body2" sx={{ 
              fontWeight: 500, 
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}>
              Time Period
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={timeFilter}
                  onChange={(e) => handleTimeFilterChange(e.target.value)}
                  sx={{ 
                    backgroundColor: 'background.paper',
                    borderRadius: 1.5,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'text.secondary'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="1m">Last Month</MenuItem>
                  <MenuItem value="1y">Last Year</MenuItem>
                  <MenuItem value="total">All Time</MenuItem>
                </Select>
              </FormControl>
              <IconButton 
                onClick={fetchUserBlogsAnalytics} 
                disabled={loading}
                sx={{ 
                  backgroundColor: 'background.paper',
                  color: 'text.primary',
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  width: 36,
                  height: 36,
                  '&:hover': { 
                    backgroundColor: 'action.hover'
                  },
                  '&:disabled': { 
                    backgroundColor: 'action.disabled',
                    color: 'text.disabled'
                  },
                  transition: 'all 0.15s ease'
                }}
              >
                <Refresh sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Minimal Mac-Style Summary Stats */}
      {userBlogsAnalytics && (
        <Box sx={{ py: 4 }}>
          <Container maxWidth="lg">
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, 
              gap: 3 
            }}>
              <Box>
                <Card sx={{ 
                  height: '100%',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  boxShadow: 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ 
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Visibility sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 600, 
                          fontSize: '1.75rem', 
                          color: 'text.primary',
                          lineHeight: 1.2
                        }}>
                          {formatNumber(userBlogsAnalytics.summary.totalViews)}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}>
                          Total Views
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
              <Box>
                <Card sx={{
                  height: '100%',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  boxShadow: 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        backgroundColor: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Person sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{
                          fontWeight: 600,
                          fontSize: '1.75rem',
                          color: 'text.primary',
                          lineHeight: 1.2
                        }}>
                          {formatNumber(userBlogsAnalytics.summary.uniqueViews)}
                        </Typography>
                        <Typography variant="body2" sx={{
                          color: 'text.secondary',
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}>
                          Unique Views
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
              <Box>
                <Card sx={{ 
                  height: '100%',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  boxShadow: 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ 
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        backgroundColor: 'info.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Comment sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 600, 
                          fontSize: '1.75rem', 
                          color: 'text.primary',
                          lineHeight: 1.2
                        }}>
                          {userBlogsAnalytics.summary.totalBlogs}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}>
                          Total Blogs
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
              <Box>
                <Card sx={{
                  height: '100%',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  boxShadow: 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        backgroundColor: 'info.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Comment sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{
                          fontWeight: 600,
                          fontSize: '1.75rem',
                          color: 'text.primary',
                          lineHeight: 1.2
                        }}>
                          {formatNumber(userBlogsAnalytics.summary.totalComments)}
                        </Typography>
                        <Typography variant="body2" sx={{
                          color: 'text.secondary',
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}>
                          Total Comments
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
              <Box>
                <Card sx={{ 
                  height: '100%',
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  boxShadow: 'none',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ 
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        backgroundColor: 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Favorite sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 600, 
                          fontSize: '1.75rem', 
                          color: 'text.primary',
                          lineHeight: 1.2
                        }}>
                          {formatNumber(userBlogsAnalytics.summary.totalLikes)}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.875rem',
                          fontWeight: 500
                        }}>
                          Total Likes
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      {/* Main Content */}
      <Box sx={{ backgroundColor: 'background.default', py: 4 }}>
        <Container maxWidth="lg">
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: 2,
                fontSize: '0.875rem'
              }}
            >
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              py: 12,
              minHeight: 400
            }}>
              <Stack alignItems="center" spacing={3}>
                <CircularProgress size={48} thickness={3} />
                <Typography variant="body1" sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}>
                  Loading analytics...
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Box>
              {/* Minimal Mac-Style Tabs */}
              <Box sx={{ 
                mb: 4,
                backgroundColor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
              }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)} 
                  sx={{ 
                    '& .MuiTab-root': {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textTransform: 'none',
                      minHeight: 48,
                      px: 3,
                      color: 'text.secondary',
                      transition: 'all 0.15s ease'
                    },
                    '& .Mui-selected': {
                      color: 'text.primary',
                      backgroundColor: 'action.hover'
                    },
                    '& .MuiTabs-indicator': {
                      height: 2,
                      backgroundColor: 'primary.main'
                    }
                  }}
                >
                  <Tab 
                    label="Overview" 
                    icon={<Analytics sx={{ fontSize: 18, mr: 1 }} />}
                    iconPosition="start"
                  />
                  <Tab 
                    label="Individual Blog" 
                    disabled={!selectedBlogAnalytics}
                    icon={<TrendingUp sx={{ fontSize: 18, mr: 1 }} />}
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

            {/* Tab 1: Minimal Mac-Style Blog Overview */}
            {activeTab === 0 && userBlogsAnalytics && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: '1.25rem',
                      color: 'text.primary',
                      letterSpacing: '-0.01em'
                    }}
                  >
                    Your Blogs ({getTimeFilterLabel(timeFilter)})
                  </Typography>
                  
                  {totalPages > 1 && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                      }}
                    >
                      Page {currentPage} of {totalPages} • {totalBlogs} blogs total
                    </Typography>
                  )}
                </Box>
                
                {/* Search Filter */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder="Search your blogs by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setSearchQuery('')}
                            sx={{ 
                              color: 'text.secondary',
                              '&:hover': { color: 'text.primary' }
                            }}
                          >
                            <Clear sx={{ fontSize: 18 }} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused': {
                          borderColor: 'primary.main',
                          boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
                        },
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        '&::placeholder': {
                          color: 'text.secondary',
                          opacity: 1,
                        },
                      },
                    }}
                  />
                  
                  {searchQuery && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        mt: 1,
                        ml: 1
                      }}
                    >
                      {totalBlogs === 0 
                        ? 'No blogs found matching your search' 
                        : `${totalBlogs} blog${totalBlogs === 1 ? '' : 's'} found`
                      }
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
                  gap: 3,
                  justifyContent: 'center'
                }}>
                  {currentBlogs.map((blog) => (
                    <Box key={blog.id}>
                      <Card 
                        sx={{ 
                          height: 420,
                          width: 300,
                          maxWidth: '100%',
                          cursor: 'pointer',
                          backgroundColor: 'background.paper',
                          borderRadius: 2,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          overflow: 'hidden',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transform: 'translateY(-1px)'
                          }
                        }} 
                        onClick={() => handleBlogSelect(blog.id)}
                      >
                        {/* Blog Cover Image */}
                        <Box sx={{ 
                          position: 'relative',
                          height: 200,
                          background: blog.coverImage 
                            ? `url(${blog.coverImage})` 
                            : 'linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          overflow: 'hidden'
                        }}>
                          {/* Status Badge */}
                          <Chip
                            label={blog.published ? 'Published' : 'Draft'}
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              backgroundColor: blog.published ? 'success.main' : 'warning.main',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              height: 24,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          />
                        </Box>

                        <CardContent sx={{ p: 3 }}>
                          {/* Metadata Row */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 2
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.75rem'
                              }}>
                                1 min read
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ChatBubbleOutline sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.75rem'
                              }}>
                                {blog.stats.commentsCount}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Favorite sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.75rem'
                              }}>
                                {blog.stats.likesCount}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Blog Title */}
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600, 
                              fontSize: '1.1rem',
                              lineHeight: 1.3,
                              color: 'text.primary',
                              mb: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {blog.title}
                          </Typography>

                          {/* Date Row */}
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            mb: 2
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.75rem'
                              }}>
                                {new Date(blog.createdAt || Date.now()).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                        
                        <CardActions sx={{ p: 3, pt: 0 }}>
                          <Button 
                            fullWidth
                            variant="contained"
                            sx={{ 
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              borderRadius: 1.5,
                              textTransform: 'none',
                              py: 1.5,
                              backgroundColor: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.dark',
                              }
                            }}
                          >
                            View Analytics
                          </Button>
                        </CardActions>
                      </Card>
                    </Box>
                  ))}
                </Box>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mt: 4,
                    pt: 3,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(event, page) => setCurrentPage(page)}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          borderRadius: 2,
                          minWidth: 40,
                          height: 40,
                        },
                        '& .MuiPaginationItem-page.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          }
                        },
                        '& .MuiPaginationItem-page:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}

            {/* Tab 2: Individual Blog Analytics */}
            {activeTab === 1 && selectedBlogAnalytics && (
              <Box>
                {/* Blog Header */}
                <Card sx={{ 
                  mb: 4, 
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  boxShadow: 'none'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      alignItems={{ xs: 'flex-start', sm: 'center' }} 
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '1.5rem',
                            color: 'text.primary',
                            lineHeight: 1.3,
                            mb: 1,
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {selectedBlogAnalytics.blog.title}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'text.secondary',
                          fontSize: '0.875rem',
                          fontWeight: 400
                        }}>
                          Published on {new Date(selectedBlogAnalytics.blog.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip 
                        label={getTimeFilterLabel(timeFilter)} 
                        sx={{ 
                          fontSize: '0.875rem',
                          height: 32,
                          fontWeight: 500,
                          backgroundColor: 'action.selected',
                          color: 'primary.main',
                          border: '1px solid',
                          borderColor: 'primary.main'
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>

                {/* Overview Stats */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
                  <Box>
                    <Card sx={{ 
                      height: '100%',
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      boxShadow: 'none'
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box sx={{ 
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            backgroundColor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Visibility sx={{ color: 'white', fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography variant="h5" sx={{ 
                              fontWeight: 600, 
                              fontSize: '1.25rem', 
                              color: 'text.primary',
                              lineHeight: 1.2
                            }}>
                              {formatNumber(selectedBlogAnalytics.overview.totalViews)}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: 'text.secondary',
                              fontSize: '0.875rem',
                              fontWeight: 500
                            }}>
                              Total Views
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                  {/* @ts-ignore */}
                  {/* @ts-ignore */}
                    <Box>
                    <Card sx={{ 
                      height: '100%',
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      boxShadow: 'none'
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box sx={{ 
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            backgroundColor: 'success.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Person sx={{ color: 'white', fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography variant="h5" sx={{ 
                              fontWeight: 600, 
                              fontSize: '1.25rem', 
                              color: 'text.primary',
                              lineHeight: 1.2
                            }}>
                              {formatNumber(selectedBlogAnalytics.overview.uniqueViews)}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: 'text.secondary',
                              fontSize: '0.875rem',
                              fontWeight: 500
                            }}>
                              Unique Views
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                  {/* @ts-ignore */}
                  {/* @ts-ignore */}
                    <Box>
                    <Card sx={{ 
                      height: '100%',
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      boxShadow: 'none'
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box sx={{ 
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            backgroundColor: 'info.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Comment sx={{ color: 'white', fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography variant="h5" sx={{ 
                              fontWeight: 600, 
                              fontSize: '1.25rem', 
                              color: 'text.primary',
                              lineHeight: 1.2
                            }}>
                              {selectedBlogAnalytics.overview.commentsCount}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: 'text.secondary',
                              fontSize: '0.875rem',
                              fontWeight: 500
                            }}>
                              Comments
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                  {/* @ts-ignore */}
                  {/* @ts-ignore */}
                    <Box>
                    <Card sx={{ 
                      height: '100%',
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      boxShadow: 'none'
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box sx={{ 
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            backgroundColor: 'error.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Favorite sx={{ color: 'white', fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography variant="h5" sx={{ 
                              fontWeight: 600, 
                              fontSize: '1.25rem', 
                              color: 'text.primary',
                              lineHeight: 1.2
                            }}>
                              {selectedBlogAnalytics.overview.likesCount}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: 'text.secondary',
                              fontSize: '0.875rem',
                              fontWeight: 500
                            }}>
                              Likes
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                {/* Minimal Mac-Style Charts Section */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600, 
                    mb: 3, 
                    color: 'text.primary',
                    fontSize: '1.25rem',
                    letterSpacing: '-0.01em'
                  }}>
                    Analytics Overview
                  </Typography>
                  
                  {/* Clean Main Chart */}
                  <Card sx={{ 
                    mb: 4, 
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    boxShadow: 'none'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        mb: 3, 
                        color: 'text.primary',
                        fontSize: '1rem'
                      }}>
                        Views Over Time
                      </Typography>
                      {selectedBlogAnalytics.viewsOverTime && selectedBlogAnalytics.viewsOverTime.length > 0 ? (
                        <Box sx={{ height: { xs: 300, sm: 400 } }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={selectedBlogAnalytics.viewsOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 12, fill: 'currentColor', fontWeight: 500 }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                interval="preserveStartEnd"
                              />
                              <YAxis 
                                tick={{ fontSize: 12, fill: 'currentColor', fontWeight: 500 }}
                                tickLine={{ stroke: 'currentColor' }}
                              />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: 'background.paper', 
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: '8px',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                  fontSize: '12px',
                                  fontWeight: 500
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="views" 
                                stroke="currentColor" 
                                strokeWidth={3}
                                dot={{ fill: 'currentColor', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: 'currentColor', strokeWidth: 2, fill: 'background.paper' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          height: { xs: 300, sm: 400 },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'action.hover',
                          borderRadius: 2,
                          border: '1px dashed',
                          borderColor: 'divider'
                        }}>
                          <Stack alignItems="center" spacing={2}>
                            <TrendingUp sx={{ fontSize: 48, color: 'text.secondary' }} />
                            <Typography variant="body1" sx={{ 
                              color: 'text.secondary',
                              fontWeight: 500,
                              fontSize: '0.875rem'
                            }}>
                              No view data available for this period
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                              textAlign: 'center'
                            }}>
                              Views will appear here once your blog receives traffic
                            </Typography>
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                  </Card>

                  {/* Compact Charts Layout */}
                  <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                    {/* Compact Referral Sources */}
                    <Box sx={{ width: 300, flexShrink: 0 }}>
                      <Card sx={{ 
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        boxShadow: 'none'
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            mb: 2, 
                            color: 'text.primary',
                            fontSize: '0.9rem'
                          }}>
                            Top Referral Sources
                          </Typography>
                          {selectedBlogAnalytics.referralData.length > 0 ? (
                            <Box>
                              {selectedBlogAnalytics.referralData
                                .sort((a, b) => b.count - a.count)
                                .slice(0, 5)
                                .map((referral, index) => (
                                <Box 
                                  key={index}
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    py: 1,
                                    px: 1,
                                    mb: 0.5,
                                    backgroundColor: 'action.hover',
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                  }}
                                >
                                  {/* Position Number */}
                                  <Box sx={{ 
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    backgroundColor: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 1.5,
                                    flexShrink: 0
                                  }}>
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        fontWeight: 700,
                                        color: 'white',
                                        fontSize: '0.75rem'
                                      }}
                                    >
                                      {index + 1}
                                    </Typography>
                                  </Box>
                                  
                                  {/* Domain Info */}
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        color: 'text.primary',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {referral.domain || 'Direct'}
                                    </Typography>
                                    {referral.url && referral.url !== referral.domain && (
                                      <Typography 
                                        variant="caption" 
                                        sx={{ 
                                          color: 'text.secondary',
                                          fontSize: '0.7rem',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          display: 'block'
                                        }}
                                      >
                                        {referral.url}
                                      </Typography>
                                    )}
                                  </Box>
                                  
                                  {/* Count Badge */}
                                  <Box sx={{ 
                                    ml: 1.5,
                                    px: 0.75,
                                    py: 0.5,
                                    backgroundColor: 'primary.main',
                                    borderRadius: 1,
                                    minWidth: 24,
                                    textAlign: 'center',
                                    flexShrink: 0
                                  }}>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        fontWeight: 600,
                                        color: 'white',
                                        fontSize: '0.75rem'
                                      }}
                                    >
                                      {referral.count}
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Box sx={{ 
                              textAlign: 'center', 
                              py: 2,
                              color: 'text.secondary'
                            }}>
                              <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                                No referral data available
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Box>

                    {/* Compact Geographic Chart */}
                    <Box sx={{ flex: 1, width: '100%' }}>
                      <Card sx={{ 
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        boxShadow: 'none'
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            mb: 3, 
                            color: 'text.primary',
                            fontSize: '1rem'
                          }}>
                            Geographic Distribution
                          </Typography>
                          {selectedBlogAnalytics.countryData && selectedBlogAnalytics.countryData.length > 0 ? (
                            <Box sx={{ 
                              width: '100%',
                              height: { xs: 300, md: 350 }
                            }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                  data={selectedBlogAnalytics.countryData.slice(0, 8)} 
                                  margin={{ top: 20, right: 10, left: 10, bottom: 60 }}
                                  barCategoryGap="2%"
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                                  <XAxis 
                                    dataKey="country" 
                                    tick={{ fontSize: 14, fill: 'currentColor', fontWeight: 500 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    interval={0}
                                  />
                                  <YAxis 
                                    tick={{ fontSize: 14, fill: 'currentColor', fontWeight: 500 }}
                                    tickLine={{ stroke: 'currentColor' }}
                                    width={50}
                                  />
                                  <RechartsTooltip 
                                    contentStyle={{ 
                                      backgroundColor: 'background.paper', 
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      borderRadius: '8px',
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                      fontSize: '13px',
                                      fontWeight: 500
                                    }}
                                  />
                                  <Bar 
                                    dataKey="count" 
                                    fill="currentColor"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={180}
                                    minPointSize={2}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </Box>
                          ) : (
                            <Box sx={{ 
                              height: { xs: 300, md: 350 },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'action.hover',
                              borderRadius: 2,
                              border: '1px dashed',
                              borderColor: 'divider'
                            }}>
                              <Stack alignItems="center" spacing={2}>
                                <Box sx={{ 
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%', 
                                  backgroundColor: 'success.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <TrendingUp sx={{ fontSize: 20, color: 'white' }} />
                                </Box>
                                <Typography variant="body1" sx={{ 
                                  color: 'text.secondary',
                                  fontWeight: 500,
                                  fontSize: '0.8rem'
                                }}>
                                  No geographic data available
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  color: 'text.secondary',
                                  fontSize: '0.7rem',
                                  textAlign: 'center'
                                }}>
                                  Geographic data will appear here once visitors from different countries view your blog
                                </Typography>
                              </Stack>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        )}
        </Container>
      </Box>
    </Box>
  );
}

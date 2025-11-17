"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchBlogsByUsername, BlogPost, BlogAuthor } from '../../../lib/api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  Avatar,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Pagination,
} from '@mui/material';
import {
  Person,
  Schedule,
  ChatBubbleOutline,
  Favorite,
  Visibility,
  Analytics,
  Add,
  Edit,
} from '@mui/icons-material';
import { formatDate } from '../../../utils';
import { sanitizeHTML } from '../../../utils/sanitize';
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

interface UserBlogPageProps {
  params: Promise<{ username: string }>;
}

export default function UserBlogPage({ params }: UserBlogPageProps) {
  const { username } = use(params);
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [author, setAuthor] = useState<BlogAuthor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalItems: 0,
    totalPages: 1,
  });

  const isOwnProfile = isAuthenticated && user?.username === username;

  useEffect(() => {
    fetchUserBlogs(pagination.page);
  }, [username, pagination.page]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const fetchUserBlogs = async (page: number = pagination.page) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchBlogsByUsername(username, {
        page: page,
        limit: pagination.limit,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      }, token || undefined);
      
      if (response.success) {
        setBlogs(response.data.blogs);
        setAuthor(response.data.author);
        setPagination(prev => ({
          ...prev,
          totalItems: response.data.pagination.totalItems,
          totalPages: response.data.pagination.totalPages,
        }));
      } else {
        setError(response.message || 'Failed to load blogs');
      }
    } catch (error) {
      console.error('Error fetching user blogs:', error);
      setError('Failed to load blogs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getExcerpt = (content: string, maxLength: number = 200) => {
    // Simple approach: strip HTML tags to get text length, then truncate the original HTML
    const textOnly = content.replace(/<[^>]*>/g, '');
    
    if (textOnly.length <= maxLength) {
      return content;
    }
    
    // Find a good truncation point in the HTML
    let charCount = 0;
    let inTag = false;
    let result = '';
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      
      if (char === '<') {
        inTag = true;
        result += char;
      } else if (char === '>') {
        inTag = false;
        result += char;
      } else if (!inTag) {
        charCount++;
        if (charCount > maxLength) {
          break;
        }
        result += char;
      } else {
        result += char;
      }
    }
    
    // Close any open tags
    const openTags = result.match(/<[^/][^>]*>/g) || [];
    const closeTags = result.match(/<\/[^>]*>/g) || [];
    
    // Add closing tags for any unclosed tags
    const unclosedTags = [];
    for (const tag of openTags) {
      const tagName = tag.match(/<(\w+)/)?.[1];
      if (tagName) {
        unclosedTags.push(tagName);
      }
    }
    
    for (const tag of closeTags) {
      const tagName = tag.match(/<\/(\w+)/)?.[1];
      if (tagName) {
        const index = unclosedTags.lastIndexOf(tagName);
        if (index !== -1) {
          unclosedTags.splice(index, 1);
        }
      }
    }
    
    // Add closing tags in reverse order
    for (let i = unclosedTags.length - 1; i >= 0; i--) {
      result += `</${unclosedTags[i]}>`;
    }
    
    return result;
  };

  const getReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!author) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">User not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ marginTop: 0, paddingTop: 0 }}>
      <VercelAnalytics />
      {/* Header Section */}
      <Box
        sx={{
          position: 'relative',
          backgroundImage: 'url(/city-profile.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: '#ffffff !important',
          py: 12,
          px: 3,
          textAlign: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.7) 100%)',
            zIndex: 1,
          },
          '& > *': {
            position: 'relative',
            zIndex: 2,
            color: '#ffffff !important',
          },
          '& .MuiTypography-root': {
            color: '#ffffff !important',
          },
          '& .MuiButton-root': {
            color: '#ffffff !important',
          },
        }}
      >
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* Author Avatar */}
          {author?.profilePicture && author.profilePicture.trim() !== '' ? (
            <Box
              sx={{
                width: 140,
                height: 140,
                mx: 'auto',
                mb: 4,
                borderRadius: '50%',
                border: '4px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden',
                backdropFilter: 'blur(20px)',
                backgroundColor: 'transparent',
              }}
            >
              <img
                src={author.profilePicture}
                alt={`${author.firstName} ${author.lastName}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Box>
          ) : (
            <Avatar
              sx={{
                width: 140,
                height: 140,
                mx: 'auto',
                mb: 4,
                border: '4px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                backgroundColor: 'rgba(0, 122, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                fontSize: '3rem',
                fontWeight: 600,
                color: '#ffffff',
              }}
            >
              {author ? `${author.firstName?.charAt(0) || ''}${author.lastName?.charAt(0) || ''}` : 'U'}
            </Avatar>
          )}

          {/* Author Info */}
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              fontSize: { xs: '2rem', md: '3rem' },
              color: '#ffffff !important',
            }}
          >
            {author.firstName} {author.lastName}
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.95, 
              mb: 4,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              fontSize: { xs: '1rem', md: '1.25rem' },
              color: '#ffffff !important',
            }}
          >
            @{username}
          </Typography>

          {/* Stats */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 3, sm: 4 }} 
            justifyContent="center" 
            sx={{ mb: 6 }}
          >
            <Box sx={{ 
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 2,
              p: 3,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minWidth: 120,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                transform: 'translateY(-2px)',
              },
            }}>
              <Typography variant="h4" sx={{ fontWeight: 600, textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', color: '#ffffff !important' }}>
                {pagination.totalItems}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)', color: '#ffffff !important' }}>
                Blog Posts
              </Typography>
            </Box>
            <Box sx={{ 
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 2,
              p: 3,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minWidth: 120,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                transform: 'translateY(-2px)',
              },
            }}>
              <Typography variant="h4" sx={{ fontWeight: 600, textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', color: '#ffffff !important' }}>
                {blogs.reduce((total, blog) => total + blog.likeCount, 0)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)', color: '#ffffff !important' }}>
                Total Likes
              </Typography>
            </Box>
            <Box sx={{ 
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 2,
              p: 3,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minWidth: 120,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                transform: 'translateY(-2px)',
              },
            }}>
              <Typography variant="h4" sx={{ fontWeight: 600, textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', color: '#ffffff !important' }}>
                {blogs.reduce((total, blog) => total + blog.commentCount, 0)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)', color: '#ffffff !important' }}>
                Comments
              </Typography>
            </Box>
          </Stack>

          {/* Action Buttons for Own Profile */}
          {isOwnProfile && (
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="center"
              sx={{ mt: 2 }}
            >
              <Button
                variant="contained"
                startIcon={<Add />}
                size="large"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff !important',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 500,
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    color: '#ffffff !important',
                  },
                  transition: 'all 0.2s ease',
                }}
                onClick={() => router.push('/blogs/create')}
              >
                Create New Blog
              </Button>
              <Button
                variant="outlined"
                startIcon={<Analytics />}
                size="large"
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#ffffff !important',
                  backdropFilter: 'blur(20px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 500,
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    color: '#ffffff !important',
                  },
                  transition: 'all 0.2s ease',
                }}
                onClick={() => router.push(`/blogs/${username}/analytics`)}
              >
                View Analytics
              </Button>
            </Stack>
          )}
        </Box>
      </Box>

      {/* Blog Posts Section */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600 }}>
            {isOwnProfile ? 'My Blog Posts' : `${author.firstName}'s Blog Posts`}
          </Typography>

          {blogs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {isOwnProfile ? "You haven't written any blog posts yet." : "No blog posts found."}
              </Typography>
              {isOwnProfile && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => router.push('/blogs/create')}
                >
                  Create Your First Blog Post
                </Button>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4,
                justifyContent: 'center',
                '& > *': {
                  width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(50% - 16px)', lg: 'calc(33.333% - 22px)' },
                  maxWidth: '400px',
                  minWidth: '300px',
                },
              }}
            >
              {blogs.map((post) => (
                  <Card
                    key={post.id}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease-in-out',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                  >
                    {/* Blog Post Image */}
                    <Box
                      sx={{
                        height: 200,
                        background: post.coverImage 
                          ? `url(${post.coverImage}) center/cover`
                          : 'linear-gradient(135deg, #007AFF 0%, #007AFFCC 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        borderRadius: '12px 12px 0 0',
                        position: 'relative',
                      }}
                    >
                      {!post.coverImage && (
                        <Typography variant="h4" sx={{ fontWeight: 600, opacity: 0.8 }}>
                          {post.title.charAt(0).toUpperCase()}
                        </Typography>
                      )}
                      
                      {/* Status Badge */}
                      <Chip
                        label={post.published ? 'Published' : 'Draft'}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          backgroundColor: post.published ? 'success.main' : 'warning.main',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      {/* Meta Info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {getReadTime(post.content)} min read
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ChatBubbleOutline sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {post.commentCount}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Favorite sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {post.likeCount}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Title */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          fontSize: '1.1rem',
                          lineHeight: 1.3,
                          color: 'text.primary',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {post.title}
                      </Typography>

                      {/* Excerpt */}
                      <Box
                        sx={{
                          color: 'text.secondary',
                          mb: 3,
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.875rem',
                          '& b, & strong': {
                            fontWeight: 600,
                          },
                          '& i, & em': {
                            fontStyle: 'italic',
                          },
                          '& u': {
                            textDecoration: 'underline',
                          },
                          '& ul, & ol': {
                            paddingLeft: '16px',
                            margin: '8px 0',
                          },
                          '& li': {
                            marginBottom: '4px',
                          },
                        }}
                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(getExcerpt(post.content)) }}
                      />

                      {/* Author and Date */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Avatar 
                          sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                          src={post.author.profilePicture}
                        >
                          <Person sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {post.author.firstName} {post.author.lastName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                          <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {formatDate(post.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => router.push(`/blogs/${username}/${post.slug}`)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Read More
                      </Button>
                      
                      {/* Edit button for own posts */}
                      {isOwnProfile && (
                        <Tooltip title="Edit Blog">
                          <IconButton
                            onClick={() => router.push(`/blogs/${username}/${post.slug}/edit`)}
                            sx={{
                              ml: 1,
                              backgroundColor: 'action.hover',
                              '&:hover': {
                                backgroundColor: 'action.selected',
                              },
                            }}
                          >
                            <Edit sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {/* Analytics button for own posts */}
                      {isOwnProfile && (
                        <Tooltip title="View Analytics">
                          <IconButton
                            onClick={() => router.push(`/blogs/${username}/analytics`)}
                            sx={{
                              ml: 1,
                              backgroundColor: 'primary.main',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'primary.dark',
                              },
                            }}
                          >
                            <Analytics sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </CardActions>
                  </Card>
              ))}
            </Box>
          )}

          {/* Pagination */}
          {blogs.length > 0 && pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page || 1}
                onChange={handlePageChange}
                color="primary"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

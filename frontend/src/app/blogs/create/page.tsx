"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { createBlog, CreateBlogData } from '../../../lib/api';
import { useTheme } from '../../../theme/MacThemeProvider';
import { sanitizeHTML } from '../../../utils/sanitize';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Stack,
  Paper,
  Divider,
  Container,
  Fade,
} from '@mui/material';
import {
  Save,
  Publish,
  Preview,
  ArrowBack,
  Edit,
  Image,
  Description,
} from '@mui/icons-material';

export default function CreateBlogPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [formData, setFormData] = useState<CreateBlogData>({
    title: '',
    content: '',
    coverImage: '',
    published: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (field: keyof CreateBlogData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError(null);
  };

  const handleSwitchChange = (field: keyof CreateBlogData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  const handleSubmit = async (publish: boolean = false) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (formData.title.length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }
    
    if (formData.title.length > 255) {
      setError('Title must be less than 255 characters');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    
    if (formData.content.length < 10) {
      setError('Content must be at least 10 characters long');
      return;
    }

    // Validate cover image URL if provided
    if (formData.coverImage && formData.coverImage.trim()) {
      try {
        new URL(formData.coverImage);
      } catch {
        setError('Please provide a valid URL for the cover image');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const blogData: CreateBlogData = {
        ...formData,
        published: publish,
      };

      const response = await createBlog(token, blogData);
      
      if (response.success) {
        // Redirect to the created blog post
        router.push(`/blogs/${user?.username}/${response.data.blog.slug}`);
      } else {
        setError(response.message || 'Failed to create blog');
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      setError(error instanceof Error ? error.message : 'Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => handleSubmit(false);
  const handlePublish = () => handleSubmit(true);

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url(/bg-presentation.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // Use a darker overlay in both modes for consistent legibility
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.7) 100%)',
          backdropFilter: 'blur(2px)',
        },
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={800}>
            <Box
              sx={{
                textAlign: 'center',
                mb: 6,
                mt: 4,
                color: '#ffffff !important',
                '& .MuiTypography-root': { color: '#ffffff !important' },
              }}
            >
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  color: '#ffffff !important',
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  letterSpacing: '-0.02em',
                }}
              >
                Create New Blog Post
              </Typography>
              
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 0 }}>
                <Button
                  startIcon={<ArrowBack />}
                  onClick={() => router.back()}
                  sx={{
                    color: '#ffffff !important',
                    borderColor: 'rgba(255, 255, 255, 0.35)',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.6)',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  variant="outlined"
                >
                  Back
                </Button>
              </Stack>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9) !important',
                  fontWeight: 400,
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                Share your thoughts and ideas with the world through beautifully crafted content
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Form Section */}
      <Box sx={{ position: 'relative', zIndex: 1, pb: 8 }}>
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 4,
                    borderRadius: 3,
                    backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {error}
                </Alert>
              )}

              <Card
                sx={{
                  borderRadius: 4,
                  backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: isDarkMode 
                    ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 6 } }}>
                  <Stack spacing={5}>
                    {/* Title Section */}
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                        <Edit sx={{ color: 'primary.main', fontSize: 24 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Blog Title
                        </Typography>
                      </Stack>
                      <TextField
                        value={formData.title}
                        onChange={handleInputChange('title')}
                        fullWidth
                        required
                        placeholder="Enter an engaging title for your blog post"
                        helperText={`${formData.title.length}/255 characters`}
                        error={formData.title.length > 255}
                        sx={{
                          '& .MuiInputBase-root': {
                            fontSize: '1.25rem',
                            fontWeight: 500,
                            borderRadius: 3,
                            backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
                            '&:hover': {
                              backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 1)' : 'rgba(248, 250, 252, 1)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 1)' : 'rgba(255, 255, 255, 1)',
                            },
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDarkMode ? 'rgba(10, 132, 255, 0.3)' : 'rgba(0, 122, 255, 0.2)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDarkMode ? 'rgba(10, 132, 255, 0.5)' : 'rgba(0, 122, 255, 0.4)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                            borderWidth: 2,
                          },
                        }}
                      />
                    </Box>

                    {/* Cover Image Section */}
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                        <Image sx={{ color: 'primary.main', fontSize: 24 }} />
                        <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Cover Image
                        </Typography>
                      </Stack>
                      <TextField
                        value={formData.coverImage}
                        onChange={handleInputChange('coverImage')}
                        fullWidth
                        placeholder="https://example.com/your-image.jpg"
                        helperText="Optional: Add a cover image URL for your blog post"
                        sx={{
                          '& .MuiInputBase-root': {
                            borderRadius: 3,
                            backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
                            '&:hover': {
                              backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 1)' : 'rgba(248, 250, 252, 1)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 1)' : 'rgba(255, 255, 255, 1)',
                            },
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDarkMode ? 'rgba(10, 132, 255, 0.3)' : 'rgba(0, 122, 255, 0.2)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDarkMode ? 'rgba(10, 132, 255, 0.5)' : 'rgba(0, 122, 255, 0.4)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                            borderWidth: 2,
                          },
                        }}
                      />
                    </Box>

                      {/* Content Section */}
                      <Box>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Description sx={{ color: 'primary.main', fontSize: 24 }} />
                            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              HTML Content
                            </Typography>
                          </Stack>
                          <Button
                            variant="outlined"
                            startIcon={<Preview />}
                            onClick={() => setPreviewMode(!previewMode)}
                            sx={{
                              borderRadius: 3,
                              borderColor: isDarkMode ? 'rgba(10, 132, 255, 0.4)' : 'rgba(0, 122, 255, 0.3)',
                              color: 'primary.main',
                              backgroundColor: isDarkMode ? 'rgba(10, 132, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)',
                              '&:hover': {
                                backgroundColor: isDarkMode ? 'rgba(10, 132, 255, 0.2)' : 'rgba(0, 122, 255, 0.1)',
                                borderColor: 'primary.main',
                              },
                            }}
                          >
                            {previewMode ? 'Edit HTML' : 'Preview HTML'}
                          </Button>
                        </Stack>
                        
                        <Alert 
                          severity="info" 
                          sx={{ 
                            mb: 3, 
                            borderRadius: 2,
                            backgroundColor: isDarkMode ? 'rgba(10, 132, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)',
                            border: isDarkMode ? '1px solid rgba(10, 132, 255, 0.2)' : '1px solid rgba(0, 122, 255, 0.1)',
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            Content Guidelines:
                          </Typography>
                          <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2 }}>
                            <li><strong>✅ HTML & CSS:</strong> Use any HTML tags and CSS styles (including &lt;style&gt; tags)</li>
                            <li><strong>✅ Safe:</strong> Links, images, tables, formatting</li>
                            <li><strong>❌ Blocked:</strong> JavaScript (&lt;script&gt; tags, event handlers) for security</li>
                          </Typography>
                        </Alert>
                      
                      {previewMode ? (
                        <Card
                          sx={{
                            borderRadius: 3,
                            backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            border: '2px solid',
                            borderColor: 'primary.main',
                            minHeight: 400,
                          }}
                        >
                          <CardContent sx={{ p: 4 }}>
                            {formData.coverImage && (
                              <Box
                                component="img"
                                src={formData.coverImage}
                                alt={formData.title}
                                sx={{
                                  width: '100%',
                                  maxHeight: 400,
                                  objectFit: 'cover',
                                  borderRadius: 2,
                                  mb: 3,
                                }}
                              />
                            )}
                            <Typography 
                              variant="h4" 
                              component="h1"
                              sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}
                            >
                              {formData.title || 'Untitled'}
                            </Typography>
                            <Divider sx={{ mb: 3 }} />
                            <Box
                              sx={{
                                // Headings
                                '& h1, & h2, & h3, & h4, & h5, & h6': {
                                  fontWeight: 600,
                                  marginBottom: '16px',
                                  marginTop: '24px',
                                  color: 'text.primary',
                                  '&:first-of-type': {
                                    marginTop: 0,
                                  },
                                },
                                '& h1': { fontSize: '2.5rem', lineHeight: 1.2 },
                                '& h2': { fontSize: '2rem', lineHeight: 1.3 },
                                '& h3': { fontSize: '1.75rem', lineHeight: 1.4 },
                                '& h4': { fontSize: '1.5rem', lineHeight: 1.4 },
                                '& h5': { fontSize: '1.25rem', lineHeight: 1.4 },
                                '& h6': { fontSize: '1rem', lineHeight: 1.4 },
                                
                                // Paragraphs
                                '& p': {
                                  marginBottom: '16px',
                                  lineHeight: 1.6,
                                  color: 'text.secondary',
                                  fontSize: '1rem',
                                },
                                
                                // Lists
                                '& ul, & ol': {
                                  marginBottom: '16px',
                                  paddingLeft: '24px',
                                },
                                '& li': {
                                  marginBottom: '8px',
                                  color: 'text.secondary',
                                },
                                
                                // Blockquotes
                                '& blockquote': {
                                  borderLeft: `4px solid ${isDarkMode ? '#0A84FF' : '#007AFF'}`,
                                  paddingLeft: '16px',
                                  margin: '16px 0',
                                  fontStyle: 'italic',
                                  color: 'text.secondary',
                                  backgroundColor: isDarkMode ? 'rgba(10, 132, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)',
                                  padding: '12px 16px',
                                  borderRadius: '0 8px 8px 0',
                                },
                                
                                // Images
                                '& img': {
                                  maxWidth: '100%',
                                  height: 'auto',
                                  borderRadius: '8px',
                                  display: 'block',
                                  margin: '16px 0',
                                },
                                
                                // Code blocks
                                '& pre': {
                                  backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.8)' : '#f5f5f5',
                                  padding: '16px',
                                  borderRadius: '8px',
                                  margin: '16px 0',
                                  fontFamily: 'monospace',
                                  fontSize: '0.9rem',
                                  lineHeight: 1.4,
                                  overflow: 'auto',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                },
                                '& code': {
                                  backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
                                  padding: '3px 6px',
                                  borderRadius: '4px',
                                  fontFamily: 'monospace',
                                  fontSize: '0.9em',
                                },
                                
                                // Links
                                '& a': {
                                  color: 'primary.main',
                                  textDecoration: 'none',
                                  '&:hover': {
                                    textDecoration: 'underline',
                                  },
                                },
                                
                                // Horizontal rules
                                '& hr': {
                                  margin: '32px 0',
                                  border: 'none',
                                  borderTop: '2px solid',
                                  borderTopColor: 'divider',
                                },
                                
                                // Tables
                                '& table': {
                                  width: '100%',
                                  borderCollapse: 'collapse',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  margin: '16px 0',
                                },
                                '& th, & td': {
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  padding: '8px 12px',
                                  textAlign: 'left',
                                },
                                '& th': {
                                  backgroundColor: 'action.hover',
                                  fontWeight: 600,
                                },
                                
                                // Strong and emphasis
                                '& strong, & b': {
                                  fontWeight: 700,
                                },
                                '& em, & i': {
                                  fontStyle: 'italic',
                                },
                                '& u': {
                                  textDecoration: 'underline',
                                },
                              }}
                              dangerouslySetInnerHTML={{ __html: sanitizeHTML(formData.content) }}
                            />
                          </CardContent>
                        </Card>
                      ) : (
                        <TextField
                          value={formData.content}
                          onChange={handleInputChange('content')}
                          fullWidth
                          multiline
                          rows={15}
                          required
                          placeholder="<style>/* CSS styles here */</style>&#10;<div class='container'>&#10;  <h1>Your Content</h1>&#10;  <p>HTML and CSS allowed, JavaScript is blocked for security.</p>&#10;</div>"
                          helperText={`${formData.content.length} characters (min 10). HTML ✅ CSS ✅ JavaScript ❌`}
                          error={formData.content.length > 0 && formData.content.length < 10}
                          sx={{
                            '& .MuiInputBase-root': {
                              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                              fontSize: '0.95rem',
                              borderRadius: 3,
                              backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 0.8)' : 'rgba(248, 250, 252, 0.8)',
                              '&:hover': {
                                backgroundColor: isDarkMode ? 'rgba(42, 42, 42, 1)' : 'rgba(248, 250, 252, 1)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 1)' : 'rgba(255, 255, 255, 1)',
                              },
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: isDarkMode ? 'rgba(10, 132, 255, 0.3)' : 'rgba(0, 122, 255, 0.2)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: isDarkMode ? 'rgba(10, 132, 255, 0.5)' : 'rgba(0, 122, 255, 0.4)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                              borderWidth: 2,
                            },
                          }}
                        />
                      )}
                    </Box>

                    {/* Actions */}
                    <Stack direction="row" spacing={3} justifyContent="flex-end" sx={{ pt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Save />}
                        onClick={handleSaveDraft}
                        disabled={loading}
                        sx={{
                          minWidth: 140,
                          borderRadius: 3,
                          borderColor: isDarkMode ? 'rgba(10, 132, 255, 0.4)' : 'rgba(0, 122, 255, 0.3)',
                          color: 'primary.main',
                          backgroundColor: isDarkMode ? 'rgba(10, 132, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)',
                          fontWeight: 500,
                          py: 1.5,
                          '&:hover': {
                            backgroundColor: isDarkMode ? 'rgba(10, 132, 255, 0.2)' : 'rgba(0, 122, 255, 0.1)',
                            borderColor: 'primary.main',
                            transform: 'translateY(-1px)',
                            boxShadow: isDarkMode 
                              ? '0 4px 12px rgba(10, 132, 255, 0.3)' 
                              : '0 4px 12px rgba(0, 122, 255, 0.2)',
                          },
                          '&:disabled': {
                            opacity: 0.6,
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        Save Draft
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Publish />}
                        onClick={handlePublish}
                        disabled={loading}
                        sx={{
                          minWidth: 140,
                          borderRadius: 3,
                          backgroundColor: 'primary.main',
                          fontWeight: 500,
                          py: 1.5,
                          '&:hover': {
                            backgroundColor: isDarkMode ? '#0056CC' : '#0056CC',
                            transform: 'translateY(-1px)',
                            boxShadow: isDarkMode 
                              ? '0 6px 20px rgba(10, 132, 255, 0.4)' 
                              : '0 6px 20px rgba(0, 122, 255, 0.4)',
                          },
                          '&:disabled': {
                            backgroundColor: isDarkMode ? 'rgba(10, 132, 255, 0.6)' : 'rgba(0, 122, 255, 0.6)',
                          },
                          transition: 'all 0.2s ease-in-out',
                        }}
                      >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Publish'}
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        </Container>
      </Box>
    </Box>
  );
}

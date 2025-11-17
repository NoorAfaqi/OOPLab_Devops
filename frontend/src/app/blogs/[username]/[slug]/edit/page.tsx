"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import { fetchBlogBySlug, updateBlog, UpdateBlogData } from '../../../../../lib/api';
import { sanitizeHTML } from '../../../../../utils/sanitize';
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
} from '@mui/material';
import {
  Save,
  Publish,
  Preview,
  ArrowBack,
} from '@mui/icons-material';

interface EditBlogPageProps {
  params: Promise<{ username: string; slug: string }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const { username, slug } = use(params);
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState<UpdateBlogData>({
    title: '',
    content: '',
    coverImage: '',
    published: false,
  });
  
  const [originalBlog, setOriginalBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    fetchBlog();
  }, [username, slug]);

  const fetchBlog = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchBlogBySlug(username, slug, token || undefined);
      
      if (response.success) {
        const blog = response.data.blog;
        
        // Check if user owns this blog
        if (blog.author.username !== user?.username) {
          setError('You can only edit your own blogs');
          return;
        }
        
        setOriginalBlog(blog);
        setFormData({
          title: blog.title,
          content: blog.content,
          coverImage: blog.coverImage || '',
          published: blog.published,
        });
      } else {
        setError(response.message || 'Blog not found');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Failed to load blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateBlogData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError(null);
  };

  const handleSwitchChange = (field: keyof UpdateBlogData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  const handleSubmit = async (publish: boolean = false) => {
    if (!token || !originalBlog) {
      setError('Authentication required');
      return;
    }

    // Validation
    if (!formData.title?.trim()) {
      setError('Title is required');
      return;
    }
    
    if (formData.title && formData.title.length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }
    
    if (formData.title && formData.title.length > 255) {
      setError('Title must be less than 255 characters');
      return;
    }
    
    if (!formData.content?.trim()) {
      setError('Content is required');
      return;
    }
    
    if (formData.content && formData.content.length < 10) {
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

    setSaving(true);
    setError(null);

    try {
      const blogData: UpdateBlogData = {
        ...formData,
        published: publish,
      };

      const response = await updateBlog(token, originalBlog.id, blogData);
      
      if (response.success) {
        // Redirect to the updated blog post
        router.push(`/blogs/${username}/${slug}`);
      } else {
        setError(response.message || 'Failed to update blog');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      setError(error instanceof Error ? error.message : 'Failed to update blog');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !originalBlog) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ marginTop: 0, paddingTop: 0 }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #007AFF 0%, #007AFFCC 100%)',
          color: 'white',
          py: 4,
          px: 3,
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.back()}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              variant="outlined"
            >
              Back
            </Button>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Edit Blog Post
            </Typography>
          </Stack>
          
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Update your blog post content and settings
          </Typography>
        </Box>
      </Box>

      {/* Form */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Paper elevation={2} sx={{ p: 4 }}>
            <Stack spacing={4}>
              {/* Title */}
              <TextField
                label="Blog Title"
                value={formData.title || ''}
                onChange={handleInputChange('title')}
                fullWidth
                required
                placeholder="Enter an engaging title for your blog post"
                helperText={`${(formData.title || '').length}/255 characters`}
                error={(formData.title || '').length > 255}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: '1.25rem',
                    fontWeight: 600,
                  },
                }}
              />

              {/* Cover Image */}
              <TextField
                label="Cover Image URL"
                value={formData.coverImage || ''}
                onChange={handleInputChange('coverImage')}
                fullWidth
                placeholder="https://example.com/your-image.jpg"
                helperText="Optional: Add a cover image URL for your blog post"
              />

              {/* Content */}
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    HTML Content
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Preview />}
                    onClick={() => setPreviewMode(!previewMode)}
                    size="small"
                  >
                    {previewMode ? 'Edit HTML' : 'Preview HTML'}
                  </Button>
                </Stack>
                
                {previewMode ? (
                  <Card
                    sx={{
                      borderRadius: 3,
                      backgroundColor: 'background.paper',
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
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main',
                            paddingLeft: '16px',
                            margin: '16px 0',
                            fontStyle: 'italic',
                            color: 'text.secondary',
                            backgroundColor: 'action.hover',
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
                            backgroundColor: '#f5f5f5',
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
                            backgroundColor: 'background.default',
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
                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(formData.content || '') }}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <TextField
                    value={formData.content || ''}
                    onChange={handleInputChange('content')}
                    fullWidth
                    multiline
                    rows={15}
                    required
                    placeholder="<style>/* CSS styles here */</style>&#10;<div class='container'>&#10;  <h1>Your Content</h1>&#10;  <p>HTML and CSS allowed, JavaScript is blocked for security.</p>&#10;</div>"
                    helperText={`${(formData.content || '').length} characters (min 10). HTML ✅ CSS ✅ JavaScript ❌`}
                    error={(formData.content || '').length > 0 && (formData.content || '').length < 10}
                    sx={{
                      '& .MuiInputBase-root': {
                        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        fontSize: '0.95rem',
                      },
                    }}
                  />
                )}
              </Box>

              {/* Actions */}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={handleSaveDraft}
                  disabled={saving}
                  sx={{ minWidth: 120 }}
                >
                  Save Draft
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Publish />}
                  onClick={handlePublish}
                  disabled={saving}
                  sx={{ minWidth: 120 }}
                >
                  {saving ? <CircularProgress size={20} /> : 'Publish'}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

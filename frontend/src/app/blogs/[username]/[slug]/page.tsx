"use client";

import React, { useState, useEffect, use } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Avatar,
  Stack,
  Skeleton,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Tooltip,
  Breadcrumbs,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import {
  Edit,
  Schedule,
  Person,
  Comment,
  Favorite,
  FavoriteBorder,
  AccessTime,
  ArrowBack,
  Save,
  Cancel,
  Send,
  Delete,
  Home,
  NavigateNext,
  Share,
  Twitter,
  Facebook,
  LinkedIn,
  WhatsApp,
  Link as LinkIcon,
  Check,
  Preview,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchBlogBySlug, updateBlog, BlogPost, UpdateBlogData, Comment as CommentType, fetchComments, createComment, updateComment, deleteComment, toggleLike, fetchRandomBlogs, trackBlogView } from "../../../../lib/api";
import { useAuth } from "../../../../contexts/AuthContext";
import BlogContentRenderer from "../../../../components/BlogContentRenderer";
import GoogleAd from "../../../../components/GoogleAd";
import { generateStructuredData, generateBreadcrumbSchema } from "../../../../utils/seo";
import { sanitizeHTML } from "../../../../utils/sanitize";
import { Analytics } from "@vercel/analytics/next";

interface BlogPageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export default function BlogPage({ params }: BlogPageProps) {
  const { username, slug } = use(params);
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading } = useAuth();
  
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCoverImage, setEditCoverImage] = useState("");
  const [editPublished, setEditPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Comment and like states
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  // Related blogs state
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [loadingRelatedBlogs, setLoadingRelatedBlogs] = useState(false);
  
  // Share functionality
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareMenuAnchor, setShareMenuAnchor] = useState<null | HTMLElement>(null);

  const isOwner = isAuthenticated && user && blog && blog.authorId && user.id === blog.authorId;

  // Add SEO structured data for blog posts
  useEffect(() => {
    if (!blog) return;

    // Add BlogPosting structured data
    const blogSchema = generateStructuredData({
      type: 'BlogPosting',
      data: {
        headline: blog.title,
        description: blog.content.replace(/<[^>]*>/g, '').substring(0, 200),
        image: blog.coverImage || '/logo.png',
        datePublished: blog.createdAt,
        dateModified: blog.updatedAt,
        author: {
          name: `${blog.author?.firstName} ${blog.author?.lastName}`,
          url: `/blogs/${username}`
        }
      }
    });

    // Add Breadcrumb structured data
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Blogs', url: '/blogs' },
      { name: username, url: `/blogs/${username}` },
      { name: blog.title, url: `/blogs/${username}/${slug}` }
    ]);

    // Inject structured data
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.text = JSON.stringify(blogSchema);
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script2);

    return () => {
      script1.remove();
      script2.remove();
    };
  }, [blog, username, slug]);

  useEffect(() => {
    // Only fetch if authentication is not loading
    if (!isLoading) {
      fetchBlog();
    }
  }, [username, slug, token, isLoading]);

  const fetchBlog = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchBlogBySlug(username, slug, token || undefined);
      
      if (response.success) {
        setBlog(response.data.blog);
        setEditTitle(response.data.blog.title);
        setEditContent(response.data.blog.content);
        setEditCoverImage(response.data.blog.coverImage || "");
        setEditPublished(response.data.blog.published);
        setLikeCount(response.data.blog.likeCount);
        
        // Track the blog view
        try {
          await trackBlogView(response.data.blog.id);
        } catch (error) {
          console.error('Failed to track blog view:', error);
          // Don't show error to user, just log it
        }
        
        // Fetch comments and related blogs
        await fetchCommentsForBlog(response.data.blog.id);
        await fetchRelatedBlogs();
      } else {
        setError(response.message || 'Blog not found');
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      
      // Check if it's a 404 error (blog not found or access denied)
      if (error instanceof Error && error.message.includes('404')) {
        setError('Blog not found. This blog may be private or may not exist.');
      } else {
        setError('Failed to load blog post. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsForBlog = async (blogId: number) => {
    try {
      const response = await fetchComments(blogId, token || undefined);
      if (response.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchRelatedBlogs = async () => {
    setLoadingRelatedBlogs(true);
    try {
      const response = await fetchRandomBlogs(5);
      
      if (response.success) {
        // Filter out the current blog from related blogs
        const filteredBlogs = response.data.blogs.filter(relatedBlog => 
          relatedBlog.id !== blog?.id
        );
        setRelatedBlogs(filteredBlogs.slice(0, 5));
      } else {
        await tryFallbackBlogs();
      }
    } catch (error) {
      console.error('Error fetching related blogs:', error);
      // Try fallback when random blogs API fails (404, network error, etc.)
      await tryFallbackBlogs();
    } finally {
      setLoadingRelatedBlogs(false);
    }
  };

  const tryFallbackBlogs = async () => {
    try {
      const fallbackResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/blogs/list?limit=10`);
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.success && fallbackData.data.blogs) {
          const filteredBlogs = fallbackData.data.blogs.filter((relatedBlog: BlogPost) => 
            relatedBlog.id !== blog?.id
          );
          setRelatedBlogs(filteredBlogs.slice(0, 5));
        } else {
          setRelatedBlogs([]);
        }
      } else {
        setRelatedBlogs([]);
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      setRelatedBlogs([]);
    }
  };

  const handleEdit = () => {
    if (blog) {
      setEditTitle(blog.title);
      setEditContent(blog.content || '');
      setEditCoverImage(blog.coverImage || "");
      setEditPublished(blog.published);
      
      setTimeout(() => {
        setIsEditing(true);
        setEditDialogOpen(true);
      }, 0);
    }
  };

  const handleSave = async () => {
    if (!blog || !token) return;
    
    setSaving(true);
    try {
      const blogData: UpdateBlogData = {
        title: editTitle,
        content: editContent,
        coverImage: editCoverImage,
        published: editPublished,
      };

      const response = await updateBlog(token, blog.id, blogData);
      
      if (response.success) {
        const updatedBlog = {
          ...response.data.blog,
          author: response.data.blog.author || blog.author
        };
        setBlog(updatedBlog);
        setIsEditing(false);
        setEditDialogOpen(false);
      } else {
        setError(response.message || 'Failed to update blog');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      setError('Failed to save blog post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditDialogOpen(false);
    if (blog) {
      setEditTitle(blog.title);
      setEditContent(blog.content);
      setEditCoverImage(blog.coverImage || "");
      setEditPublished(blog.published);
    }
  };

  const handleSubmitComment = async () => {
    if (!blog || !token || !newComment.trim()) return;
    
    setSubmittingComment(true);
    try {
      const response = await createComment(token, blog.id, { content: newComment.trim() });
      if (response.success) {
        setComments([...comments, response.data.comment]);
        setNewComment("");
        setBlog(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
      } else {
        setError(response.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('Failed to post comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleToggleLike = async () => {
    if (!blog || !token) return;
    
    try {
      const response = await toggleLike(token, blog.id);
      if (response.success) {
        setIsLiked(response.data.liked);
        setLikeCount(response.data.likeCount);
        setBlog(prev => prev ? { ...prev, likeCount: response.data.likeCount } : null);
      } else {
        setError(response.message || 'Failed to toggle like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setError('Failed to toggle like. Please try again.');
    }
  };

  // Share functionality
  const getCurrentUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ooplab.org'}/blogs/${username}/${slug}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentUrl());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      setError('Failed to copy link. Please try again.');
    }
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog?.title || '')}&url=${encodeURIComponent(getCurrentUrl())}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getCurrentUrl())}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getCurrentUrl())}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${blog?.title} ${getCurrentUrl()}`)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareNative = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.content.replace(/<[^>]*>/g, '').substring(0, 200),
          url: getCurrentUrl(),
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
    setShareMenuAnchor(null);
  };

  const handleShareMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setShareMenuAnchor(event.currentTarget);
  };

  const handleShareMenuClose = () => {
    setShareMenuAnchor(null);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token) return;
    
    try {
      const response = await deleteComment(token, commentId);
      if (response.success) {
        setComments(comments.filter(comment => comment.id !== commentId));
        setBlog(prev => prev ? { ...prev, commentCount: prev.commentCount - 1 } : null);
      } else {
        setError(response.message || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (loading || isLoading) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Stack spacing={4}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={40} />
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Stack>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h1" sx={{ fontSize: '4rem', fontWeight: 700, color: 'text.secondary', mb: 2 }}>
              404
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
              Page Not Found
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
              The blog post you're looking for doesn't exist or may be private.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => router.push('/blogs')}
                sx={{ borderRadius: 2 }}
              >
                Back to Blogs
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push('/')}
                sx={{ borderRadius: 2 }}
              >
                Go Home
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!blog) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Blog post not found.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: 'background.default',
      py: 6
    }}>
      <Analytics />
      <Container maxWidth="lg">
        {/* Clean Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" sx={{ color: 'text.secondary' }} />} 
          sx={{ mb: 6 }}
        >
          <Link 
            href="/"
            style={{ 
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Home sx={{ fontSize: 16 }} />
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
              Home
            </Typography>
          </Link>
          <Link 
            href="/blogs"
            style={{ 
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
              Blogs
            </Typography>
          </Link>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {blog.title}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Main Content */}
          <Box sx={{ flex: 1, maxWidth: { lg: '800px' } }}>
            {/* Cover Image */}
            {blog.coverImage && (
              <Box
                component="img"
                src={blog.coverImage}
                alt={`${blog.title} - Cover Image`}
                aria-label={`Cover image for ${blog.title}`}
                loading="lazy"
                sx={{
                  width: '100%',
                  height: { xs: 250, md: 400 },
                  objectFit: 'cover',
                  borderRadius: 3,
                  mb: 6,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                }}
              />
            )}

            {/* Blog Header */}
            <Box sx={{ mb: 6 }}>
              {/* Title */}
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  lineHeight: 1.2,
                  color: 'text.primary',
                  letterSpacing: '-0.01em',
                }}
              >
                {blog.title}
              </Typography>

              {/* Author Info */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                <Avatar
                  sx={{ 
                    width: 48, 
                    height: 48,
                    backgroundColor: '#007AFF',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: 600
                  }}
                  src={blog.author?.profilePicture || undefined}
                  alt={`${blog.author?.firstName} ${blog.author?.lastName}`}
                >
                  {blog.author?.firstName && blog.author?.lastName 
                    ? `${blog.author.firstName.charAt(0)}${blog.author.lastName.charAt(0)}`.toUpperCase()
                    : blog.author?.firstName 
                      ? blog.author.firstName.charAt(0).toUpperCase()
                      : <Person sx={{ fontSize: 24 }} />
                  }
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                    {blog.author?.firstName || 'Unknown'} {blog.author?.lastName || 'Author'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    @{blog.author?.username || 'unknown'}
                  </Typography>
                </Box>
              </Stack>

              {/* Stats */}
              <Stack direction="row" spacing={4} alignItems="center" sx={{ mb: 4 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Schedule sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {formatDate(blog.createdAt)}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {getReadTime(blog.content)} min read
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Comment sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {blog.commentCount} comments
                  </Typography>
                </Stack>
              </Stack>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Button
                  variant={isLiked ? "contained" : "outlined"}
                  startIcon={isLiked ? <Favorite /> : <FavoriteBorder />}
                  onClick={handleToggleLike}
                  disabled={!isAuthenticated}
                  sx={{
                    backgroundColor: isLiked ? '#FF3B30' : 'transparent',
                    borderColor: isLiked ? '#FF3B30' : 'divider',
                    color: isLiked ? 'white' : 'text.primary',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: isLiked ? '#D70015' : 'action.hover',
                      borderColor: isLiked ? '#D70015' : 'text.secondary',
                    },
                    '&:disabled': {
                      backgroundColor: 'action.disabledBackground',
                      color: 'text.disabled',
                      borderColor: 'divider',
                    },
                  }}
                >
                  {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                </Button>

                {/* Share Button with Menu */}
                <Tooltip title="Share this post">
                  <IconButton
                    onClick={handleShareMenuOpen}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      px: 2,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Share />
                  </IconButton>
                </Tooltip>
                
                <Menu
                  anchorEl={shareMenuAnchor}
                  open={Boolean(shareMenuAnchor)}
                  onClose={handleShareMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                >
                  <MenuItem onClick={handleShareNative}>
                    <ListItemIcon>
                      <Share fontSize="small" />
                    </ListItemIcon>
                    Share with...
                  </MenuItem>
                  <MenuItem onClick={handleShareTwitter}>
                    <ListItemIcon>
                      <Twitter fontSize="small" />
                    </ListItemIcon>
                    Share on Twitter
                  </MenuItem>
                  <MenuItem onClick={handleShareFacebook}>
                    <ListItemIcon>
                      <Facebook fontSize="small" />
                    </ListItemIcon>
                    Share on Facebook
                  </MenuItem>
                  <MenuItem onClick={handleShareLinkedIn}>
                    <ListItemIcon>
                      <LinkedIn fontSize="small" />
                    </ListItemIcon>
                    Share on LinkedIn
                  </MenuItem>
                  <MenuItem onClick={handleShareWhatsApp}>
                    <ListItemIcon>
                      <WhatsApp fontSize="small" />
                    </ListItemIcon>
                    Share on WhatsApp
                  </MenuItem>
                  <MenuItem onClick={handleCopyLink}>
                    <ListItemIcon>
                      {copySuccess ? (
                        <Check fontSize="small" color="success" />
                      ) : (
                        <LinkIcon fontSize="small" />
                      )}
                    </ListItemIcon>
                    {copySuccess ? 'Link copied!' : 'Copy link'}
                  </MenuItem>
                </Menu>

                {/* Edit Button for Owner */}
                {isOwner && (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={handleEdit}
                    sx={{
                      backgroundColor: 'primary.main',
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      fontWeight: 500,
                      '&:hover': { backgroundColor: 'primary.dark' },
                    }}
                  >
                    Edit Post
                  </Button>
                )}
              </Stack>
            </Box>

            <Divider sx={{ mb: 6, borderColor: 'divider' }} />

            {/* Blog Content */}
            <Box sx={{ mb: 8 }}>
              <BlogContentRenderer content={blog.content} />
            </Box>

            <Divider sx={{ mb: 6, borderColor: 'divider' }} />

            {/* Comments Section */}
            <Box sx={{ mb: 8 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, color: 'text.primary' }}>
                Comments ({comments.length})
              </Typography>

              {/* Add Comment Form */}
              {isAuthenticated ? (
                <Card sx={{ mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ p: 4 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      variant="outlined"
                      sx={{ 
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'background.paper',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                            borderWidth: 2,
                          },
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<Send />}
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || submittingComment}
                      sx={{
                        backgroundColor: 'primary.main',
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontWeight: 500,
                        '&:hover': { backgroundColor: 'primary.dark' },
                      }}
                    >
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card sx={{ mb: 4, p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Please sign in to post a comment.
                  </Typography>
                </Card>
              )}

              {/* Comments List */}
              {comments.length > 0 ? (
                <Stack spacing={3}>
                  {comments.map((comment) => (
                    <Card key={comment.id} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                      <CardContent sx={{ p: 4 }}>
                        <Stack direction="row" spacing={3} alignItems="flex-start">
                          <Avatar
                            sx={{ 
                              width: 40, 
                              height: 40,
                              backgroundColor: 'primary.main',
                              color: 'white',
                              fontSize: '0.9rem',
                              fontWeight: 600
                            }}
                            src={comment.author.profilePicture}
                            alt={`${comment.author.firstName} ${comment.author.lastName}`}
                          >
                            {comment.author.firstName && comment.author.lastName 
                              ? `${comment.author.firstName.charAt(0)}${comment.author.lastName.charAt(0)}`.toUpperCase()
                              : comment.author.firstName 
                                ? comment.author.firstName.charAt(0).toUpperCase()
                                : <Person sx={{ fontSize: 20 }} />
                            }
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                {comment.author.firstName} {comment.author.lastName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                @{comment.author.username}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                • {formatDate(comment.createdAt)}
                              </Typography>
                            </Stack>
                            <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'text.primary' }}>
                              {comment.content}
                            </Typography>
                          </Box>
                          {isAuthenticated && user && user.id === comment.author.id && (
                            <Tooltip title="Delete comment">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteComment(comment.id)}
                                sx={{ color: '#8E8E93' }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    No comments yet. Be the first to comment!
                  </Typography>
                </Card>
              )}
            </Box>
          </Box>

          {/* Sidebar */}
          <Box sx={{ width: { xs: '100%', lg: 320 }, flexShrink: 0 }}>
            {/* Google Ad - Top */}
            <GoogleAd 
              adSlot="1234567890"
              adFormat="vertical"
              adStyle={{ width: '100%', height: 600 }}
              className="sidebar-top-ad"
            />

            {/* Related Blogs */}
            <Card 
              sx={{ 
                p: 3,
                mt: 3,
                mb: 4,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                },
                transition: 'box-shadow 0.2s ease',
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2.5, 
                  color: 'text.primary',
                  fontSize: '1.1rem',
                  letterSpacing: '-0.01em',
                }}
              >
                Related Articles
              </Typography>
              
              {loadingRelatedBlogs ? (
                <Stack spacing={2.5}>
                  {[...Array(5)].map((_, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                      <Skeleton 
                        variant="rectangular" 
                        width={70} 
                        height={52} 
                        sx={{ 
                          borderRadius: 1.5,
                          backgroundColor: 'grey.100',
                        }} 
                      />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton 
                          variant="text" 
                          height={18} 
                          width="85%" 
                          sx={{ mb: 0.5 }}
                        />
                        <Skeleton 
                          variant="text" 
                          height={14} 
                          width="60%" 
                          sx={{ mb: 0.5 }}
                        />
                        <Skeleton 
                          variant="text" 
                          height={12} 
                          width="40%" 
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : relatedBlogs.length > 0 ? (
                <Stack spacing={2.5}>
                  {relatedBlogs.map((relatedBlog, index) => (
                    <Box
                      key={relatedBlog.id}
                      onClick={() => router.push(`/blogs/${relatedBlog.author.username}/${relatedBlog.slug}`)}
                      sx={{
                        display: 'flex',
                        gap: 2.5,
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        p: 2,
                        borderRadius: 1.5,
                        position: 'relative',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease',
                        '&:not(:last-child)::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -12.5,
                          left: 0,
                          right: 0,
                          height: '1px',
                          backgroundColor: 'divider',
                        },
                      }}
                    >
                      {relatedBlog.coverImage ? (
                        <Box
                          component="img"
                          src={relatedBlog.coverImage}
                          alt={relatedBlog.title}
                          sx={{
                            width: 70,
                            height: 52,
                            objectFit: 'cover',
                            borderRadius: 1.5,
                            flexShrink: 0,
                            backgroundColor: 'grey.100',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 70,
                            height: 52,
                            borderRadius: 1.5,
                            backgroundColor: 'grey.100',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                            No Image
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600, 
                            color: 'text.primary',
                            mb: 0.5,
                            fontSize: '0.9rem',
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {relatedBlog.title}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            display: 'block',
                            mb: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                          }}
                        >
                          {relatedBlog.author.firstName} {relatedBlog.author.lastName}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AccessTime sx={{ fontSize: 11, color: 'text.disabled' }} />
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.disabled',
                              fontSize: '0.7rem',
                            }}
                          >
                            {getReadTime(relatedBlog.content)} min
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.85rem',
                    }}
                  >
                    No related articles available
                  </Typography>
                </Box>
              )}
            </Card>

            {/* Google Ad - Bottom */}
            <GoogleAd 
              adSlot="1234567891"
              adFormat="vertical"
              adStyle={{ width: '100%', height: 600 }}
              className="sidebar-bottom-ad"
            />
          </Box>
        </Box>
      </Container>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: '80vh',
          },
        }}
      >
        <DialogTitle sx={{ pb: 3, fontWeight: 600, color: 'text.primary', fontSize: '1.25rem' }}>
          Edit Blog Post
        </DialogTitle>
        <DialogContent>
          <Stack spacing={4}>
            <TextField
              fullWidth
              label="Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              fullWidth
              label="Cover Image URL"
              value={editCoverImage}
              onChange={(e) => setEditCoverImage(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1D1D1F' }}>
                  HTML Content
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Preview />}
                  onClick={() => setPreviewMode(!previewMode)}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    borderColor: 'rgba(0, 122, 255, 0.3)',
                    color: 'primary.main',
                    backgroundColor: 'rgba(0, 122, 255, 0.05)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 122, 255, 0.1)',
                      borderColor: 'primary.main',
                    },
                  }}
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
                    mb: 2,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h5" 
                      component="h1" 
                      sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}
                    >
                      {editTitle || 'Untitled'}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
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
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(editContent || '') }}
                    />
                  </CardContent>
                </Card>
              ) : (
                <TextField
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  fullWidth
                  multiline
                  rows={12}
                  placeholder="<style>/* CSS styles here */</style>&#10;<div class='container'>&#10;  <h1>Your Content</h1>&#10;  <p>HTML and CSS allowed, JavaScript is blocked for security.</p>&#10;</div>"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      fontSize: '0.9rem',
                    },
                  }}
                />
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button 
            onClick={handleCancel} 
            startIcon={<Cancel />}
            sx={{ borderRadius: 2, fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<Save />}
            disabled={saving}
            sx={{
              backgroundColor: '#007AFF',
              borderRadius: 2,
              px: 3,
              fontWeight: 500,
              '&:hover': { backgroundColor: '#0056CC' },
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
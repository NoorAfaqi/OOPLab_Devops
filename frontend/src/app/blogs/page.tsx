"use client";

import React, { useState, useEffect } from "react";
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
  Avatar,
  Skeleton,
  TextField,
  InputAdornment,
  Pagination,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Article,
  Person,
  Schedule,
  AccessTime,
  Search,
  Email,
  Send,
  Comment,
  Favorite,
} from "@mui/icons-material";
import { HeroSection } from "../../components";
import { fetchBlogs, BlogPost, BlogSearchParams, subscribeToNewsletter } from "../../lib/api";
import { useRouter } from "next/navigation";
import { sanitizeHTML } from "../../utils/sanitize";

export default function Blogs() {
  const router = useRouter();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  
  // Newsletter subscription states
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const itemsPerPage = 6;

  const fetchBlogPosts = async (page: number = 1, search: string = "", sort: string = "createdAt", order: "ASC" | "DESC" = "DESC") => {
    setLoading(true);
    setError(null);
    
    try {
      const params: BlogSearchParams = {
        page,
        limit: itemsPerPage,
        sortBy: sort,
        sortOrder: order,
      };
      
      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await fetchBlogs(params);
      
      if (response.success) {
        setBlogPosts(response.data.blogs);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
      } else {
        setError(response.message || 'Failed to fetch blogs');
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts(currentPage, searchTerm, sortBy, sortOrder);
  }, [currentPage, searchTerm, sortBy, sortOrder]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(newSortBy);
      setSortOrder("DESC");
    }
    setCurrentPage(1);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      setSnackbar({ open: true, message: "Please enter a valid email", severity: "error" });
      return;
    }

    setSubscribing(true);
    try {
      await subscribeToNewsletter(email.trim());
      setSnackbar({ open: true, message: "Successfully subscribed! Check your email for confirmation.", severity: "success" });
      setEmail("");
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || "Failed to subscribe. Please try again.", severity: "error" });
    } finally {
      setSubscribing(false);
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
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
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

  return (
    <Box sx={{ marginTop: 0, paddingTop: 0 }}>
      {/* Hero Section */}
      <HeroSection
        title="Our Blog &"
        subtitle="Insights"
        description="Stay updated with the latest insights, tutorials, and industry trends from our development team. Discover expert knowledge and practical tips to enhance your skills."
        backgroundImage="/blog-9-4.jpg"
        textColor="white"
        align="center"
        primaryAction={{
          label: "Subscribe",
          href: "#newsletter"
        }}
        secondaryAction={{
          label: "Latest Posts",
          href: "#blog-posts"
        }}
      />

      {/* Search and Filter Section */}
      <Box sx={{ py: 6, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          {/* Search Bar */}
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: 600,
                mx: 'auto',
                display: 'block',
              }}
            />
          </Box>

          {/* Sort Options */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mb: 4 }}>
            <Chip
              label={`Date ${sortBy === 'createdAt' ? (sortOrder === 'DESC' ? '↓' : '↑') : ''}`}
              onClick={() => handleSortChange('createdAt')}
              variant={sortBy === 'createdAt' ? "filled" : "outlined"}
              sx={{
                backgroundColor: sortBy === 'createdAt' ? '#007AFF' : 'transparent',
                color: sortBy === 'createdAt' ? 'white' : 'text.primary',
                borderColor: '#007AFF',
                '&:hover': {
                  backgroundColor: sortBy === 'createdAt' ? '#0056CC' : 'rgba(0, 122, 255, 0.04)',
                },
              }}
            />
            <Chip
              label={`Title ${sortBy === 'title' ? (sortOrder === 'DESC' ? '↓' : '↑') : ''}`}
              onClick={() => handleSortChange('title')}
              variant={sortBy === 'title' ? "filled" : "outlined"}
              sx={{
                backgroundColor: sortBy === 'title' ? '#007AFF' : 'transparent',
                color: sortBy === 'title' ? 'white' : 'text.primary',
                borderColor: '#007AFF',
                '&:hover': {
                  backgroundColor: sortBy === 'title' ? '#0056CC' : 'rgba(0, 122, 255, 0.04)',
                },
              }}
            />
          </Box>

          {/* Results Summary */}
          {!loading && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Showing {blogPosts.length} of {totalItems} blog posts
                {searchTerm && ` for "${searchTerm}"`}
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* Blog Posts Section */}
      <Box id="blog-posts" sx={{ py: 6, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Latest Blog Posts
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '600px', mx: 'auto' }}>
              Discover our latest insights, tutorials, and industry knowledge
            </Typography>
          </Box>

          {/* Error Message */}
          {error && (
            <Box sx={{ mb: 4 }}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            </Box>
          )}

          {/* Blog Posts Grid */}
          {loading ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: 4,
              }}
            >
              {[...Array(6)].map((_, index) => (
                <Card key={index}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={24} width="60%" />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={20} />
                    <Skeleton variant="text" height={20} width="40%" />
                  </CardContent>
                </Card>
              ))}
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
              {blogPosts.map((post) => (
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
                    }}
                  >
                    {!post.coverImage && <Article sx={{ fontSize: 48, opacity: 0.8 }} />}
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Read Time and Stats */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {getReadTime(post.content)} min read
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Comment sx={{ fontSize: 16, color: 'text.secondary' }} />
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
                      sx={{
                        backgroundColor: '#007AFF',
                        '&:hover': {
                          backgroundColor: '#0056CC',
                        },
                      }}
                      onClick={() => {
                        // Navigate to blog post using SSR URL structure
                        router.push(`/blogs/${post.author.username}/${post.slug}`);
                      }}
                    >
                      Read More
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
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

          {/* No Blog Posts Found */}
          {!loading && !error && blogPosts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 3,
                  backgroundColor: 'rgba(0, 122, 255, 0.1)',
                }}
              >
                <Article sx={{ fontSize: 32, color: '#007AFF' }} />
              </Avatar>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: 'text.primary',
                }}
              >
                No blog posts found
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {searchTerm 
                  ? `No blog posts found matching "${searchTerm}". Try a different search term.`
                  : 'No blog posts available at the moment. Check back later for new content.'
                }
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* Newsletter Section */}
      <Box id="newsletter" sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Card
            sx={{
              p: 6,
              textAlign: 'center',
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)'
                : 'linear-gradient(135deg, #F2F2F7 0%, #FFFFFF 100%)',
              border: (theme) => theme.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 122, 255, 0.1)',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 3,
                fontSize: '2rem',
                color: 'text.primary',
              }}
            >
              Stay Updated
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                mb: 4,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Subscribe to our newsletter and never miss a new blog post. Get the latest insights 
              delivered directly to your inbox.
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubscribe}
              sx={{
                display: 'flex',
                gap: 2,
                maxWidth: 500,
                mx: 'auto',
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <TextField
                fullWidth
                type="email"
                placeholder="Enter your email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribing}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<Send />}
                disabled={subscribing || !email.trim()}
                sx={{
                  backgroundColor: '#007AFF',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#0056CC',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(0, 122, 255, 0.3)',
                  },
                }}
              >
                {subscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </Box>
          </Card>
        </Container>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}


"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  Stack,
  Pagination,
  TextField,
  InputAdornment,
  Breadcrumbs,
} from "@mui/material";
import {
  Refresh,
  GetApp,
  Schedule,
  Visibility,
  Search,
  Clear,
  ChevronLeft,
  ChevronRight,
  NavigateNext,
  Home,
} from "@mui/icons-material";
import { useProducts } from "../../hooks/useProducts";
import { ApiProductsGrid } from "../../components/business/ApiProductCard";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ErrorState } from "../../components/ui/ErrorState";
import { HeroSection } from "../../components";
import { generateStructuredData } from "../../utils/seo";

export default function Products() {
  const { products, loading, error, refetch } = useProducts();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const productsPerPage = 2;

  const handleLearnMore = (product: any) => {
    // You can implement navigation to a detailed product page here
  };

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return products.filter((product: any) => {
      const name = product.name?.toLowerCase() || '';
      const description = product.description?.toLowerCase() || '';
      const features = product.features?.map((feature: any) => 
        typeof feature === 'string' ? feature.toLowerCase() : feature.name?.toLowerCase() || ''
      ).join(' ') || '';
      
      return name.includes(query) || 
             description.includes(query) || 
             features.includes(query);
    });
  }, [products, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, productsPerPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    scrollToProductsSection();
  };

  const scrollToProductsSection = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "CEO, TechCorp",
      initials: "SJ",
      quote: "OOPLab exceeded our expectations with their innovative approach and attention to detail.",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      hoverShadow: "0 20px 40px rgba(102, 126, 234, 0.3)"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "CTO, InnovateLabs",
      initials: "MC",
      quote: "Outstanding quality and professional service that transformed our operations completely.",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      hoverShadow: "0 20px 40px rgba(240, 147, 251, 0.3)"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Founder, StartupXYZ",
      initials: "ER",
      quote: "OOPLab was a game-changer for our business with robust, scalable solutions.",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      hoverShadow: "0 20px 40px rgba(79, 172, 254, 0.3)"
    },
    {
      id: 4,
      name: "David Kim",
      role: "VP Engineering, DataFlow",
      initials: "DK",
      quote: "Technical expertise and innovative solutions instrumental in our digital transformation.",
      gradient: "linear-gradient(135deg, #fa709a 0%, #ff6b6b 100%)",
      hoverShadow: "0 20px 40px rgba(250, 112, 154, 0.3)"
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Product Manager, CloudTech",
      initials: "LW",
      quote: "Exceptional service and cutting-edge technology that improved our efficiency significantly.",
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      hoverShadow: "0 20px 40px rgba(17, 153, 142, 0.3)"
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Director, FinanceFirst",
      initials: "JW",
      quote: "Reliability and performance exceeded expectations. Highly recommended for scaling businesses.",
      gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
      hoverShadow: "0 20px 40px rgba(255, 107, 107, 0.3)"
    }
  ];

  // Create endless carousel by duplicating testimonials
  const endlessTestimonials = [...testimonials, ...testimonials, ...testimonials];

  // Auto-slide functionality with endless effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex(prev => (prev + 1) % testimonials.length);
    }, 2500); // 2.5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Add Product structured data for SEO
  useEffect(() => {
    if (products.length === 0) return;

    // Add Product collection schema
    const productSchemas = products.slice(0, 5).map((product: any) => generateStructuredData({
      type: 'Product',
      data: {
        name: product.name,
        description: product.description,
        image: product.image || '/logo.png',
        rating: product.rating || { value: 5, count: 10 }
      }
    }));

    // Inject structured data
    const scripts: HTMLElement[] = [];
    productSchemas.forEach((schema, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `product-schema-${index}`;
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
      scripts.push(script);
    });

    return () => {
      scripts.forEach(script => script.remove());
    };
  }, [products]);

  return (
    <Box sx={{ marginTop: 0, paddingTop: 0 }}>

      {/* Hero Section */}
      <HeroSection
        title="Our Products &"
        subtitle="Services"
        description="We offer comprehensive technology solutions tailored to your business needs. Discover our innovative products designed to help you achieve your goals."
        backgroundImage="/rotating-card-bg-back.jpeg"
        textColor="white"
        align="center"
        primaryAction={{
          label: "Get Started",
          href: "/contact"
        }}
        secondaryAction={{
          label: "Learn More",
          href: "/about"
        }}
      />

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              What Makes Us Different?
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '600px', mx: 'auto' }}>
              We combine cutting-edge technology with proven methodologies to deliver exceptional results
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            <Card sx={{ 
              flex: 1, 
              p: 4, 
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              },
              transition: 'all 0.3s ease-in-out',
            }}>
              <CardContent>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  backgroundColor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  fontSize: '2rem',
                }}>
                  🚀
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                  Innovation First
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  We stay ahead of the curve with the latest technologies and innovative approaches to solve complex business challenges.
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ 
              flex: 1, 
              p: 4, 
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              },
              transition: 'all 0.3s ease-in-out',
            }}>
              <CardContent>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  backgroundColor: 'secondary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  fontSize: '2rem',
                }}>
                  🎯
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                  Results Driven
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  Every product we build is designed with measurable outcomes in mind, ensuring your investment delivers real value.
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ 
              flex: 1, 
              p: 4, 
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
              },
              transition: 'all 0.3s ease-in-out',
            }}>
              <CardContent>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  backgroundColor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  fontSize: '2rem',
                }}>
                  🔧
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                  Scalable Solutions
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  Our products grow with your business, providing flexible and scalable solutions that adapt to your changing needs.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Why Choose Us?
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '600px', mx: 'auto' }}>
              We deliver cutting-edge solutions that drive real business results
            </Typography>
          </Box>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ mb: 8 }}>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                100+
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Projects Completed
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                50+
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Happy Clients
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                24/7
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Support Available
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                99%
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Success Rate
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Products Section */}
      <Box id="products-section" sx={{ py: 8, backgroundColor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Our Products
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '600px', mx: 'auto', mb: 4 }}>
              Discover our innovative technology solutions designed to transform your business
            </Typography>
            
            {/* Search Box */}
            <Box sx={{ maxWidth: '500px', mx: 'auto', mb: 4 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search products by name, description, or features..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <Button
                        onClick={clearSearch}
                        sx={{ 
                          minWidth: 'auto', 
                          p: 0.5,
                          color: 'text.secondary',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          }
                        }}
                      >
                        <Clear />
                      </Button>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'background.default',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#007AFF',
                      },
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#007AFF',
                        borderWidth: 2,
                      },
                    },
                  },
                }}
              />
              
              {/* Search Results Info */}
              {searchQuery && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                  {filteredProducts.length === 0 
                    ? `No products found matching "${searchQuery}"`
                    : `Found ${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'} matching "${searchQuery}"`
                  }
                </Typography>
              )}
            </Box>
          </Box>

          {/* API Status Alert */}
          {error && (
            <Alert 
              severity="warning" 
              action={
                <Button color="inherit" size="small" onClick={refetch} startIcon={<Refresh />}>
                  Retry
                </Button>
              }
              sx={{ mb: 4 }}
            >
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <LoadingSpinner message="Loading products from database..." />
          )}

          {/* Error State */}
          {error && !loading && (
            <ErrorState 
              message={error}
              onRetry={refetch}
            />
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <>
              <ApiProductsGrid 
                products={paginatedProducts}
                columns={{ xs: 1, sm: 1, md: 2, lg: 3 }}
                onLearnMore={handleLearnMore}
              />
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mt: 6,
                  mb: 2
                }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setCurrentPage(Math.max(1, currentPage - 1));
                        scrollToProductsSection();
                      }}
                      disabled={currentPage === 1}
                      sx={{
                        borderColor: '#007AFF',
                        color: '#007AFF',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 122, 255, 0.1)',
                          borderColor: '#0056CC',
                        },
                        '&:disabled': {
                          borderColor: '#ccc',
                          color: '#ccc',
                        },
                      }}
                    >
                      Previous
                    </Button>
                    
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontSize: '1rem',
                          fontWeight: 600,
                          minWidth: '44px',
                          height: '44px',
                          borderRadius: '8px',
                          margin: '0 4px',
                          '&.Mui-selected': {
                            backgroundColor: '#007AFF',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#0056CC',
                            },
                          },
                          '&:hover': {
                            backgroundColor: 'rgba(0, 122, 255, 0.1)',
                          },
                        },
                      }}
                    />
                    
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setCurrentPage(Math.min(totalPages, currentPage + 1));
                        scrollToProductsSection();
                      }}
                      disabled={currentPage === totalPages}
                      sx={{
                        borderColor: '#007AFF',
                        color: '#007AFF',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 122, 255, 0.1)',
                          borderColor: '#0056CC',
                        },
                        '&:disabled': {
                          borderColor: '#ccc',
                          color: '#ccc',
                        },
                      }}
                    >
                      Next
                    </Button>
                  </Stack>
                </Box>
              )}
              
              {/* Pagination Info */}
              {totalPages > 1 && (
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                    {searchQuery && ` (filtered from ${products.length} total)`}
                  </Typography>
                </Box>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProducts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? 'No products found' : 'No products available'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery 
                  ? `No products match your search "${searchQuery}". Try a different search term.`
                  : 'There are currently no products available in the database.'
                }
              </Typography>
              {searchQuery && (
                <Button
                  onClick={clearSearch}
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  Clear Search
                </Button>
              )}
            </Box>
          )}
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              What Our Clients Say
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '600px', mx: 'auto' }}>
              Don't just take our word for it - hear from our satisfied customers
            </Typography>
          </Box>

          {/* Carousel Container */}
          <Box sx={{ 
            position: 'relative', 
            overflow: 'hidden', 
            borderRadius: 3,
            height: '400px',
            width: '100%',
            padding: '20px 0',
          }}>

            {/* Testimonials Carousel */}
            <Box
              sx={{
                display: 'flex',
                transform: `translateX(-${testimonialIndex * (100 / 3)}%)`,
                transition: 'transform 0.5s ease-in-out',
                gap: 2,
                height: '100%',
                overflow: 'visible',
                padding: '0 20px',
              }}
            >
              {endlessTestimonials.map((testimonial, index) => (
                <Box
                  key={`${testimonial.id}-${index}`}
                  sx={{
                    flex: '0 0 33.333%',
                    borderRadius: 3,
                    background: testimonial.gradient,
                    color: 'white',
                    position: 'relative',
                    height: '320px',
                    marginBottom: '40px',
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'visible',
                    '@media (max-width: 900px)': {
                      flex: '0 0 50%',
                    },
                    '@media (max-width: 600px)': {
                      flex: '0 0 100%',
                    },
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: testimonial.hoverShadow,
                      zIndex: 10,
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h2" sx={{ fontSize: '3rem', color: 'rgba(255,255,255,0.3)', mb: 0 }}>
                      "
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ 
                    fontStyle: 'italic', 
                    mb: 4, 
                    color: 'white',
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    fontWeight: 400,
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', // Enhanced text shadow for better readability
                  }}>
                    {testimonial.quote}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                    <Box sx={{ 
                      width: 50, 
                      height: 50, 
                      borderRadius: '50%', 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      fontSize: '1.5rem',
                      fontWeight: 600,
                    }}>
                      {testimonial.initials}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        color: 'white', 
                        mb: 0.5,
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.9)',
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      }}>
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, backgroundColor: 'background.paper' }}>
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
              Ready to Transform Your Business?
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
              Let's discuss how our innovative products can help you achieve your business objectives. 
              Get a free consultation and discover the perfect solution for your needs.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              <Button
                component={Link}
                href="/contact"
                variant="contained"
                size="large"
                startIcon={<GetApp />}
                sx={{
                  backgroundColor: '#007AFF',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#0056CC',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Get Free Consultation
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Visibility />}
                onClick={() => {
                  const productsSection = document.getElementById('products-section');
                  if (productsSection) {
                    productsSection.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }
                }}
                sx={{
                  borderColor: '#007AFF',
                  color: '#007AFF',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 122, 255, 0.04)',
                    borderColor: '#0056CC',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                View Our Portfolio
              </Button>
            </Stack>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  AppBar,
  Toolbar,
  Pagination,
  TextareaAutosize,
  TextField,
} from "@mui/material";
import {
  Dashboard,
  Contacts,
  People,
  Description,
  Logout,
  Refresh,
  Visibility,
  Reply,
  Archive,
  Send,
  LightMode,
  DarkMode,
  Analytics,
} from "@mui/icons-material";
import Footer from "../components/Footer";

export default function AdminPanel() {
  const router = useRouter();
  const { user, isAdmin, logout, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [contacts, setContacts] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  // Pagination states
  const [contactsPage, setContactsPage] = useState(1);
  const [subscribersPage, setSubscribersPage] = useState(1);
  const rowsPerPage = 10;

  // Newsletter states
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterHtml, setNewsletterHtml] = useState('');
  const [newsletterSubject, setNewsletterSubject] = useState('');
  
  // Theme mode state - initialize from localStorage using lazy initializer
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminDarkMode');
      return saved === 'true';
    }
    return false;
  });
  
  // Save dark mode to localStorage for Footer to access
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

  // Check if user is admin immediately and redirect if unauthorized
  useEffect(() => {
    // Don't run if we've already checked
    if (hasCheckedAuth) return;
    
    // Don't run until auth is loaded
    if (authLoading) {
      return;
    }

    const checkAuthorization = async () => {
      setHasCheckedAuth(true); // Mark that we've started checking
      
      // Check if authenticated first
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        // Not logged in - silently redirect to home (appears as 404)
        setTimeout(() => router.push('/'), 100);
        return;
      }
      
      // If no user from context yet, wait a bit and try again
      if (!user) {
        setTimeout(() => {
          setHasCheckedAuth(false);
        }, 500);
        return;
      }
      
      try {
        // Fetch fresh user data from backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/profile`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          // Authorization failed - silently redirect
          setTimeout(() => router.push('/'), 100);
          return;
        }
        
        const data = await response.json();
        
        // Check if user is admin
        if (data.data?.user?.role === 'admin') {
          // User is admin, allow access
          setIsAuthorized(true);
          setIsLoadingAuth(false);
        } else {
          // User is not admin - redirect
          setTimeout(() => router.push('/'), 500);
        }
      } catch (err) {
        // Error occurred - silently redirect
        setTimeout(() => router.push('/'), 100);
      }
    };
    
    checkAuthorization();
  }, [user, authLoading, router, hasCheckedAuth]);

  useEffect(() => {
    // Only fetch data if authorized
    if (isAuthorized) {
      fetchData();
    }
  }, [isAuthorized]);

  // OPTIMIZATION: Memoize fetchData with useCallback to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token');
      }

      const [contactsRes, subscribersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/contact?page=1&limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/subscribers?page=1&limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      ]);

      if (!contactsRes.ok || !subscribersRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const contactsData = await contactsRes.json();
      const subscribersData = await subscribersRes.json();

      setContacts(contactsData.data?.contacts || []);
      setSubscribers(subscribersData.data?.subscribers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // OPTIMIZATION: Memoize handleStatusChange with useCallback
  const handleStatusChange = useCallback(async (contactId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/contact/${contactId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }, [fetchData]);

  // OPTIMIZATION: Memoize pagination calculations with useMemo to prevent unnecessary recalculations
  const contactsPagination = useMemo(() => {
    const contactsStartIndex = (contactsPage - 1) * rowsPerPage;
    const contactsEndIndex = contactsStartIndex + rowsPerPage;
    const contactsToDisplay = contacts.slice(contactsStartIndex, contactsEndIndex);
    const contactsTotalPages = Math.ceil(contacts.length / rowsPerPage);
    return { contactsStartIndex, contactsEndIndex, contactsToDisplay, contactsTotalPages };
  }, [contacts, contactsPage, rowsPerPage]);

  const subscribersPagination = useMemo(() => {
    const subscribersStartIndex = (subscribersPage - 1) * rowsPerPage;
    const subscribersEndIndex = subscribersStartIndex + rowsPerPage;
    const subscribersToDisplay = subscribers.slice(subscribersStartIndex, subscribersEndIndex);
    const subscribersTotalPages = Math.ceil(subscribers.length / rowsPerPage);
    return { subscribersStartIndex, subscribersEndIndex, subscribersToDisplay, subscribersTotalPages };
  }, [subscribers, subscribersPage, rowsPerPage]);

  // Destructure for easier access
  const { contactsStartIndex, contactsEndIndex, contactsToDisplay, contactsTotalPages } = contactsPagination;
  const { subscribersStartIndex, subscribersEndIndex, subscribersToDisplay, subscribersTotalPages } = subscribersPagination;

  // OPTIMIZATION: Memoize handleViewContact with useCallback
  const handleViewContact = useCallback((contact: any) => {
    setSelectedContact(contact);
    setDialogOpen(true);
  }, []);

  const handleSendNewsletter = async () => {
    if (!newsletterSubject || !newsletterHtml) {
      setError('Please fill in both subject and HTML content');
      return;
    }

    setNewsletterLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/subscribers/send-newsletter`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subject: newsletterSubject,
            html: newsletterHtml,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setError(null);
        setNewsletterOpen(false);
        setNewsletterHtml('');
        setNewsletterSubject('');
        // Show success message
        alert(data.message || 'Newsletter sent successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send newsletter');
      }
    } catch (err) {
      console.error('Error sending newsletter:', err);
      setError('Failed to send newsletter');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'read':
        return 'info';
      case 'replied':
        return 'success';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  // Show loading while checking auth
  // Only show content if authorized
  if (!isAuthorized) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Verifying admin access...
          </Typography>
        </Box>
      </Box>
    );
  }
  
  // Show loading while fetching data
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Loading admin data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        backgroundColor: darkMode ? '#121212' : '#f5f5f5',
        color: darkMode ? '#ffffff' : '#000000',
        animation: 'fadeIn 0.3s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      }}
    >
      {/* Minimal Header */}
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
                <Dashboard sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', color: darkMode ? '#ffffff' : '#000000' }}>
                  Admin Panel
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
                  backgroundColor: '#007AFF',
                  color: '#ffffff',
                  border: '1px solid',
                  borderColor: '#007AFF',
                  '&:hover': {
                    backgroundColor: '#0056CC',
                  },
                }}
              >
                Dashboard
              </Button>
              <Button
                onClick={() => router.push('/admin/analytics')}
                startIcon={<Analytics />}
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
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, color: darkMode ? '#ffffff' : '#000000' }}>
            Welcome back, {user?.firstName}!
          </Typography>
          <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
            Manage your website content and subscribers
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              backgroundColor: darkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.08)',
              color: darkMode ? '#FF8A65' : '#C62828',
              '& .MuiAlert-icon': {
                color: darkMode ? '#EF5350' : '#D32F2F',
              },
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Stats Cards - Minimal Design */}
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
            gap: 2, 
            mb: 4 
          }}
        >
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
                  <Contacts sx={{ fontSize: 24, color: '#007AFF' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1.2, color: darkMode ? '#ffffff' : '#000000' }}>
                    {contacts.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.75rem' }}>
                    Contact Messages
                  </Typography>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
                  <People sx={{ fontSize: 24, color: '#34C759' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1.2, color: darkMode ? '#ffffff' : '#000000' }}>
                    {subscribers.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.75rem' }}>
                    Newsletter Subscribers
                  </Typography>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
                  <Description sx={{ fontSize: 24, color: '#FF9500' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1.2, color: darkMode ? '#ffffff' : '#000000' }}>
                    {contacts.filter(c => c.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.75rem' }}>
                    Pending Messages
                  </Typography>
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
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
                  <Reply sx={{ fontSize: 24, color: '#AF52DE' }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, lineHeight: 1.2, color: darkMode ? '#ffffff' : '#000000' }}>
                    {contacts.filter(c => c.status === 'replied').length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', fontSize: '0.75rem' }}>
                    Replied Messages
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Action Button */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: darkMode ? '#ffffff' : '#000000' }}>
              Contact Messages
            </Typography>
            <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
              Showing {contactsStartIndex + 1} to {Math.min(contactsEndIndex, contacts.length)} of {contacts.length} messages
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={fetchData}
            disabled={loading}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
              fontWeight: 500,
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Contacts Table */}
        <Card 
          sx={{ 
            mb: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            boxShadow: 'none',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 0, backgroundColor: 'transparent' }}>
            {loading ? (
              <Skeleton variant="rectangular" height={400} />
            ) : (
              <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600, py: 2, color: darkMode ? '#ffffff' : '#000000' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#000000' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#000000' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#000000' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#000000' }}>Company</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#000000' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#000000' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#000000' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contactsToDisplay.map((contact) => (
                    <TableRow 
                      key={contact.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        },
                      }}
                    >
                      <TableCell sx={{ py: 1.5, color: darkMode ? '#ffffff' : '#000000' }}>{contact.id}</TableCell>
                      <TableCell sx={{ py: 1.5, color: darkMode ? '#ffffff' : '#000000' }}>{contact.name}</TableCell>
                      <TableCell sx={{ py: 1.5, color: darkMode ? '#ffffff' : '#000000' }}>{contact.email}</TableCell>
                      <TableCell sx={{ py: 1.5, color: darkMode ? '#ffffff' : '#000000' }}>{contact.subject}</TableCell>
                      <TableCell sx={{ py: 1.5, color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>{contact.company || '-'}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          label={contact.status}
                          color={getStatusColor(contact.status) as any}
                          size="small"
                          sx={{ borderRadius: 1.5 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.5, color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewContact(contact)}
                          sx={{
                            borderRadius: 1.5,
                            color: darkMode ? '#ffffff' : '#000000',
                            '&:hover': {
                              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            },
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {contactsToDisplay.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        No contact messages found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Contacts Pagination */}
        {contactsTotalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, mt: 2 }}>
            <Pagination
              count={contactsTotalPages}
              page={contactsPage}
              onChange={(_, page) => setContactsPage(page)}
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

        {/* Subscribers Section */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: darkMode ? '#ffffff' : '#000000' }}>
              Newsletter Subscribers
            </Typography>
            <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
              Showing {subscribersStartIndex + 1} to {Math.min(subscribersEndIndex, subscribers.length)} of {subscribers.length} subscribers
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<Send />}
            onClick={() => setNewsletterOpen(true)}
            disabled={subscribers.length === 0}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
              fontWeight: 500,
              backgroundColor: '#007AFF',
              '&:hover': {
                backgroundColor: '#0056CC',
              },
            }}
          >
            Send Newsletter
          </Button>
        </Box>

        <Card 
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            boxShadow: 'none',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 0, backgroundColor: 'transparent' }}>
            {loading ? (
              <Skeleton variant="rectangular" height={300} />
            ) : (
              <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600, py: 2, color: darkMode ? '#ffffff' : '#000000' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#000000' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#000000' }}>Subscribed At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscribersToDisplay.map((subscriber) => (
                    <TableRow 
                      key={subscriber.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        },
                      }}
                    >
                      <TableCell sx={{ py: 1.5, color: darkMode ? '#ffffff' : '#000000' }}>{subscriber.id}</TableCell>
                      <TableCell sx={{ py: 1.5, color: darkMode ? '#ffffff' : '#000000' }}>{subscriber.email}</TableCell>
                      <TableCell sx={{ py: 1.5, color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        {new Date(subscriber.subscribedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {subscribersToDisplay.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4, color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        No subscribers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Subscribers Pagination */}
        {subscribersTotalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
            <Pagination
              count={subscribersTotalPages}
              page={subscribersPage}
              onChange={(_, page) => setSubscribersPage(page)}
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
      </Container>

      {/* Contact Details Dialog - Minimal Mac-Style Design */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid',
            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: darkMode ? '#ffffff' : '#000000' }}>
              Contact Details
            </Typography>
            {selectedContact && (
              <Chip
                label={selectedContact.status}
                color={getStatusColor(selectedContact.status) as any}
                size="small"
                sx={{ borderRadius: 2 }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Reply />}
              onClick={() => {
                if (selectedContact) {
                  handleStatusChange(selectedContact.id, 'replied');
                  setDialogOpen(false);
                }
              }}
              sx={{ 
                textTransform: 'none', 
                borderRadius: 2,
                borderColor: 'divider',
                fontWeight: 500,
              }}
            >
              Mark as Replied
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Archive />}
              onClick={() => {
                if (selectedContact) {
                  handleStatusChange(selectedContact.id, 'archived');
                  setDialogOpen(false);
                }
              }}
              sx={{ 
                textTransform: 'none', 
                borderRadius: 2,
                borderColor: 'divider',
                fontWeight: 500,
              }}
            >
              Archive
            </Button>
          </Box>
        </Box>

        {/* Content */}
        <DialogContent sx={{ p: 3, pt: 3, backgroundColor: darkMode ? '#1e1e1e' : '#ffffff' }}>
          {selectedContact && (
            <Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', mb: 0.5, display: 'block' }}>
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: darkMode ? '#ffffff' : '#000000' }}>
                    {selectedContact.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', mb: 0.5, display: 'block' }}>
                    Email
                  </Typography>
                  <Typography variant="body1" component="a" href={`mailto:${selectedContact.email}`} sx={{ fontWeight: 500, color: '#007AFF', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                    {selectedContact.email}
                  </Typography>
                </Box>
              </Box>

              {selectedContact.company && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', mb: 0.5, display: 'block' }}>
                    Company
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: darkMode ? '#ffffff' : '#000000' }}>
                    {selectedContact.company}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', mb: 0.5, display: 'block' }}>
                  Subject
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: darkMode ? '#ffffff' : '#000000' }}>
                  {selectedContact.subject}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', mb: 1, display: 'block' }}>
                  Message
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5',
                    border: '1px solid',
                    borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: darkMode ? '#ffffff' : '#000000',
                  }}
                >
                  {selectedContact.message}
                </Box>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5',
                  border: '1px solid',
                  borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Received
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {new Date(selectedContact.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        {/* Footer */}
        <Box
          sx={{
            p: 2.5,
            borderTop: '1px solid',
            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{ 
              textTransform: 'none', 
              borderRadius: 2,
              px: 3,
              fontWeight: 500,
            }}
          >
            Close
          </Button>
        </Box>
      </Dialog>

      {/* Newsletter Modal */}
      <Dialog 
        open={newsletterOpen} 
        onClose={() => setNewsletterOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 4 },
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            maxHeight: { xs: '100vh', sm: '90vh' },
            margin: { xs: 0, sm: 'auto' },
            width: { xs: '100%', sm: 'auto' },
          },
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            borderBottom: '1px solid',
            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
          }}
        >
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            mb: 1, 
            color: darkMode ? '#ffffff' : '#000000',
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}>
            Send Newsletter to Subscribers
          </Typography>
          <Typography variant="caption" sx={{ 
            color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
            fontSize: { xs: '0.7rem', sm: '0.875rem' }
          }}>
            {subscribers.length} subscribers will receive this email
          </Typography>
        </Box>
        
        <Box sx={{ p: { xs: 2, sm: 3 }, pt: 3, backgroundColor: darkMode ? '#1e1e1e' : '#ffffff', maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ 
              color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', 
              mb: 1, 
              display: 'block',
              fontWeight: 500
            }}>
              Subject *
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter email subject"
              value={newsletterSubject}
              onChange={(e) => setNewsletterSubject(e.target.value)}
              disabled={newsletterLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: darkMode ? '#121212' : '#ffffff',
                  '& fieldset': {
                    borderColor: darkMode ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: darkMode ? 'rgba(255,255,255,0.3)' : '#d0d0d0',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#007AFF',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: darkMode ? '#ffffff' : '#000000',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
                  opacity: 1,
                },
              }}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ 
              color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)', 
              mb: 1, 
              display: 'block',
              fontWeight: 500
            }}>
              HTML Content *
            </Typography>
            <TextareaAutosize
              minRows={12}
              maxRows={20}
              value={newsletterHtml}
              onChange={(e) => setNewsletterHtml(e.target.value)}
              disabled={newsletterLoading}
              placeholder='<!DOCTYPE html><html><body><h1>Hello!</h1><p>Your newsletter content here...</p></body></html>'
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e0e0e0',
                  backgroundColor: darkMode ? '#121212' : '#ffffff',
                  color: darkMode ? '#ffffff' : '#000000',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  resize: 'vertical',
                  outline: 'none',
                }}
            />
          </Box>

          <Alert 
            severity="info" 
            sx={{ 
              mt: 2,
              backgroundColor: darkMode ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.08)',
              color: darkMode ? '#81C784' : '#1565C0',
              '& .MuiAlert-icon': {
                color: darkMode ? '#64B5F6' : '#1976D2',
              },
            }}
          >
            This email will be sent to your account with all subscribers in BCC
          </Alert>
        </Box>

        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderTop: '1px solid',
            borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            display: 'flex',
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            justifyContent: 'flex-end',
            gap: 2,
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
          }}
        >
          <Button
            onClick={() => {
              setNewsletterOpen(false);
              setNewsletterHtml('');
              setNewsletterSubject('');
            }}
            disabled={newsletterLoading}
            sx={{ 
              textTransform: 'none', 
              borderRadius: 2, 
              px: 3,
              width: { xs: '100%', sm: 'auto' },
              color: darkMode ? '#ffffff' : '#000000',
              borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              },
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendNewsletter}
            disabled={newsletterLoading || !newsletterSubject || !newsletterHtml}
            variant="contained"
            startIcon={<Send />}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              width: { xs: '100%', sm: 'auto' },
              backgroundColor: '#007AFF',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#0056CC',
              },
              '&.Mui-disabled': {
                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
              },
            }}
          >
            {newsletterLoading ? 'Sending...' : 'Send Newsletter'}
          </Button>
        </Box>
      </Dialog>
      
      {/* Footer */}
      <Footer />
    </Box>
  );
}


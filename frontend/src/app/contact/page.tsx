"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import {
  Email,
  Phone,
  LocationOn,
  Schedule,
} from "@mui/icons-material";
import { HeroSection } from "../../components";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", company: "", subject: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Email sx={{ fontSize: 32, color: '#007AFF' }} />,
      title: "Email",
      details: "noorafaqi@ooplab.org",
      description: "Send us an email anytime",
    },
    {
      icon: <Phone sx={{ fontSize: 32, color: '#34C759' }} />,
      title: "Phone",
      details: "+33 7 59 15 24 23",
      description: "Call us during business hours",
    },
    {
      icon: <LocationOn sx={{ fontSize: 32, color: '#FF9500' }} />,
      title: "Office",
      details: "Paris, France",
      description: "Visit our headquarters",
    },
  ];

  const businessHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ];

  return (
    <Box sx={{ marginTop: 0, paddingTop: 0 }}>
      {/* Hero Section */}
      <HeroSection
        title="Contact Us"
        subtitle="Get In Touch"
        description="Ready to start your next project? Get in touch with our team and let's discuss how we can help bring your vision to life."
        primaryAction={{
          label: "Send Message",
          href: "#contact-form",
        }}
        secondaryAction={{
          label: "Call Us",
          href: "tel:+33759152423",
        }}
        backgroundImage="/bg-coworking.jpeg"
        textColor="white"
      />

      {/* Contact Form & Info Section */}
      <Box id="contact-form" sx={{ py: 8, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: '2fr 1fr',
              },
              gap: 6,
            }}
          >
            {/* Contact Form */}
            <Box>
              <Card
                sx={{
                  p: 4,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: 'text.primary',
                  }}
                >
                  Send us a Message
                </Typography>
                
                {submitStatus === "success" && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Thank you! Your message has been sent successfully. We&apos;ll get back to you soon.
                  </Alert>
                )}

                {submitStatus === "error" && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    Sorry, there was an error sending your message. Please try again.
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: '1fr 1fr',
                        },
                        gap: 3,
                      }}
                    >
                      <TextField
                        fullWidth
                        id="name"
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        variant="outlined"
                      />
                      <TextField
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        variant="outlined"
                      />
                    </Box>
                    <TextField
                      fullWidth
                      id="company"
                      label="Company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      variant="outlined"
                    />
                    <FormControl fullWidth required>
                      <InputLabel id="subject-label">Subject</InputLabel>
                      <Select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleSelectChange}
                        labelId="subject-label"
                        label="Subject"
                      >
                        <MenuItem value="">Select a subject</MenuItem>
                        <MenuItem value="web-development">Web Development</MenuItem>
                        <MenuItem value="mobile-app">Mobile App Development</MenuItem>
                        <MenuItem value="api-development">API Development</MenuItem>
                        <MenuItem value="cloud-solutions">Cloud Solutions</MenuItem>
                        <MenuItem value="consultation">Consultation</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      id="message"
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      multiline
                      rows={5}
                      variant="outlined"
                      placeholder="Tell us about your project requirements..."
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={isSubmitting}
                      sx={{
                        backgroundColor: '#007AFF',
                        py: 1.5,
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: '#0056CC',
                        },
                      }}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Box>

            {/* Contact Information */}
            <Box>
              <Stack spacing={4}>
                {/* Contact Info Cards */}
                {contactInfo.map((info, index) => (
                  <Card
                    key={index}
                    sx={{
                      p: 3,
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ mr: 2 }}>
                        {info.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            fontSize: '1rem',
                          }}
                        >
                          {info.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 500,
                          }}
                        >
                          {info.details}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                      }}
                    >
                      {info.description}
                    </Typography>
                  </Card>
                ))}

                {/* Business Hours */}
                <Card
                  sx={{
                    p: 3,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ mr: 2 }}>
                      <Schedule sx={{ fontSize: 24, color: '#007AFF' }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: '1rem',
                      }}
                    >
                      Business Hours
                    </Typography>
                  </Box>
                  <Stack spacing={1}>
                    {businessHours.map((schedule, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.875rem',
                          }}
                        >
                          {schedule.day}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                          }}
                        >
                          {schedule.hours}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
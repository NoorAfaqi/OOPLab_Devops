"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../ui/Container';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';

interface Technology {
  id: string;
  name: string;
  category: string;
  logo: string;
  description: string;
  color: string;
  gradient: string;
}

interface TechnologiesCarouselProps {
  technologies: Technology[];
  autoPlay?: boolean;
  interval?: number;
}

export const TechnologiesCarousel: React.FC<TechnologiesCarouselProps> = ({
  technologies,
  autoPlay = true,
  interval = 2500,
}) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!autoPlay || isHovered) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % technologies.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, technologies.length, isHovered]);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? technologies.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % technologies.length);
  };

  const currentTech = technologies[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const transition = {
    x: { type: "spring", stiffness: 300, damping: 30 },
    opacity: { duration: 0.5 },
    scale: { duration: 0.5 },
  };

  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        backgroundColor: 'background.default',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Heading variant="h2" align="center" sx={{ 
              fontSize: { xs: '2rem', md: '2.5rem' }, 
              mb: 2,
              color: 'text.primary',
            }}>
              Technologies We Master
            </Heading>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Text 
              variant="body1" 
              sx={{ 
                maxWidth: '600px', 
                mx: 'auto', 
                lineHeight: 1.6,
                fontSize: { xs: '1rem', md: '1.125rem' },
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              We leverage cutting-edge technologies to build robust, scalable, and modern solutions that drive innovation and success.
            </Text>
          </motion.div>
        </Box>

        {/* Main Carousel Container */}
        <Box
          sx={{
            position: 'relative',
            maxWidth: { xs: '100%', sm: '600px', md: '800px' },
            mx: 'auto',
            mb: 4,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main Technology Card */}
          <Box sx={{ position: 'relative', height: { xs: '350px', sm: '400px', md: '450px' } }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      background: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${currentTech.color}20 0%, ${currentTech.color}10 100%)`
                        : `linear-gradient(135deg, ${currentTech.color}15 0%, ${currentTech.color}05 100%)`,
                      border: `2px solid ${currentTech.color}30`,
                      boxShadow: theme.palette.mode === 'dark'
                        ? `0 8px 32px ${currentTech.color}20`
                        : `0 8px 32px ${currentTech.color}15`,
                      position: 'relative',
                      overflow: 'hidden',
                      backgroundColor: 'background.paper',
                    }}
                  >
                    {/* Subtle background pattern */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: theme.palette.mode === 'dark'
                          ? 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)'
                          : 'radial-gradient(circle at 20% 20%, rgba(0,0,0,0.02) 0%, transparent 50%)',
                        zIndex: 1,
                      }}
                    />

                    <Box
                      sx={{
                        position: 'relative',
                        zIndex: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: { xs: 3, md: 4 },
                        textAlign: 'center',
                      }}
                    >
                      {/* Technology Logo */}
                      <motion.div
                        animate={{
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          marginBottom: '1.5rem',
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                        }}
                      >
                        <Box
                          component="img"
                          src={currentTech.logo}
                          alt={`${currentTech.name} logo`}
                          sx={{
                            width: { xs: '80px', sm: '100px', md: '120px' },
                            height: { xs: '80px', sm: '100px', md: '120px' },
                            objectFit: 'contain',
                            filter: 'brightness(1.1)',
                          }}
                        />
                      </motion.div>
                      
                      {/* Technology Name */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            color: 'text.primary',
                            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {currentTech.name}
                        </Typography>
                      </motion.div>

                      {/* Category Chip */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                      >
                        <Chip
                          label={currentTech.category}
                          sx={{
                            mb: 3,
                            backgroundColor: currentTech.color,
                            color: 'white',
                            fontWeight: 600,
                            fontSize: { xs: '0.875rem', md: '1rem' },
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            '&:hover': {
                              backgroundColor: currentTech.color,
                              opacity: 0.9,
                            },
                          }}
                        />
                      </motion.div>

                      {/* Description */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'text.secondary',
                            fontSize: { xs: '1rem', md: '1.125rem' },
                            lineHeight: 1.6,
                            maxWidth: { xs: '280px', sm: '400px', md: '500px' },
                            fontWeight: 400,
                          }}
                        >
                          {currentTech.description}
                        </Typography>
                      </motion.div>
                    </Box>
                  </Box>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: { xs: -35, sm: -50, md: -60 },
                transform: 'translateY(-50%)',
                zIndex: 10,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{ cursor: 'pointer' }}
                onClick={handlePrevious}
              >
                <Box
                  sx={{
                    width: { xs: 40, sm: 45, md: 50 },
                    height: { xs: 40, sm: 45, md: 50 },
                    borderRadius: '50%',
                    backgroundColor: 'background.paper',
                    border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.primary',
                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                    fontWeight: 'bold',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 4px 12px rgba(0,0,0,0.3)'
                      : '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 6px 20px rgba(0,0,0,0.4)'
                        : '0 6px 20px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  ‹
                </Box>
              </motion.div>
            </Box>

            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                right: { xs: -35, sm: -50, md: -60 },
                transform: 'translateY(-50%)',
                zIndex: 10,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{ cursor: 'pointer' }}
                onClick={handleNext}
              >
                <Box
                  sx={{
                    width: { xs: 40, sm: 45, md: 50 },
                    height: { xs: 40, sm: 45, md: 50 },
                    borderRadius: '50%',
                    backgroundColor: 'background.paper',
                    border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.primary',
                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                    fontWeight: 'bold',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 4px 12px rgba(0,0,0,0.3)'
                      : '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 6px 20px rgba(0,0,0,0.4)'
                        : '0 6px 20px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  ›
                </Box>
              </motion.div>
            </Box>
          </Box>

          {/* Progress Dots */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1.5,
              mt: 3,
              flexWrap: 'wrap',
            }}
          >
            {technologies.map((_, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
              >
                <Box
                  sx={{
                    width: index === currentIndex ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: index === currentIndex 
                      ? currentTech.color 
                      : theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.3)' 
                        : 'rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    boxShadow: index === currentIndex 
                      ? `0 2px 8px ${currentTech.color}40` 
                      : 'none',
                  }}
                />
              </motion.div>
            ))}
          </Box>
        </Box>

        {/* Technology Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
              }}
            >
              {currentIndex + 1} of {technologies.length} Technologies
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default TechnologiesCarousel;
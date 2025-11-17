import React from 'react';
import { Box, Stack, Avatar, Chip } from '@mui/material';
import { Article, Person, Schedule, AccessTime } from '@mui/icons-material';
import { CustomCard } from '../ui/CustomCard';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { CustomButton } from '../ui/CustomButton';
import { Article as ArticleType } from '../../types';

interface ArticleCardProps {
  article: ArticleType;
  onReadMore?: (article: ArticleType) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onReadMore }) => {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Web Development': '#007AFF',
      'Programming': '#34C759',
      'Backend Development': '#5856D6',
      'Frontend Development': '#FF9500',
    };
    return colors[category] || '#007AFF';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <CustomCard
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      actions={
        <CustomButton
          variant="contained"
          fullWidth
          onClick={() => onReadMore?.(article)}
        >
          Read More
        </CustomButton>
      }
    >
      {/* Article Image */}
      <Box
        sx={{
          height: 200,
          background: `linear-gradient(135deg, ${getCategoryColor(article.category)} 0%, ${getCategoryColor(article.category)}CC 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          mb: 3,
          borderRadius: 2,
        }}
      >
        <Article sx={{ fontSize: 48, opacity: 0.8 }} />
      </Box>

      {/* Category and Read Time */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Chip
          label={article.category}
          size="small"
          sx={{
            backgroundColor: getCategoryColor(article.category),
            color: 'white',
            fontSize: '0.75rem',
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Text variant="caption">
            {article.readTime} min read
          </Text>
        </Box>
      </Box>

      {/* Title */}
      <Heading variant="h6" sx={{ mb: 2, fontSize: '1.1rem', lineHeight: 1.3 }}>
        {article.title}
      </Heading>

      {/* Excerpt */}
      <Text 
        sx={{ 
          mb: 3,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {article.excerpt}
      </Text>

      {/* Author and Date */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
          <Person sx={{ fontSize: 16 }} />
        </Avatar>
        <Text variant="caption">
          {article.author}
        </Text>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
          <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Text variant="caption">
            {formatDate(article.publishedAt)}
          </Text>
        </Box>
      </Box>
    </CustomCard>
  );
};

interface ArticlesGridProps {
  articles: ArticleType[];
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
  onReadMore?: (article: ArticleType) => void;
}

export const ArticlesGrid: React.FC<ArticlesGridProps> = ({ 
  articles, 
  columns = { xs: 1, md: 2, lg: 3 },
  onReadMore 
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: `repeat(${columns.xs || 1}, 1fr)`,
          sm: `repeat(${columns.sm || 1}, 1fr)`,
          md: `repeat(${columns.md || 2}, 1fr)`,
          lg: `repeat(${columns.lg || 3}, 1fr)`,
        },
        gap: 4,
      }}
    >
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} onReadMore={onReadMore} />
      ))}
    </Box>
  );
};

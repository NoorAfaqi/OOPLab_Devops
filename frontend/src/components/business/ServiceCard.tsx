import React from 'react';
import { Box, Stack, Avatar, Chip } from '@mui/material';
import { 
  Computer, 
  PhoneAndroid, 
  Psychology, 
  CloudQueue 
} from '@mui/icons-material';
import { CustomCard } from '../ui/CustomCard';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { Service } from '../../types';

interface ServiceCardProps {
  service: Omit<Service, 'icon'>;
  index?: number;
}

const getServiceIcon = (title: string, color: string) => {
  const iconProps = { sx: { fontSize: 40, color } };
  
  switch (title) {
    case 'Web Development':
      return <Computer {...iconProps} />;
    case 'Mobile Apps':
      return <PhoneAndroid {...iconProps} />;
    case 'AI Solutions':
      return <Psychology {...iconProps} />;
    case 'Cloud Solutions':
      return <CloudQueue {...iconProps} />;
    default:
      return <Computer {...iconProps} />;
  }
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, index = 0 }) => {
  return (
    <CustomCard
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        width: '100%', // Ensure full width within grid cell
        maxWidth: '300px', // Prevent cards from becoming too wide
      }}
    >
      <Box sx={{ mb: 2 }}>
        {getServiceIcon(service.title, service.color)}
      </Box>
      <Heading variant="h6" align="center" sx={{ mb: 2, fontSize: '1.25rem' }}>
        {service.title}
      </Heading>
      <Text sx={{ flexGrow: 1, textAlign: 'center' }}>
        {service.description}
      </Text>
    </CustomCard>
  );
};

interface ServicesGridProps {
  services: Omit<Service, 'icon'>[];
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ 
  services, 
  columns = { xs: 1, sm: 2, md: 4 } 
}) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: `repeat(${columns.xs || 1}, 1fr)`,
          sm: `repeat(${columns.sm || 2}, 1fr)`,
          md: `repeat(${columns.md || 4}, 1fr)`,
          lg: `repeat(${columns.lg || 4}, 1fr)`,
        },
        gap: 4,
        alignItems: 'stretch', // Ensure all cards have equal height
        justifyItems: 'center', // Center the cards within their grid cells
      }}
    >
      {services.map((service, index) => (
        <ServiceCard key={service.id} service={service} index={index} />
      ))}
    </Box>
  );
};

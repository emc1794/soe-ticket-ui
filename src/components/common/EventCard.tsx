import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  Box, 
  Chip,
  CardActionArea
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Event } from '../../features/types';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={RouterLink} to={`/events/${event.id}`}>
        <CardMedia
          component="img"
          height="180"
          image={event.imageUrl}
          alt={event.title}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ mb: 1 }}>
            <Chip 
              label={event.category} 
              size="small" 
              color="primary" 
              variant="outlined" 
              sx={{ mr: 1 }}
            />
            {event.status !== 'Disponible' && (
              <Chip 
                label={event.status} 
                size="small" 
                color="secondary" 
              />
            )}
          </Box>
          <Typography gutterBottom variant="h6" component="h2" noWrap>
            {event.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
            {event.date} • {event.time}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOnIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
            {event.venue?.name}, {event.venue?.city}
          </Typography>
          <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>
            Desde ${event.minPrice.toLocaleString()}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Box sx={{ p: 2, pt: 0 }}>
        <Button 
          fullWidth 
          variant="contained" 
          component={RouterLink} 
          to={`/events/${event.id}`}
          disabled={event.status === 'Agotado'}
        >
          Ver Entradas
        </Button>
      </Box>
    </Card>
  );
};

export default EventCard;

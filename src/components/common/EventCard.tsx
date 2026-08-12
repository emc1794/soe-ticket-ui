import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box, Chip, CardActionArea } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Event } from '../../features/types';

interface EventCardProps {
  event: Event;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop';

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const isCancelled = event.status === 'CANCELLED';
  const eventDate = new Date(event.date);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={RouterLink} to={`/events/${event.id}`}>
        <CardMedia component="img" height="180" image={event.metadata.imageUrl || FALLBACK_IMAGE} alt={event.title} />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ mb: 1 }}>
            {event.metadata.category && (
              <Chip label={event.metadata.category} size="small" color="primary" variant="outlined" sx={{ mr: 1 }} />
            )}
            {isCancelled && <Chip label="Cancelado" size="small" color="error" />}
          </Box>
          <Typography gutterBottom variant="h6" component="h2" noWrap>
            {event.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
            {eventDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })} •{' '}
            {eventDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOnIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
            {event.metadata.venueName ? `${event.metadata.venueName}, ` : ''}
            {event.city}
          </Typography>
          {event.metadata.minPrice !== undefined && (
            <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>
              Desde ${event.metadata.minPrice.toLocaleString()}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
      <Box sx={{ p: 2, pt: 0 }}>
        <Button fullWidth variant="contained" component={RouterLink} to={`/events/${event.id}`} disabled={isCancelled}>
          Ver Entradas
        </Button>
      </Box>
    </Card>
  );
};

export default EventCard;

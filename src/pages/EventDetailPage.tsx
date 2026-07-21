import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Grid, 
  Box, 
  Button, 
  CircularProgress,
  Breadcrumbs,
  Link,
  Paper,
  Divider,
  Chip,
  Tabs,
  Tab,
  Container
} from '@mui/material';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { api } from '../services/api';
import { Event, TicketType } from '../features/types';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const eventData = await api.events.getById(id);
        if (eventData) {
          setEvent(eventData);
          const tickets = await api.tickets.getTypes(id);
          setTicketTypes(tickets);
        } else {
          navigate('/events');
        }
      } catch (error) {
        console.error('Error fetching event detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [id, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 20 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!event) return null;

  return (
    <Container maxWidth="lg">
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/">
          Inicio
        </Link>
        <Link component={RouterLink} underline="hover" color="inherit" to="/events">
          Eventos
        </Link>
        <Typography color="text.primary">{event.title}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Banner e Imagen */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 3 }}>
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '500px', objectFit: 'cover' }}
            />
          </Paper>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab label="Descripción" />
              <Tab label="Recinto y Mapa" />
              <Tab label="Términos y Condiciones" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Acerca de este evento
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                {event.description}
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </Typography>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {event.venue?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {event.venue?.address}, {event.venue?.city}
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  height: 300, 
                  bgcolor: 'grey.100', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mt: 2
                }}
              >
                <Typography color="text.secondary">
                  [Integración de Google Maps aquí]
                </Typography>
              </Paper>
            </Box>
          )}

          {activeTab === 2 && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Información importante
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • No se permiten reingresos una vez que el ticket ha sido escaneado.<br/>
                • Prohibido el ingreso de cámaras profesionales y punteros láser.<br/>
                • Todos los asistentes deben portar su ticket digital o impreso.<br/>
                • Política de reembolso: Solo aplicable en caso de cancelación o cambio de fecha por parte del organizador.
              </Typography>
            </Box>
          )}
        </Grid>

        {/* Info lateral y CTA */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 4, position: 'sticky', top: 20 }}>
            <Chip 
              label={event.category} 
              color="primary" 
              sx={{ mb: 2 }}
            />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              {event.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {event.artist}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarTodayIcon color="action" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>FECHA Y HORA</Typography>
                <Typography variant="body2" color="text.secondary">{event.date} a las {event.time}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LocationOnIcon color="action" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>UBICACIÓN</Typography>
                <Typography variant="body2" color="text.secondary">{event.venue?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{event.venue?.address}, {event.venue?.city}</Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: 'primary.light', p: 2, borderRadius: 2, mb: 3, color: 'primary.contrastText' }}>
              <Typography variant="subtitle2">DESDE</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                ${event.minPrice.toLocaleString()}
              </Typography>
            </Box>

            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              startIcon={<ConfirmationNumberIcon />}
              component={RouterLink}
              to={`/purchase/${event.id}`}
              sx={{ height: 60, borderRadius: 2, fontSize: '1.1rem' }}
              disabled={event.status === 'Agotado'}
            >
              Seleccionar Entradas
            </Button>
            
            {event.status === 'Agotado' && (
              <Typography color="error" align="center" sx={{ mt: 1, fontWeight: 'bold' }}>
                EVENTO AGOTADO
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventDetailPage;

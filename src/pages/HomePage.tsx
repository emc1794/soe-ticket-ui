import React, { useEffect, useState } from 'react';
import { Typography, Grid, TextField, Button, Paper, Box, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Event } from '../features/types';
import EventCard from '../components/common/EventCard';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.events.list();
        setFeaturedEvents(data.slice(0, 6)); // Mostrar los primeros 6
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/events?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <Box>
      <Box sx={{ 
        textAlign: 'center', 
        mb: 6, 
        py: 8, 
        background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
        color: 'white',
        borderRadius: 4,
        boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
      }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          TicketWave
        </Typography>
        <Typography variant="h5">
          Tus entradas para los mejores eventos están aquí
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 6, mt: -6, mx: { xs: 2, md: 8 }, borderRadius: 4 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Artista, evento o lugar"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SearchIcon />}
                sx={{ height: '56px', borderRadius: 2 }}
              >
                Buscar Eventos
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Eventos Destacados
        </Typography>
        <Button color="primary" onClick={() => navigate('/events')}>
          Ver todos
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {featuredEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <EventCard event={event} />
            </Grid>
          ))}
          {featuredEvents.length === 0 && (
            <Grid item xs={12}>
              <Typography align="center" color="text.secondary">
                No hay eventos disponibles en este momento.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default HomePage;

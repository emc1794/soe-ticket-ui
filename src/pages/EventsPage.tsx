import React, { useEffect, useState, useMemo } from 'react';
import { 
  Typography, 
  Grid, 
  Box, 
  TextField, 
  MenuItem, 
  InputAdornment, 
  CircularProgress,
  Breadcrumbs,
  Link,
  Divider,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { api } from '../services/api';
import { Event } from '../features/types';
import EventCard from '../components/common/EventCard';

const EventsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [cityFilter, setCityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await api.events.list();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
                             event.artist.toLowerCase().includes(search.toLowerCase());
        const matchesCity = cityFilter === 'all' || event.city === cityFilter;
        const matchesCategory = categoryFilter === 'all' || event.metadata.category === categoryFilter;
        return matchesSearch && matchesCity && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'date') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'price-low') return (a.metadata.minPrice ?? 0) - (b.metadata.minPrice ?? 0);
        if (sortBy === 'price-high') return (b.metadata.minPrice ?? 0) - (a.metadata.minPrice ?? 0);
        return 0;
      });
  }, [events, search, cityFilter, categoryFilter, sortBy]);

  const cities = Array.from(new Set(events.map(e => e.city).filter(Boolean)));
  const categories = Array.from(new Set(events.map(e => e.metadata.category).filter(Boolean)));

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/">
          Inicio
        </Link>
        <Typography color="text.primary">Eventos</Typography>
      </Breadcrumbs>

      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Explorar Eventos
      </Typography>

      <Box sx={{ mb: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar por nombre o artista"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Ciudad</InputLabel>
              <Select
                value={cityFilter}
                label="Ciudad"
                onChange={(e: SelectChangeEvent) => setCityFilter(e.target.value)}
              >
                <MenuItem value="all">Todas las ciudades</MenuItem>
                {cities.map(city => (
                  <MenuItem key={city} value={city}>{city}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={categoryFilter}
                label="Categoría"
                onChange={(e: SelectChangeEvent) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">Todas</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                label="Ordenar por"
                onChange={(e: SelectChangeEvent) => setSortBy(e.target.value)}
              >
                <MenuItem value="date">Fecha</MenuItem>
                <MenuItem value="price-low">Precio más bajo</MenuItem>
                <MenuItem value="price-high">Precio más alto</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Se encontraron {filteredEvents.length} eventos
          </Typography>
          
          <Grid container spacing={3}>
            {filteredEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard event={event} />
              </Grid>
            ))}
          </Grid>
          
          {filteredEvents.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography variant="h6" color="text.secondary">
                No se encontraron eventos que coincidan con tus filtros.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default EventsPage;

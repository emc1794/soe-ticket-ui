import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Grid, 
  Box, 
  Button, 
  CircularProgress,
  Paper,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Container,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TimerIcon from '@mui/icons-material/Timer';
import { api } from '../services/api';
import { Event, TicketType, Seat } from '../features/types';
import { useCart } from '../hooks/useCart';
import SeatMap from '../features/tickets/components/SeatMap';

const PurchasePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cart, addItem, clearCart, isExpired } = useCart();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTicketCounts, setSelectedTicketCounts] = useState<Record<string, number>>({});
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const eventData = await api.events.getById(id);
        if (eventData) {
          setEvent(eventData);
          if (eventData.venue?.hasAssignedSeating) {
            const seatData = await api.tickets.getSeats(id, 'Platea');
            setSeats(seatData);
          } else {
            const tickets = await api.tickets.getTypes(id);
            setTicketTypes(tickets);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleTicketCountChange = (ticketId: string, delta: number) => {
    setSelectedTicketCounts(prev => {
      const current = prev[ticketId] || 0;
      const newValue = Math.max(0, Math.min(10, current + delta)); // Máximo 10 por compra
      return { ...prev, [ticketId]: newValue };
    });
  };

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeatIds(prev => {
      if (prev.includes(seat.id)) {
        return prev.filter(s => s !== seat.id);
      }
      if (prev.length >= 10) {
        setError("Puedes seleccionar un máximo de 10 asientos.");
        return prev;
      }
      return [...prev, seat.id];
    });
  };

  const handleAddToCart = () => {
    if (!event) return;

    if (event.venue?.hasAssignedSeating) {
      if (selectedSeatIds.length === 0) {
        setError("Por favor selecciona al menos un asiento.");
        return;
      }
      selectedSeatIds.forEach(seatId => {
        const seat = seats.find(s => s.id === seatId);
        if (seat) {
          addItem({
            id: seat.id,
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            venueName: event.venue?.name || '',
            seatId: seat.id,
            seatLabel: `${seat.row}-${seat.number}`,
            price: seat.price,
            quantity: 1
          });
        }
      });
    } else {
      const selected = Object.entries(selectedTicketCounts).filter(([_, count]) => count > 0);
      if (selected.length === 0) {
        setError("Por favor selecciona al menos una entrada.");
        return;
      }
      selected.forEach(([ticketId, count]) => {
        const type = ticketTypes.find(t => t.id === ticketId);
        if (type) {
          addItem({
            id: type.id,
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            venueName: event.venue?.name || '',
            ticketTypeId: type.id,
            ticketTypeName: type.name,
            price: type.price,
            quantity: count
          });
        }
      });
    }
    navigate('/checkout');
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 20 }}><CircularProgress /></Box>;
  if (!event) return null;

  return (
    <Container maxWidth="lg">
      <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
        <Step><StepLabel>Seleccionar Entradas</StepLabel></Step>
        <Step><StepLabel>Información de Pago</StepLabel></Step>
        <Step><StepLabel>Confirmación</StepLabel></Step>
      </Stepper>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            {event.venue?.hasAssignedSeating ? 'Selecciona tus asientos' : 'Selecciona tus entradas'}
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            {event.venue?.hasAssignedSeating ? (
              <SeatMap 
                seats={seats} 
                selectedSeats={selectedSeatIds} 
                onSeatClick={handleSeatClick} 
              />
            ) : (
              <Box>
                {ticketTypes.map((type) => (
                  <Box key={type.id} sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">{type.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${type.price.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton onClick={() => handleTicketCountChange(type.id, -1)}>
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ mx: 2, minWidth: 20, textAlign: 'center' }}>
                        {selectedTicketCounts[type.id] || 0}
                      </Typography>
                      <IconButton onClick={() => handleTicketCountChange(type.id, 1)}>
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>Resumen de Selección</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{event.title}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {event.date} • {event.time}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {event.venue?.name}
            </Typography>

            {event.venue?.hasAssignedSeating ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Asientos: {selectedSeatIds.length > 0 ? selectedSeatIds.join(', ') : 'Ninguno'}</Typography>
              </Box>
            ) : (
              <Box sx={{ mb: 2 }}>
                {Object.entries(selectedTicketCounts).map(([id, count]) => {
                  if (count === 0) return null;
                  const type = ticketTypes.find(t => t.id === id);
                  return (
                    <Typography key={id} variant="body2">
                      {count} x {type?.name}
                    </Typography>
                  );
                })}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total Estimado</Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                ${(event.venue?.hasAssignedSeating 
                  ? selectedSeatIds.reduce((acc, id) => acc + (seats.find(s => s.id === id)?.price || 0), 0)
                  : Object.entries(selectedTicketCounts).reduce((acc, [id, count]) => acc + (ticketTypes.find(t => t.id === id)?.price || 0) * count, 0)
                ).toLocaleString()}
              </Typography>
            </Box>

            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              onClick={handleAddToCart}
              startIcon={<ShoppingCartIcon />}
            >
              Continuar al Pago
            </Button>

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
              <TimerIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
              <Typography variant="caption">Tu reserva durará 10 minutos</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>

      {isExpired && (
        <Snackbar open={true}>
          <Alert severity="warning">Tu tiempo de reserva ha expirado. Por favor selecciona tus entradas nuevamente.</Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default PurchasePage;

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
  Snackbar,
} from '@mui/material';
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TimerIcon from '@mui/icons-material/Timer';
import { api } from '../services/api';
import { Event } from '../features/types';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import SeatMap from '../features/tickets/components/SeatMap';
import { generateReferenceSeats, ReferenceSeat } from '../features/tickets/utils/generateReferenceSeats';

interface Tier {
  id: string;
  name: string;
  price: number;
}

function buildTiers(event: Event): Tier[] {
  const min = event.metadata.minPrice ?? 0;
  const max = event.metadata.maxPrice ?? min;
  if (max > min) {
    return [
      { id: 'general', name: 'Entrada General', price: min },
      { id: 'preferencial', name: 'Entrada Preferencial', price: max },
    ];
  }
  return [{ id: 'general', name: 'Entrada General', price: min }];
}

const PurchasePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { addItem, isExpired } = useCart();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep] = useState(0);
  const [selectedTicketCounts, setSelectedTicketCounts] = useState<Record<string, number>>({});
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const eventData = await api.events.getById(id);
        setEvent(eventData ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (!authLoading && !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  const tiers = event ? buildTiers(event) : [];
  const referenceSeats = event ? generateReferenceSeats(event.metadata.minPrice ?? 0, event.metadata.maxPrice ?? event.metadata.minPrice ?? 0) : [];

  const handleTicketCountChange = (tierId: string, delta: number) => {
    setSelectedTicketCounts((prev) => {
      const current = prev[tierId] || 0;
      const newValue = Math.max(0, Math.min(10, current + delta));
      return { ...prev, [tierId]: newValue };
    });
  };

  const handleSeatClick = (seat: ReferenceSeat) => {
    setSelectedSeatIds((prev) => {
      if (prev.includes(seat.id)) {
        return prev.filter((s) => s !== seat.id);
      }
      if (prev.length >= 10) {
        setError('Puedes seleccionar un máximo de 10 asientos.');
        return prev;
      }
      return [...prev, seat.id];
    });
  };

  const handleAddToCart = () => {
    if (!event) return;

    if (event.type === 'assigned') {
      if (selectedSeatIds.length === 0) {
        setError('Por favor selecciona al menos un asiento.');
        return;
      }
      selectedSeatIds.forEach((seatId) => {
        const seat = referenceSeats.find((s) => s.id === seatId);
        if (seat) {
          addItem({
            id: crypto.randomUUID(),
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            venueName: event.metadata.venueName || event.city,
            label: `Asiento ${seat.row}-${seat.number}`,
            seatNumbers: [seat.id],
            price: seat.price,
            quantity: 1,
          });
        }
      });
    } else {
      const selected = Object.entries(selectedTicketCounts).filter(([, count]) => count > 0);
      if (selected.length === 0) {
        setError('Por favor selecciona al menos una entrada.');
        return;
      }
      selected.forEach(([tierId, count]) => {
        const tier = tiers.find((t) => t.id === tierId);
        if (tier) {
          const seatNumbers = Array.from({ length: count }, (_, i) => `GA-${tier.id}-${Date.now()}-${i}`);
          addItem({
            id: crypto.randomUUID(),
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            venueName: event.metadata.venueName || event.city,
            label: tier.name,
            seatNumbers,
            price: tier.price,
            quantity: count,
          });
        }
      });
    }
    navigate('/checkout');
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 20 }}><CircularProgress /></Box>;
  if (!event) return null;

  const selectedTotal =
    event.type === 'assigned'
      ? selectedSeatIds.reduce((acc, sid) => acc + (referenceSeats.find((s) => s.id === sid)?.price || 0), 0)
      : Object.entries(selectedTicketCounts).reduce((acc, [tid, count]) => acc + (tiers.find((t) => t.id === tid)?.price || 0) * count, 0);

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
            {event.type === 'assigned' ? 'Selecciona tus asientos' : 'Selecciona tus entradas'}
          </Typography>

          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            {event.type === 'assigned' ? (
              <SeatMap seats={referenceSeats} selectedSeats={selectedSeatIds} onSeatClick={handleSeatClick} />
            ) : (
              <Box>
                {tiers.map((tier) => (
                  <Box key={tier.id} sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">{tier.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${tier.price.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton onClick={() => handleTicketCountChange(tier.id, -1)}>
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ mx: 2, minWidth: 20, textAlign: 'center' }}>
                        {selectedTicketCounts[tier.id] || 0}
                      </Typography>
                      <IconButton onClick={() => handleTicketCountChange(tier.id, 1)}>
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
              {new Date(event.date).toLocaleString('es-CL')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {event.metadata.venueName || event.city}
            </Typography>

            {event.type === 'assigned' ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Asientos: {selectedSeatIds.length > 0 ? selectedSeatIds.join(', ') : 'Ninguno'}</Typography>
              </Box>
            ) : (
              <Box sx={{ mb: 2 }}>
                {Object.entries(selectedTicketCounts).map(([tid, count]) => {
                  if (count === 0) return null;
                  const tier = tiers.find((t) => t.id === tid);
                  return (
                    <Typography key={tid} variant="body2">
                      {count} x {tier?.name}
                    </Typography>
                  );
                })}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total Estimado</Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                ${selectedTotal.toLocaleString()}
              </Typography>
            </Box>

            <Button fullWidth variant="contained" size="large" onClick={handleAddToCart} startIcon={<ShoppingCartIcon />}>
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

import React, { useEffect, useState } from 'react';
import { Typography, Box, Button, Paper, Divider, Container, Stack, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { api, ApiError } from '../services/api';
import { Order } from '../features/types';
import { updateLocalOrderStatus } from '../services/localOrders';
import { useNotifications } from '../hooks/useNotifications';

const ConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    api.orders
      .pollUntilSettled(id)
      .then((settled) => {
        if (cancelled) return;
        setOrder(settled);
        updateLocalOrderStatus(settled.id, settled.status);
        if (settled.status === 'COMPLETED') {
          addNotification('¡Compra confirmada!', `Tu orden #${settled.id.slice(0, 8)} fue procesada exitosamente.`, 'success');
        } else if (settled.status === 'CANCELLED') {
          addNotification('Compra rechazada', `Tu orden #${settled.id.slice(0, 8)} fue cancelada por el sistema de pagos.`, 'error');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'No se pudo consultar el estado de la orden.');
      });

    return () => {
      cancelled = true;
    };
  }, [id, addNotification]);

  if (error) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center', borderRadius: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          <Button variant="contained" onClick={() => navigate('/my-tickets')}>Ir a Mis Tickets</Button>
        </Paper>
      </Container>
    );
  }

  if (!order || order.status === 'PENDING') {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center', borderRadius: 4 }}>
          <CircularProgress sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Procesando tu pago...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Estamos verificando tu orden #{id?.slice(0, 8)}. Esto solo tomará unos segundos.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (order.status === 'CANCELLED') {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center', borderRadius: 4 }}>
          <CancelOutlinedIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Tu compra fue rechazada
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            La orden <strong>#{order.id.slice(0, 8)}</strong> fue cancelada por el sistema de detección de fraude o pagos.
          </Typography>
          <Button variant="contained" component={RouterLink} to={`/purchase/${order.eventId}`}>
            Intentar de nuevo
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center', borderRadius: 4 }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>¡Compra Exitosa!</Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Tu orden <strong>#{order.id.slice(0, 8)}</strong> fue procesada correctamente.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ bgcolor: 'grey.100', p: 3, borderRadius: 2, mb: 4 }}>
          <QrCode2Icon sx={{ fontSize: 150, color: 'text.primary' }} />
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
            Muestra este código al ingresar al recinto
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Button variant="outlined" component={RouterLink} to="/my-tickets" fullWidth>
            Mis Tickets
          </Button>
        </Stack>

        <Button variant="text" onClick={() => navigate('/')} sx={{ mt: 4 }}>
          Volver al Inicio
        </Button>
      </Paper>
    </Container>
  );
};

export default ConfirmationPage;

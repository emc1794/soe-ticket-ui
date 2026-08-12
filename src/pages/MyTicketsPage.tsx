import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  Divider,
  Container,
  Grid,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { LocalOrder } from '../features/types';
import { listLocalOrders, updateLocalOrderStatus } from '../services/localOrders';
import { api } from '../services/api';

const statusLabel: Record<LocalOrder['status'], string> = {
  PENDING: 'Procesando',
  COMPLETED: 'Válido',
  CANCELLED: 'Cancelado',
};

const statusColor: Record<LocalOrder['status'], 'success' | 'warning' | 'default'> = {
  PENDING: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

const MyTicketsPage: React.FC = () => {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [refreshing, setRefreshing] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<LocalOrder | null>(null);

  useEffect(() => {
    const local = listLocalOrders();
    setOrders(local);

    const pending = local.filter((o) => o.status === 'PENDING');
    if (pending.length === 0) {
      setRefreshing(false);
      return;
    }

    Promise.all(
      pending.map((o) =>
        api.orders
          .getById(o.id)
          .then((fresh) => {
            if (fresh.status !== o.status) updateLocalOrderStatus(o.id, fresh.status);
            return { ...o, status: fresh.status };
          })
          .catch(() => o)
      )
    ).then((refreshed) => {
      setOrders(listLocalOrders().map((o) => refreshed.find((r) => r.id === o.id) ?? o));
      setRefreshing(false);
    });
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>Mis Tickets</Typography>
        {refreshing && <CircularProgress size={20} />}
      </Box>

      {orders.length === 0 ? (
        <Paper sx={{ p: 10, textAlign: 'center' }}>
          <Typography color="text.secondary">Aún no tienes tickets comprados.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">ORDEN #{order.id.slice(0, 8)}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{order.eventTitle}</Typography>
                    <Typography variant="body2">
                      {new Date(order.eventDate).toLocaleString('es-CL')} • {order.venueName}
                    </Typography>
                  </Box>
                  <Chip label={statusLabel[order.status]} color={statusColor[order.status]} />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <QrCode2Icon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="body2">
                        {order.lines.reduce((acc, l) => acc + l.quantity, 0)} Entradas
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.lines.map((l) => (l.quantity > 1 ? `${l.quantity}x ${l.label}` : l.label)).join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                  <Button size="small" onClick={() => setSelectedOrder(order)}>Ver Detalle</Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Detalle de la orden</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <>
              <Typography variant="body2" gutterBottom><strong>ID:</strong> {selectedOrder.id}</Typography>
              <Typography variant="body2" gutterBottom><strong>Estado:</strong> {statusLabel[selectedOrder.status]}</Typography>
              <Typography variant="body2" gutterBottom><strong>Monto total:</strong> ${selectedOrder.amount.toLocaleString()}</Typography>
              <Typography variant="body2" gutterBottom><strong>Asientos/entradas:</strong> {selectedOrder.seatNumbers.join(', ')}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                Los reembolsos y cancelaciones no están disponibles aún — el servicio de pagos no expone esa operación.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOrder(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyTicketsPage;

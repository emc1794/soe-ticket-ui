import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Divider, 
  Container,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Order } from '../features/types';

const MyTicketsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('ticketwave_orders') || '[]');
    setOrders(savedOrders);
  }, []);

  const handleRefundRequest = () => {
    if (!selectedOrder) return;
    
    const updatedOrders = orders.map(o => 
      o.id === selectedOrder.id ? { ...o, status: 'refunded' as const } : o
    );
    
    setOrders(updatedOrders);
    localStorage.setItem('ticketwave_orders', JSON.stringify(updatedOrders));
    setRefundDialogOpen(false);
    setRefundReason('');
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>Mis Tickets</Typography>
      
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
                    <Typography variant="caption" color="text.secondary">ORDEN #{order.id}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{order.items[0]?.eventTitle}</Typography>
                    <Typography variant="body2">{order.items[0]?.eventDate} • {order.items[0]?.venueName}</Typography>
                  </Box>
                  <Chip 
                    label={order.status === 'completed' ? 'Válido' : order.status === 'refunded' ? 'Reembolsado' : order.status} 
                    color={order.status === 'completed' ? 'success' : 'default'}
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <QrCode2Icon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="body2">{order.items.length} Entradas</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.items.map(i => i.seatLabel || i.ticketTypeName).join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    {order.status === 'completed' && (
                      <Button 
                        size="small" 
                        color="error" 
                        onClick={() => {
                          setSelectedOrder(order);
                          setRefundDialogOpen(true);
                        }}
                      >
                        Solicitar Reembolso
                      </Button>
                    )}
                    <Button size="small">Ver Detalle</Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={refundDialogOpen} onClose={() => setRefundDialogOpen(false)}>
        <DialogTitle>Solicitar Reembolso</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            ¿Estás seguro de que deseas solicitar el reembolso de tu orden #{selectedOrder?.id}?
            Esta acción no se puede deshacer.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Motivo del reembolso"
            variant="outlined"
            sx={{ mt: 2 }}
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleRefundRequest} color="error" variant="contained">Confirmar Reembolso</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyTicketsPage;

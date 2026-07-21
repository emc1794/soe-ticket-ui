import React, { useState } from 'react';
import { 
  Typography, 
  Grid, 
  Box, 
  Button, 
  Paper, 
  Divider, 
  TextField, 
  Container,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useCart } from '../hooks/useCart';
import { api } from '../services/api';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // Empezamos en el paso de pago

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    paymentMethod: 'credit_card'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const order = await api.orders.create({
        items: cart.items,
        total: cart.total,
        billingInfo: {
          name: formData.name,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        paymentMethod: formData.paymentMethod
      });
      
      // Guardar orden en localStorage para "Mis Tickets" mock
      const existingOrders = JSON.parse(localStorage.getItem('ticketwave_orders') || '[]');
      localStorage.setItem('ticketwave_orders', JSON.stringify([...existingOrders, order]));
      
      clearCart();
      navigate(`/confirmation/${order.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0 && !loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Tu carrito está vacío</Typography>
        <Button variant="contained" onClick={() => navigate('/events')}>Ir a eventos</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
        <Step><StepLabel>Seleccionar Entradas</StepLabel></Step>
        <Step><StepLabel>Información de Pago</StepLabel></Step>
        <Step><StepLabel>Confirmación</StepLabel></Step>
      </Stepper>

      <form onSubmit={handlePayment}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper variant="outlined" sx={{ p: 4, mb: 3, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Datos del Comprador</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth required label="Nombre" name="name" 
                    value={formData.name} onChange={handleInputChange} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth required label="Apellido" name="lastName" 
                    value={formData.lastName} onChange={handleInputChange} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth required label="Email" type="email" name="email" 
                    value={formData.email} onChange={handleInputChange} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth required label="Teléfono" name="phone" 
                    value={formData.phone} onChange={handleInputChange} 
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Método de Pago</Typography>
              <RadioGroup 
                name="paymentMethod" 
                value={formData.paymentMethod} 
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <Paper variant="outlined" sx={{ p: 2, mb: 2, cursor: 'pointer' }}>
                  <FormControlLabel 
                    value="credit_card" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PaymentIcon sx={{ mr: 1 }} />
                        <Typography>Tarjeta de Crédito / Débito</Typography>
                      </Box>
                    } 
                  />
                  {formData.paymentMethod === 'credit_card' && (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Número de Tarjeta" placeholder="0000 0000 0000 0000" />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField fullWidth label="Vencimiento" placeholder="MM/YY" />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField fullWidth label="CVV" placeholder="123" />
                      </Grid>
                    </Grid>
                  )}
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, cursor: 'pointer' }}>
                  <FormControlLabel 
                    value="digital_wallet" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountBalanceWalletIcon sx={{ mr: 1 }} />
                        <Typography>Billetera Digital (Apple Pay / Google Pay)</Typography>
                      </Box>
                    } 
                  />
                </Paper>
              </RadioGroup>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>Tu Pedido</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
                {cart.items.map((item) => (
                  <Box key={item.id} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{item.eventTitle}</Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {item.seatLabel ? `Asiento: ${item.seatLabel}` : `${item.quantity}x ${item.ticketTypeName}`}
                    </Typography>
                    <Typography variant="body2" align="right">
                      ${(item.price * item.quantity).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">${cart.total.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Cargos por servicio</Typography>
                <Typography variant="body2">${(cart.total * 0.1).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  ${(cart.total * 1.1).toLocaleString()}
                </Typography>
              </Box>

              <Button 
                fullWidth 
                variant="contained" 
                size="large" 
                type="submit"
                disabled={loading}
                sx={{ height: 60, borderRadius: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Finalizar Compra'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default CheckoutPage;

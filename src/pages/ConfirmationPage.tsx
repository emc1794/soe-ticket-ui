import React from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Divider, 
  Container,
  Stack
} from '@mui/material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';

const ConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center', borderRadius: 4 }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>¡Compra Exitosa!</Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Tu pedido <strong>#{id}</strong> ha sido procesado correctamente. Hemos enviado un correo de confirmación con los detalles.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ bgcolor: 'grey.100', p: 3, borderRadius: 2, mb: 4 }}>
          <QrCode2Icon sx={{ fontSize: 150, color: 'text.primary' }} />
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
            Muestra este código al ingresar al recinto
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Button variant="contained" startIcon={<DownloadIcon />} fullWidth>
            Descargar Tickets PDF
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<ShareIcon />} fullWidth>
              Compartir
            </Button>
            <Button variant="outlined" component={RouterLink} to="/my-tickets" fullWidth>
              Mis Tickets
            </Button>
          </Box>
        </Stack>

        <Button 
          variant="text" 
          onClick={() => navigate('/')} 
          sx={{ mt: 4 }}
        >
          Volver al Inicio
        </Button>
      </Paper>
    </Container>
  );
};

export default ConfirmationPage;

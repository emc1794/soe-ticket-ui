import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tooltip, 
  useTheme,
  Grid
} from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AccessibleIcon from '@mui/icons-material/Accessible';
import { Seat } from '../../../features/types';

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: string[];
  onSeatClick: (seat: Seat) => void;
}

const SeatMap: React.FC<SeatMapProps> = ({ seats, selectedSeats, onSeatClick }) => {
  const theme = useTheme();

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.includes(seat.id)) return theme.palette.success.main;
    switch (seat.status) {
      case 'sold': return theme.palette.grey[400];
      case 'reserved': return theme.palette.warning.light;
      case 'accessible': return theme.palette.info.light;
      case 'available': return theme.palette.primary.light;
      default: return theme.palette.primary.light;
    }
  };

  // Agrupar asientos por fila
  const rows = seats.reduce((acc: Record<string, Seat[]>, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  return (
    <Box sx={{ overflowX: 'auto', py: 4 }}>
      <Paper variant="outlined" sx={{ p: 4, minWidth: 600, bgcolor: 'grey.50' }}>
        {/* Escenario */}
        <Box sx={{ 
          width: '60%', 
          height: 20, 
          bgcolor: 'grey.800', 
          mx: 'auto', 
          mb: 8, 
          borderRadius: '0 0 50% 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <Typography variant="caption">ESCENARIO</Typography>
        </Box>

        {Object.entries(rows).map(([rowLabel, rowSeats]) => (
          <Box key={rowLabel} sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ width: 20, mr: 2, fontWeight: 'bold' }}>{rowLabel}</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {rowSeats.map((seat) => (
                <Tooltip 
                  key={seat.id} 
                  title={`${seat.section} - Fila ${seat.row}, Asiento ${seat.number} ($${seat.price}) - ${seat.status}`}
                >
                  <Box
                    onClick={() => seat.status !== 'sold' && seat.status !== 'reserved' && onSeatClick(seat)}
                    sx={{
                      cursor: seat.status === 'available' || seat.status === 'accessible' || selectedSeats.includes(seat.id) ? 'pointer' : 'not-allowed',
                      color: getSeatColor(seat),
                      transition: 'transform 0.1s',
                      '&:hover': {
                        transform: seat.status === 'available' ? 'scale(1.2)' : 'none'
                      }
                    }}
                  >
                    {seat.isAccessible ? (
                      <AccessibleIcon sx={{ fontSize: 24 }} />
                    ) : (
                      <EventSeatIcon sx={{ fontSize: 24 }} />
                    )}
                  </Box>
                </Tooltip>
              ))}
            </Box>
            <Typography variant="body2" sx={{ width: 20, ml: 2, fontWeight: 'bold' }}>{rowLabel}</Typography>
          </Box>
        ))}

        {/* Leyenda */}
        <Grid container spacing={2} sx={{ mt: 6, justifyContent: 'center' }}>
          {[
            { label: 'Disponible', color: theme.palette.primary.light },
            { label: 'Seleccionado', color: theme.palette.success.main },
            { label: 'Ocupado', color: theme.palette.grey[400] },
            { label: 'Reservado', color: theme.palette.warning.light },
            { label: 'Accesible', color: theme.palette.info.light, icon: <AccessibleIcon sx={{ fontSize: 16, mr: 0.5 }} /> }
          ].map((item) => (
            <Grid item key={item.label} sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
              {item.icon || <Box sx={{ width: 16, height: 16, bgcolor: item.color, borderRadius: '50%', mr: 0.5 }} />}
              <Typography variant="caption" sx={{ color: item.color === theme.palette.info.light ? item.color : 'inherit' }}>{item.label}</Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default SeatMap;

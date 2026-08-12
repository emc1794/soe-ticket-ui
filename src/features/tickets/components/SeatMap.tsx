import React from 'react';
import { Box, Typography, Paper, Tooltip, useTheme, Grid } from '@mui/material';
import AccessibleIcon from '@mui/icons-material/Accessible';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import { ReferenceSeat } from '../utils/generateReferenceSeats';

interface SeatMapProps {
  seats: ReferenceSeat[];
  selectedSeats: string[];
  onSeatClick: (seat: ReferenceSeat) => void;
}

const SeatMap: React.FC<SeatMapProps> = ({ seats, selectedSeats, onSeatClick }) => {
  const theme = useTheme();

  const getSeatColor = (seat: ReferenceSeat) => {
    if (selectedSeats.includes(seat.id)) return theme.palette.success.main;
    if (seat.tier === 'VIP') return theme.palette.warning.main;
    return theme.palette.primary.light;
  };

  const rows = seats.reduce((acc: Record<string, ReferenceSeat[]>, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  return (
    <Box sx={{ overflowX: 'auto', py: 4 }}>
      <Paper variant="outlined" sx={{ p: 4, minWidth: 600, bgcolor: 'grey.50' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
          Mapa de referencia — la disponibilidad real se confirma al finalizar la compra
        </Typography>

        <Box
          sx={{
            width: '60%',
            height: 20,
            bgcolor: 'grey.800',
            mx: 'auto',
            mb: 8,
            borderRadius: '0 0 50% 50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <Typography variant="caption">ESCENARIO</Typography>
        </Box>

        {Object.entries(rows).map(([rowLabel, rowSeats]) => (
          <Box key={rowLabel} sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ width: 20, mr: 2, fontWeight: 'bold' }}>
              {rowLabel}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {rowSeats.map((seat) => (
                <Tooltip
                  key={seat.id}
                  title={`${seat.tier} - Fila ${seat.row}, Asiento ${seat.number} ($${seat.price.toLocaleString()})`}
                >
                  <Box
                    onClick={() => onSeatClick(seat)}
                    sx={{
                      cursor: 'pointer',
                      color: getSeatColor(seat),
                      transition: 'transform 0.1s',
                      '&:hover': { transform: 'scale(1.2)' },
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
            <Typography variant="body2" sx={{ width: 20, ml: 2, fontWeight: 'bold' }}>
              {rowLabel}
            </Typography>
          </Box>
        ))}

        <Grid container spacing={2} sx={{ mt: 6, justifyContent: 'center' }}>
          {[
            { label: 'General', color: theme.palette.primary.light },
            { label: 'VIP', color: theme.palette.warning.main },
            { label: 'Seleccionado', color: theme.palette.success.main },
            { label: 'Accesible', color: theme.palette.text.secondary, icon: <AccessibleIcon sx={{ fontSize: 16, mr: 0.5 }} /> },
          ].map((item) => (
            <Grid item key={item.label} sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
              {item.icon || (
                <Box sx={{ width: 16, height: 16, bgcolor: item.color, borderRadius: '50%', mr: 0.5 }} />
              )}
              <Typography variant="caption">{item.label}</Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default SeatMap;

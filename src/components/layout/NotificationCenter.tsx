import React, { useState, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  Badge, 
  Menu, 
  MenuItem, 
  Typography, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { Notification } from '../features/types';

const NotificationCenter: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      userId: 'user-1',
      title: '¡Compra confirmada!',
      message: 'Tus entradas para Taylor Swift ya están disponibles.',
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      userId: 'user-1',
      title: 'Cambio de horario',
      message: 'El evento TechConf 2026 ha cambiado a las 10:00 AM.',
      type: 'warning',
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    // Marcar todas como leídas al cerrar
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      default: return <InfoIcon color="info" />;
    }
  };

  return (
    <Box>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 400, mt: 1.5, borderRadius: 2 }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Notificaciones</Typography>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <MenuItem sx={{ py: 4, justifyContent: 'center' }}>
              <Typography color="text.secondary">No tienes notificaciones</Typography>
            </MenuItem>
          ) : (
            notifications.map((n) => (
              <ListItem key={n.id} sx={{ 
                bgcolor: n.isRead ? 'transparent' : 'action.hover',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getIcon(n.type)}
                </ListItemIcon>
                <ListItemText 
                  primary={n.title} 
                  secondary={n.message}
                  primaryTypographyProps={{ variant: 'subtitle2', fontWeight: n.isRead ? 'normal' : 'bold' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))
          )}
        </List>
      </Menu>
    </Box>
  );
};

export default NotificationCenter;

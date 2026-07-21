# Implementación de TicketWave Events

Se ha completado la implementación de la experiencia completa del usuario para la plataforma TicketWave. A continuación se detallan los módulos y archivos creados.

## Funcionalidades Implementadas

1.  **Búsqueda y Exploración**: Página `EventsPage` con filtros por ciudad, categoría, búsqueda por texto y ordenamiento por fecha/precio.
2.  **Detalle del Evento**: `EventDetailPage` con banner, información de recinto, descripción y pestañas de información adicional.
3.  **Selección de Asientos**: Soporte para General Admission (selector de cantidad) y Assigned Seating (mapa de asientos interactivo `SeatMap`).
4.  **Carrito / Reserva**: Hook `useCart` con persistencia en `localStorage`, cálculo de totales y temporizador de reserva de 10 minutos.
5.  **Checkout y Pago**: Flujo de checkout con formulario de comprador y selección de método de pago (crédito/débito y billetera digital).
6.  **Confirmación y Tickets**: Pantalla de éxito con QR y página "Mis Tickets" para visualizar compras realizadas.
7.  **Reembolsos**: Lógica en "Mis Tickets" para solicitar reembolsos con formulario de motivo.
8.  **Notificaciones**: Centro de notificaciones en el header con badge de no leídas y mensajes de estado.

## Estructura de Archivos Nuevos/Modificados

### Core & Types
- `src/features/types.ts`: Definición de interfaces de dominio.
- `src/services/mockData.ts`: Datos de prueba para eventos, recintos y tickets.
- `src/services/api.ts`: Abstracción de servicios con demoras simuladas (async).
- `src/hooks/useCart.tsx`: Contexto y hook para gestión del carrito.

### Componentes
- `src/components/common/EventCard.tsx`: Tarjeta reutilizable de eventos.
- `src/features/tickets/components/SeatMap.tsx`: Mapa de asientos interactivo con MUI Icons.
- `src/components/layout/NotificationCenter.tsx`: Menú desplegable de notificaciones.
- `src/components/layout/MainLayout.tsx`: Actualizado con navegación y centro de notificaciones.

### Páginas
- `src/pages/HomePage.tsx`: Actualizada con eventos destacados y buscador.
- `src/pages/EventsPage.tsx`: Lista de eventos con filtros.
- `src/pages/EventDetailPage.tsx`: Detalle completo del evento.
- `src/pages/PurchasePage.tsx`: Selección de entradas/asientos.
- `src/pages/CheckoutPage.tsx`: Formulario de pago.
- `src/pages/ConfirmationPage.tsx`: Confirmación de compra con QR.
- `src/pages/MyTicketsPage.tsx`: Listado de tickets y gestión de reembolsos.

## Notas de Integración
- El sistema utiliza `localStorage` para simular la persistencia de órdenes y el estado del carrito.
- Todas las llamadas a la "API" en `src/services/api.ts` están listas para ser reemplazadas por llamadas a un backend real mediante `fetch` o `axios`.
- Se han incluido validaciones UX (máximo 10 entradas, reserva temporal, deshabilitar asientos vendidos).

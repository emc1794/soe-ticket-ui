# TicketWave UI

Este proyecto es la interfaz de usuario para la plataforma TicketWave, desarrollada con React, TypeScript y Material UI.

## Tecnologías Principales

- **React 18**: Biblioteca para la interfaz de usuario.
- **TypeScript**: Tipado estático para mayor robustez.
- **Material UI (MUI) 6**: Componentes de diseño responsivos y modernos.
- **Vite**: Herramienta de construcción rápida.
- **React Router**: Gestión de navegación.

## Estructura de Carpetas

La estructura sigue una organización modular basada en funcionalidades (`features`):

- `src/components`: Componentes globales y de diseño.
  - `common`: Botones, inputs, modales genéricos.
  - `layout`: MainLayout, Header, Footer.
- `src/features`: Lógica de negocio dividida por dominios.
  - `events`: Búsqueda, filtrado y detalle de eventos.
  - `tickets`: Selección de asientos y visualización de tickets.
  - `payment`: Procesamiento de pagos.
- `src/theme`: Configuración del tema global de Material UI.
- `src/hooks`: Hooks personalizados reutilizables.
- `src/services`: Llamadas a APIs y servicios externos.
- `src/store`: Estado global (Redux/Context API).
- `src/utils`: Funciones de utilidad y constantes.

## Requisitos de Node

Se recomienda Node.js 20 o superior (compatible con la especificación "node26" mencionada en los requerimientos).

## Instalación y Uso

```bash
npm install
npm run dev
```

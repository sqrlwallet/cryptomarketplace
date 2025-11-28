# Source Directory Documentation

## Overview
The `src` directory contains the core application code for the Ripework marketplace. It is structured to separate concerns between UI components, global state management, and utility functions.

## Key Files

### `App.tsx`
- **Role**: Main application component.
- **Functionality**:
    - Handles client-side routing using a custom state-based router (`currentView`).
    - Manages URL state for deep linking (e.g., `/product/...`, `/[username]`).
    - Renders the global layout including `Navbar` and `Footer`.
    - Integrates `AuthProvider` and `WalletProvider`.

### `main.tsx`
- **Role**: Application entry point.
- **Functionality**: Mounts the React application to the DOM.

### `index.css`
- **Role**: Global stylesheet.
- **Functionality**:
    - Imports Tailwind directives.
    - Defines global base styles (fonts, background patterns).
    - Defines custom utility classes (`.neo-card`, `.neo-button`, etc.) for the design system.

## Subdirectories
- **`components/`**: UI components and page views.
- **`contexts/`**: React Context providers.
- **`lib/`**: Utilities and Supabase client.
- **`types/`**: TypeScript definitions.

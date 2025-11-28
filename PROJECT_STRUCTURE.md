# Ripework Project Structure

This document outlines the file and directory structure of the Ripework project to assist developers and agents in navigating the codebase.

## Root Directory
- `branding.md`: Design guidelines and color palette.
- `agents.md`: Overview for AI agents and developers.
- `DEPLOYMENT.md`: Instructions for deploying the application.
- `GUIDE.md`: General guide (content to be verified).
- `README.md`: Project introduction and setup instructions.
- `tailwind.config.js`: Tailwind CSS configuration including custom colors and fonts.
- `vite.config.ts`: Vite build configuration.
- `package.json`: Dependencies and scripts.

## Source Directory (`src/`)
The core application code resides here.

### `src/components/`
Contains all React components.
- **Pages/Views**: `Marketplace.tsx`, `ProductPage.tsx`, `SellerDashboard.tsx`, `UserProfilePage.tsx`, etc.
- **UI Elements**: `Navbar.tsx`, `Auth.tsx`, etc.

### `src/contexts/`
React Context providers for global state.
- `AuthContext.tsx`: User authentication state.
- `WalletContext.tsx`: Cryptocurrency wallet connection state.

### `src/lib/`
Utility functions and static data.
- `currencies.ts`: Currency definitions and formatting.
- `supabase.ts`: Supabase client configuration (implied).

### `src/types/` (If applicable)
TypeScript type definitions shared across the app.

### `src/App.tsx`
The main application component handling routing and layout structure.

### `src/main.tsx`
The entry point of the React application.

### `src/index.css`
Global styles and Tailwind directive imports.

## Key Files
- `index.html`: The HTML entry point.
- `.env`: Environment variables (API keys, etc.).

# Lib Directory Documentation

## Overview
The `src/lib` directory contains utility functions, configuration files, and external service clients.

## Key Files

### `supabase.ts`
- **Role**: Supabase Client Configuration.
- **Functionality**:
    - Initializes the Supabase client using environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
    - Exports the `supabase` client instance for use throughout the application.
    - Defines TypeScript interfaces for database tables (`Product`, `Profile`, `Transaction`, `PurchaseAccess`).

### `currencies.ts`
- **Role**: Currency Data.
- **Functionality**:
    - Exports a list of supported cryptocurrencies (`SUPPORTED_CURRENCIES`).
    - Each currency object includes `symbol`, `name`, `network`, and `icon` (Lucide icon component).

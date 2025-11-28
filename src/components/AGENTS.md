# Components Documentation

## Overview
The `src/components` directory houses all React components used in the application. This includes reusable UI elements and full-page views.

## Design System
Components strictly adhere to the Neo-Brutalist design system defined in `tailwind.config.js` and `index.css`.
- **Shadows**: Hard, non-blurred shadows (`shadow-neo`, `shadow-neo-white`).
- **Borders**: Thick, high-contrast borders.
- **Colors**: Acid Green (`primary`), Hot Pink (`secondary`), and Stark White/Black.

## Key Components

### `Marketplace.tsx`
- **Purpose**: The main landing view displaying products.
- **Features**:
    - Fetches products from Supabase.
    - Filters products by type (Product/Service) and search query.
    - Displays products in a grid using `.neo-card` styling.
    - Handles navigation to product details.

### `ProductPage.tsx`
- **Purpose**: Detailed view for a single product.
- **Features**:
    - Displays full product information.
    - Facilitates the purchase flow.

### `Navbar.tsx`
- **Purpose**: Global navigation bar.
- **Features**:
    - Handles navigation between views.
    - Displays user authentication state and wallet connection status.

### `Auth.tsx`
- **Purpose**: User authentication interface.
- **Features**:
    - Handles Sign In and Sign Up forms.
    - Integrates with `AuthContext`.

### `SellerDashboard.tsx`
- **Purpose**: Management interface for sellers.
- **Features**:
    - Allows creating and editing listings.
    - Displays sales history.

### `UserProfilePage.tsx`
- **Purpose**: Public profile view for users/sellers.
- **Features**:
    - Displays user bio and active listings.
    - Accessible via `/[username]` route.

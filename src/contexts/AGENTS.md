# Contexts Documentation

## Overview
The `src/contexts` directory contains React Context providers that manage global state for the application.

## Contexts

### `AuthContext.tsx`
- **Purpose**: Manages user authentication state via Supabase Auth.
- **Exports**: `AuthProvider`, `useAuth`.
- **State**:
    - `user`: The current authenticated Supabase user.
    - `profile`: Extended user profile data (username, bio, seller status).
    - `loading`: Boolean indicating if auth state is resolving.
- **Methods**:
    - `signUp(email, password, username)`: Registers a new user and creates a profile.
    - `signIn(email, password)`: Authenticates an existing user.
    - `signOut()`: Ends the current session.
    - `refreshProfile()`: Re-fetches the user profile data.

### `WalletContext.tsx`
- **Purpose**: Manages cryptocurrency wallet connection.
- **Exports**: `WalletProvider`, `useWallet`.
- **State**:
    - `address`: The connected wallet address.
    - `isConnected`: Boolean indicating connection status.
    - `balance`: Current wallet balance (if implemented).
- **Methods**:
    - `connect()`: Initiates wallet connection flow.
    - `disconnect()`: Disconnects the wallet.

## Usage Pattern
Wrap the application root (in `App.tsx`) with these providers to ensure state is accessible throughout the component tree.
```tsx
<AuthProvider>
  <WalletProvider>
    <AppContent />
  </WalletProvider>
</AuthProvider>
```

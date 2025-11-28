# Ripework Agent Guide

## Project Overview
**Ripework** is a crypto-native marketplace built with a Neo-Brutalist design aesthetic. It facilitates the buying and selling of digital goods using cryptocurrency. The platform features user authentication, wallet integration, a seller dashboard, and a public profile system.

## Tech Stack
- **Frontend Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Custom configuration for Neo-Brutalism)
- **State Management**: React Context API (`AuthContext`, `WalletContext`)
- **Backend/Database**: Supabase
- **Icons**: Lucide React

## Core Architecture

### Directory Structure
- `src/components`: Reusable UI components and page views.
- `src/contexts`: Global state providers (Auth, Wallet).
- `src/lib`: Utility functions and constants.
- `src/types`: TypeScript type definitions.

### Key Concepts

#### Authentication
- Managed by `AuthContext`.
- Supports user login, registration, and session persistence.

#### Wallet Integration
- Managed by `WalletContext`.
- Connects to user's crypto wallet for transactions.

#### Marketplace Logic
- **Products**: Listings created by sellers.
- **Transactions**: Records of purchases.
- **Seller Dashboard**: Interface for sellers to manage listings and view sales.

## Development Guidelines

### Styling
- **Design System**: Adhere strictly to the Neo-Brutalist aesthetic.
- **Utility Classes**: Use defined `neo-*` utility classes and Tailwind configuration.
- **Responsiveness**: Ensure layouts function correctly on both mobile and desktop devices.

### Code Quality
- **TypeScript**: Maintain strict typing. Avoid `any`.
- **Component Modularity**: Keep components focused and extract reusable logic.

### "Agents" Context
1. **Aesthetic**: The visual style is critical. Maintain the raw, high-contrast look.
2. **Context Usage**: Utilize `AuthContext` and `WalletContext` for state management before implementing new solutions.
3. **File Placement**: Locate new components in `src/components` and utilities in `src/lib`.

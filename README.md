# Ripework - Digital Marketplace

## 🎯 Project Overview
Ripework is a premium digital marketplace for buying and selling crypto assets with secure payments on the Base blockchain using USDC.

## ✨ Key Features

### 🔐 Authentication & User Management
- Email/password authentication via Supabase
- User profiles with customizable usernames and bios
- Wallet integration for crypto payments
- Public profile pages for sellers

### 💰 Payment System
- **Blockchain**: Base Mainnet (Chain ID: 8453)
- **Currency**: USDC only
- **Platform Fee**: 10% per transaction
- **Payment Flow**: 
  - 10% to platform wallet: `0x8D9CA82052e90eEd4eC2D8a8f5d489A518a8F9e4`
  - 90% directly to seller's wallet
- Automatic chain switching if user is on wrong network

### 🛍️ Marketplace Features
- Browse products and services
- Search and filter functionality
- Product categories (Products/Services)
- Tag-based organization
- Product images and descriptions
- Unique shareable links for each product

### 👤 Seller Dashboard
- Create and manage product listings
- Upload product images
- Attach digital files for delivery
- Set custom prices in USDC
- Track sales and inventory
- Generate unique product links

### 📦 Buyer Features
- Purchase digital products with crypto
- Access purchased items in "My Purchases"
- Download digital files after purchase
- Transaction history with blockchain links

### 📊 Transaction Management
- Complete transaction history
- Filter by purchases/sales
- View platform fees and seller amounts
- Direct links to Basescan for verification
- Real-time balance tracking

### 🎨 Design System
- **Style**: Neo-brutalism with terminal/retro aesthetic
- **Colors**: 
  - Background: Black (#000000)
  - Borders: White (#FFFFFF)
  - Primary Accent: Neon Lime (#00ff00)
  - Secondary Accent: Cyan (#00ffff)
- **Typography**: Monospace fonts for terminal feel
- **Effects**: Sharp borders, high contrast, glassmorphism accents

## 🔧 Technical Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: Client-side navigation
- **SEO**: React Helmet Async for dynamic meta tags

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for images and files
- **Blockchain**: Web3 integration for Base network

### Key Dependencies
- `@supabase/supabase-js` - Backend services
- `react-helmet-async` - SEO management
- `lucide-react` - Icon library
- `tailwindcss` - Styling framework

## 📁 Project Structure

```
cryptomarketplace/
├── public/
│   ├── logo.png          # Ripework logo
│   └── favicon.png       # Ripework favicon
├── src/
│   ├── components/
│   │   ├── Auth.tsx              # Login/Signup
│   │   ├── Marketplace.tsx       # Main marketplace
│   │   ├── ProductPage.tsx       # Product details
│   │   ├── SellerDashboard.tsx   # Seller management
│   │   ├── MyPurchases.tsx       # Buyer purchases
│   │   ├── Transactions.tsx      # Transaction history
│   │   ├── Profile.tsx           # User settings
│   │   ├── UserProfilePage.tsx   # Public profiles
│   │   ├── Navbar.tsx            # Navigation
│   │   ├── SEO.tsx               # SEO component
│   │   ├── PaymentModal.tsx      # Checkout flow
│   │   ├── CreateProductModal.tsx # Product creation
│   │   └── FileUpload.tsx        # File management
│   ├── contexts/
│   │   ├── AuthContext.tsx       # Auth state
│   │   └── WalletContext.tsx     # Wallet state
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client
│   │   └── currencies.ts         # Currency config
│   ├── App.tsx                   # Main app
│   └── main.tsx                  # Entry point
├── index.html
├── package.json
└── tailwind.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- MetaMask or compatible Web3 wallet

### Environment Variables
Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Type Check
```bash
npm run typecheck
```

## 🗄️ Database Schema

### Tables
- `profiles` - User profiles and settings
- `products` - Product listings
- `transactions` - Payment records
- `purchase_access` - Buyer access to products
- `product_files` - Digital file attachments

### Storage Buckets
- `product-images` - Product thumbnails
- `product-files` - Digital deliverables

## 🔒 Security Features
- Row Level Security (RLS) on all tables
- Secure file access based on purchase
- Wallet signature verification
- Transaction hash recording
- Platform fee enforcement

## 🎯 SEO Optimization
- Dynamic meta tags per page
- Open Graph tags for social sharing
- Twitter Card support
- Semantic HTML structure
- Unique page titles

## 📱 Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interfaces
- Adaptive layouts

## 🔗 Key URLs
- Marketplace: `/`
- Product: `/?product={unique_link}`
- User Profile: `/{username}`
- Seller Dashboard: `/seller-dashboard`
- My Purchases: `/my-purchases`
- Transactions: `/transactions`
- Profile Settings: `/profile`

## 💡 Future Enhancements
- Multi-currency support (ETH, other stablecoins)
- NFT integration
- Escrow system for services
- Review and rating system
- Advanced analytics dashboard
- Mobile app (React Native)
- API for third-party integrations

## 📄 License
All rights reserved.

## 🤝 Support
For support, please contact the Ripework team.

---

**Ripework** - Premium Digital Marketplace on Base Chain

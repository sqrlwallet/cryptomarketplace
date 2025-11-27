# Ripework Deployment Guide

## 🚀 Deployment Checklist

### 1. Environment Setup

#### Required Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase Configuration

#### Database Tables
Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  wallet_address TEXT,
  is_seller BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('product', 'service')),
  price DECIMAL(20, 6) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',
  seller_wallet TEXT NOT NULL,
  unique_link TEXT UNIQUE NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  has_files BOOLEAN DEFAULT false,
  file_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) NOT NULL,
  buyer_wallet TEXT NOT NULL,
  seller_wallet TEXT NOT NULL,
  amount DECIMAL(20, 6) NOT NULL,
  platform_fee DECIMAL(20, 6) NOT NULL,
  seller_amount DECIMAL(20, 6) NOT NULL,
  currency TEXT NOT NULL,
  transaction_hash TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Access table
CREATE TABLE purchase_access (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  buyer_wallet TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(transaction_id, product_id)
);

-- Product Files table
CREATE TABLE product_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for Products
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Sellers can insert own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = seller_id);

-- RLS Policies for Transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (
    buyer_wallet IN (SELECT wallet_address FROM profiles WHERE id = auth.uid())
    OR seller_wallet IN (SELECT wallet_address FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Anyone can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for Purchase Access
CREATE POLICY "Buyers can view own purchases"
  ON purchase_access FOR SELECT
  USING (buyer_wallet IN (SELECT wallet_address FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Anyone can insert purchase access"
  ON purchase_access FOR INSERT
  WITH CHECK (true);

-- RLS Policies for Product Files
CREATE POLICY "Sellers can view own product files"
  ON product_files FOR SELECT
  USING (
    product_id IN (SELECT id FROM products WHERE seller_id = auth.uid())
  );

CREATE POLICY "Buyers can view purchased product files"
  ON product_files FOR SELECT
  USING (
    product_id IN (
      SELECT product_id FROM purchase_access 
      WHERE buyer_wallet IN (SELECT wallet_address FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Sellers can insert product files"
  ON product_files FOR INSERT
  WITH CHECK (
    product_id IN (SELECT id FROM products WHERE seller_id = auth.uid())
  );
```

#### Storage Buckets

1. **Create `product-images` bucket**
   - Go to Storage in Supabase Dashboard
   - Create new bucket: `product-images`
   - Make it public
   - Set file size limit: 5MB
   - Allowed MIME types: `image/*`

2. **Create `product-files` bucket**
   - Create new bucket: `product-files`
   - Keep it private (RLS controlled)
   - Set file size limit: 100MB
   - Allowed MIME types: `*/*`

#### Storage Policies

```sql
-- product-images policies
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- product-files policies
CREATE POLICY "Sellers can upload product files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-files'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Buyers can download purchased files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'product-files'
    AND (
      -- Seller can access own files
      (storage.foldername(name))[1] = auth.uid()::text
      OR
      -- Buyer can access purchased files
      EXISTS (
        SELECT 1 FROM purchase_access pa
        JOIN profiles p ON p.wallet_address = pa.buyer_wallet
        WHERE p.id = auth.uid()
        AND (storage.foldername(name))[2] = pa.product_id::text
      )
    )
  );
```

### 3. Build for Production

```bash
# Install dependencies
npm install

# Run type check
npm run typecheck

# Build production bundle
npm run build
```

### 4. Deployment Options

#### Option A: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Add environment variables in Vercel dashboard

#### Option B: Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

3. Add environment variables in Netlify dashboard

#### Option C: Custom Server

1. Build the project:
```bash
npm run build
```

2. Serve the `dist` folder with any static file server:
```bash
npx serve dist
```

### 5. Post-Deployment

#### DNS Configuration
- Point your domain to deployment platform
- Enable HTTPS/SSL
- Configure custom domain

#### SEO Setup
- Submit sitemap to Google Search Console
- Add Google Analytics (optional)
- Set up social media preview images

#### Testing Checklist
- [ ] User registration works
- [ ] Wallet connection works on Base network
- [ ] Product creation works
- [ ] File uploads work
- [ ] Payment flow completes
- [ ] Transaction records correctly
- [ ] File downloads work for buyers
- [ ] SEO meta tags render correctly
- [ ] Mobile responsive design works
- [ ] All pages load correctly

### 6. Monitoring

#### Supabase Dashboard
- Monitor database usage
- Check storage usage
- Review API calls
- Monitor authentication

#### Error Tracking (Optional)
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for user tracking

### 7. Security Checklist

- [ ] Environment variables are secure
- [ ] RLS policies are properly configured
- [ ] Storage policies prevent unauthorized access
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is in place (Supabase handles this)
- [ ] Platform wallet address is correct
- [ ] Base chain ID is verified (8453)

### 8. Maintenance

#### Regular Tasks
- Monitor transaction success rates
- Check for failed payments
- Review user feedback
- Update dependencies monthly
- Backup database regularly (Supabase handles this)

#### Scaling Considerations
- Supabase auto-scales
- Consider CDN for images
- Monitor API rate limits
- Optimize database queries if needed

### 9. Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Base Network**: https://base.org
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: Wallet won't connect
- **Solution**: Ensure MetaMask is installed and Base network is added

**Issue**: Payment fails
- **Solution**: Check user has USDC on Base network and sufficient gas

**Issue**: Files won't upload
- **Solution**: Check Supabase storage bucket policies and size limits

**Issue**: SEO tags not showing
- **Solution**: Ensure React Helmet Async provider is wrapping app

**Issue**: Products not showing
- **Solution**: Check RLS policies and ensure products are marked as active

---

**Ripework** - Ready for Production 🚀

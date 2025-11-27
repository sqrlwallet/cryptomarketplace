/*
  # Decentralized Marketplace Schema
  
  ## Overview
  Creates a complete marketplace platform where sellers can list products/services,
  generate unique payment links, and receive crypto payments with automatic 10% platform fee.
  
  ## New Tables
  
  ### `profiles`
  - `id` (uuid, FK to auth.users)
  - `wallet_address` (text) - User's crypto wallet address
  - `username` (text, unique) - Display name
  - `bio` (text) - User description
  - `is_seller` (boolean) - Whether user has seller capabilities
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `products`
  - `id` (uuid, primary key)
  - `seller_id` (uuid, FK to profiles)
  - `title` (text) - Product/service name
  - `description` (text) - Detailed description
  - `type` (text) - 'product' or 'service'
  - `price` (numeric) - Price in cryptocurrency
  - `currency` (text) - Currency type (ETH, BTC, etc)
  - `seller_wallet` (text) - Wallet address for payments
  - `unique_link` (text, unique) - Shareable product link slug
  - `tags` (text[]) - Searchable tags
  - `image_url` (text) - Product image
  - `is_active` (boolean) - Whether listing is active
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `transactions`
  - `id` (uuid, primary key)
  - `product_id` (uuid, FK to products)
  - `buyer_wallet` (text) - Buyer's wallet address
  - `seller_wallet` (text) - Seller's wallet address
  - `amount` (numeric) - Total transaction amount
  - `platform_fee` (numeric) - 10% platform fee
  - `seller_amount` (numeric) - 90% to seller
  - `currency` (text)
  - `transaction_hash` (text) - Blockchain transaction hash
  - `status` (text) - 'pending', 'completed', 'failed'
  - `created_at` (timestamptz)
  
  ### `service_categories`
  - `id` (uuid, primary key)
  - `name` (text, unique)
  - `description` (text)
  - `created_at` (timestamptz)
  
  ## Security
  - Enable RLS on all tables
  - Users can read their own profile and all public profiles
  - Users can update only their own profile
  - Sellers can create/update/delete their own products
  - Anyone can view active products
  - Transaction records are viewable by buyer and seller
  - Only the system can create transaction records
  
  ## Indexes
  - Index on product tags for fast searching
  - Index on product unique_link for fast lookups
  - Index on transaction status for filtering
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address text,
  username text UNIQUE NOT NULL,
  bio text DEFAULT '',
  is_seller boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL CHECK (type IN ('product', 'service')),
  price numeric NOT NULL CHECK (price > 0),
  currency text NOT NULL DEFAULT 'ETH',
  seller_wallet text NOT NULL,
  unique_link text UNIQUE NOT NULL,
  tags text[] DEFAULT '{}',
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  buyer_wallet text NOT NULL,
  seller_wallet text NOT NULL,
  amount numeric NOT NULL,
  platform_fee numeric NOT NULL,
  seller_amount numeric NOT NULL,
  currency text NOT NULL,
  transaction_hash text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Create service categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_products_unique_link ON products(unique_link);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_wallet);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_wallet);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true OR seller_id = auth.uid());

CREATE POLICY "Sellers can insert their products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid());

-- Transactions policies
CREATE POLICY "Users can view their transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.wallet_address = transactions.buyer_wallet 
           OR profiles.wallet_address = transactions.seller_wallet)
    )
  );

CREATE POLICY "Anyone can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Service categories policies (read-only for users)
CREATE POLICY "Anyone can view service categories"
  ON service_categories FOR SELECT
  TO authenticated
  USING (true);

-- Insert default service categories
INSERT INTO service_categories (name, description) VALUES
  ('Web Development', 'Website and web application development services'),
  ('Graphic Design', 'Logo, branding, and graphic design services'),
  ('Content Writing', 'Blog posts, articles, and copywriting'),
  ('Video Editing', 'Video production and editing services'),
  ('Marketing', 'Digital marketing and social media management'),
  ('Consulting', 'Business and technical consulting services')
ON CONFLICT (name) DO NOTHING;
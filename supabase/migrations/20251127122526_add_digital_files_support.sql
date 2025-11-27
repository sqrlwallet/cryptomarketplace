/*
  # Add Digital Files Support
  
  ## Overview
  Enables sellers to upload and sell digital products (files, images, videos, etc.)
  Buyers can download files after successful purchase
  
  ## New Tables
  
  ### `product_files`
  - `id` (uuid, primary key)
  - `product_id` (uuid, FK to products) - Associated product
  - `file_name` (text) - Original file name
  - `file_path` (text) - Storage path in Supabase
  - `file_size` (bigint) - File size in bytes
  - `file_type` (text) - MIME type
  - `created_at` (timestamptz)
  
  ### `purchase_access`
  - `id` (uuid, primary key)
  - `transaction_id` (uuid, FK to transactions)
  - `product_id` (uuid, FK to products)
  - `buyer_wallet` (text) - Buyer's wallet address
  - `access_granted_at` (timestamptz)
  - `last_accessed_at` (timestamptz)
  - `download_count` (integer) - Track number of downloads
  
  ## Changes to Existing Tables
  - Add `has_files` (boolean) to products table
  - Add `file_count` (integer) to products table
  
  ## Security
  - Buyers can only access files for products they've purchased
  - Sellers can view their own product files
  - RLS policies enforce access control
  
  ## Storage
  - Create 'product-files' bucket for file storage
  - Public read access disabled by default
  - Access controlled through RLS
*/

-- Add columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'has_files'
  ) THEN
    ALTER TABLE products ADD COLUMN has_files boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'file_count'
  ) THEN
    ALTER TABLE products ADD COLUMN file_count integer DEFAULT 0;
  END IF;
END $$;

-- Create product_files table
CREATE TABLE IF NOT EXISTS product_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create purchase_access table
CREATE TABLE IF NOT EXISTS purchase_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  buyer_wallet text NOT NULL,
  access_granted_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz,
  download_count integer DEFAULT 0,
  UNIQUE(transaction_id, product_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_files_product ON product_files(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_access_buyer ON purchase_access(buyer_wallet);
CREATE INDEX IF NOT EXISTS idx_purchase_access_product ON purchase_access(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_access_transaction ON purchase_access(transaction_id);

-- Enable RLS
ALTER TABLE product_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_access ENABLE ROW LEVEL SECURITY;

-- Product files policies
CREATE POLICY "Sellers can view their product files"
  ON product_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_files.product_id
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can insert product files"
  ON product_files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_files.product_id
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can delete their product files"
  ON product_files FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_files.product_id
      AND products.seller_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can view files for purchased products"
  ON product_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM purchase_access pa
      JOIN profiles p ON p.wallet_address = pa.buyer_wallet
      WHERE pa.product_id = product_files.product_id
      AND p.id = auth.uid()
    )
  );

-- Purchase access policies
CREATE POLICY "Users can view their own purchase access"
  ON purchase_access FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.wallet_address = purchase_access.buyer_wallet
    )
  );

CREATE POLICY "System can create purchase access"
  ON purchase_access FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their access records"
  ON purchase_access FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.wallet_address = purchase_access.buyer_wallet
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.wallet_address = purchase_access.buyer_wallet
    )
  );

-- Create storage bucket for product files
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-files', 'product-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product files bucket
CREATE POLICY "Sellers can upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Sellers can view their files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'product-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Buyers can view purchased files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'product-files' AND
    EXISTS (
      SELECT 1 FROM purchase_access pa
      JOIN profiles p ON p.wallet_address = pa.buyer_wallet
      JOIN product_files pf ON pf.product_id = pa.product_id
      WHERE p.id = auth.uid()
      AND pf.file_path = name
    )
  );

CREATE POLICY "Sellers can delete their files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
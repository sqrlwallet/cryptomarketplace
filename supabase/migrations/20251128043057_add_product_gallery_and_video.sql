/*
  # Add Product Gallery and YouTube Video Support
  
  ## Overview
  Enable sellers to upload multiple product images and add YouTube video links
  
  ## New Tables
  1. `product_images`
    - `id` (uuid, primary key) - Unique identifier
    - `product_id` (uuid, foreign key) - Links to products table
    - `image_url` (text) - Public URL to the image
    - `display_order` (integer, default 0) - Order for displaying images
    - `created_at` (timestamptz) - When image was uploaded
  
  ## Modified Tables
  1. `products`
    - `youtube_url` (text, nullable) - Optional YouTube video link
  
  ## Security
  - Enable RLS on product_images table
  - Anyone can view product images
  - Only product owners can insert/update/delete their product images
  
  ## Use Cases
  - Multiple product showcase images
  - Different angles or variations
  - Tutorial or demo videos via YouTube
  - Enhanced product presentation
*/

-- Add youtube_url to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS youtube_url text;

COMMENT ON COLUMN products.youtube_url IS 'Optional YouTube video URL for product demonstration';

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  display_order integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON product_images(product_id, display_order);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view product images
CREATE POLICY "Anyone can view product images"
  ON product_images
  FOR SELECT
  TO public
  USING (true);

-- Only product owners can insert images for their products
CREATE POLICY "Product owners can insert their product images"
  ON product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Only product owners can update their product images
CREATE POLICY "Product owners can update their product images"
  ON product_images
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
      AND products.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Only product owners can delete their product images
CREATE POLICY "Product owners can delete their product images"
  ON product_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
      AND products.seller_id = auth.uid()
    )
  );

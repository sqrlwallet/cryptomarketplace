/*
  # Add Product Analytics and Views Tracking
  
  ## Overview
  Enable comprehensive analytics for sellers to track product performance
  
  ## New Tables
  1. `product_views`
    - `id` (uuid, primary key) - Unique identifier
    - `product_id` (uuid, foreign key) - Links to products table
    - `viewer_id` (uuid, nullable) - User who viewed (if authenticated)
    - `viewer_ip` (text, nullable) - IP address for anonymous tracking
    - `created_at` (timestamptz) - When view occurred
  
  ## New Views
  1. `product_analytics`
    - Aggregated view showing per-product metrics:
      - Total views
      - Total sales
      - Total revenue
      - Conversion rate
  
  ## Security
  - Enable RLS on product_views table
  - Anyone can insert views (for tracking)
  - Only sellers can view analytics for their products
  
  ## Use Cases
  - Track product popularity via views
  - Calculate conversion rates (views to sales)
  - Identify top-performing products
  - Monitor sales trends over time
  - Provide actionable insights to sellers
*/

-- Create product_views table
CREATE TABLE IF NOT EXISTS product_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  viewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  viewer_ip text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON product_views(created_at);
CREATE INDEX IF NOT EXISTS idx_product_views_viewer_id ON product_views(viewer_id);

-- Enable RLS
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (for tracking)
CREATE POLICY "Anyone can track product views"
  ON product_views
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Product owners can view their product analytics
CREATE POLICY "Sellers can view their product views"
  ON product_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_views.product_id
      AND products.seller_id = auth.uid()
    )
  );

-- Create materialized view for product analytics
CREATE OR REPLACE VIEW product_analytics AS
SELECT 
  p.id as product_id,
  p.seller_id,
  p.title,
  p.price,
  p.currency,
  p.created_at,
  COALESCE(v.view_count, 0) as total_views,
  COALESCE(s.sale_count, 0) as total_sales,
  COALESCE(s.total_revenue, 0) as total_revenue,
  CASE 
    WHEN COALESCE(v.view_count, 0) > 0 
    THEN ROUND((COALESCE(s.sale_count, 0)::numeric / v.view_count::numeric) * 100, 2)
    ELSE 0 
  END as conversion_rate,
  COALESCE(s.last_sale_at, NULL) as last_sale_at
FROM products p
LEFT JOIN (
  SELECT 
    product_id, 
    COUNT(*) as view_count
  FROM product_views
  GROUP BY product_id
) v ON p.id = v.product_id
LEFT JOIN (
  SELECT 
    product_id,
    COUNT(*) as sale_count,
    SUM(amount) as total_revenue,
    MAX(created_at) as last_sale_at
  FROM transactions
  WHERE status = 'completed'
  GROUP BY product_id
) s ON p.id = s.product_id;

COMMENT ON VIEW product_analytics IS 'Aggregated analytics showing views, sales, revenue, and conversion rates per product';

/*
  # Allow Public Product Viewing
  
  ## Changes
  - Update RLS policies to allow unauthenticated users to view active products
  - This enables marketplace browsing without requiring sign-in
  
  ## Security
  - Only active products are visible to public
  - All other operations still require authentication
*/

DROP POLICY IF EXISTS "Anyone can view active products" ON products;

CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Users can view their own products"
  ON products FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());
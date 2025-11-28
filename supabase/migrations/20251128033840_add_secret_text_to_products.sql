/*
  # Add Secret Text Field to Products
  
  ## Overview
  Add a field to store secret text that is revealed only to buyers after purchase
  
  ## Changes
  1. New Columns
    - `secret_text` (text, nullable) - Hidden content revealed after purchase
      - Can contain private information, codes, links, instructions
      - Only visible to buyers who have purchased the product
      - Sellers can optionally add this during product creation
  
  ## Use Cases
  - Private download links
  - Discount codes
  - Access credentials
  - Special instructions
  - Exclusive content
  
  ## Security
  - Field is nullable (optional for sellers)
  - Only buyers with valid purchase_access can view
  - Not exposed in public product listings
*/

-- Add secret_text column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS secret_text text;

-- Add comment explaining the field
COMMENT ON COLUMN products.secret_text IS 'Secret text revealed only to buyers after purchase. Can contain codes, links, or instructions.';

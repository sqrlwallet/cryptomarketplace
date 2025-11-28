/*
  # Fix Transactions RLS Policy for Inserts
  
  ## Overview
  Allow authenticated users to create transactions when they are the buyer
  
  ## Changes
  1. Security Updates
    - Update INSERT policy to verify the buyer is the authenticated user
    - Ensure buyer_wallet matches the user's profile wallet_address
    - Maintain security while allowing legitimate purchases
  
  ## Impact
  - Users can now successfully create transactions when purchasing
  - Prevents users from creating transactions for others
  - Maintains data integrity and security
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Anyone can create transactions" ON transactions;

-- Create a new insert policy that verifies the buyer is the authenticated user
CREATE POLICY "Users can create their own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.wallet_address = transactions.buyer_wallet
    )
  );

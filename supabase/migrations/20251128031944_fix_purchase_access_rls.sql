/*
  # Fix Purchase Access RLS Policy
  
  ## Overview
  Update INSERT policy for purchase_access to properly validate buyers
  
  ## Changes
  1. Security Updates
    - Replace overly permissive INSERT policy
    - Verify buyer_wallet matches authenticated user's profile
    - Ensure only legitimate purchases create access records
  
  ## Impact
  - Users can create access records when they are the buyer
  - Prevents unauthorized access record creation
  - Maintains data integrity and security
*/

-- Drop the existing permissive insert policy
DROP POLICY IF EXISTS "System can create purchase access" ON purchase_access;

-- Create a new insert policy that verifies the buyer is the authenticated user
CREATE POLICY "Users can create their own purchase access"
  ON purchase_access
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.wallet_address = purchase_access.buyer_wallet
    )
  );

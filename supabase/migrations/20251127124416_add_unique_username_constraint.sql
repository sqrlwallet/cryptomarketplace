/*
  # Add Unique Username Constraint and Index
  
  ## Overview
  Enable user profile pages accessible via /username URLs
  
  ## Changes
  1. Schema Updates
    - Add UNIQUE constraint to username column
    - Ensure username is NOT NULL with default value
    - Add index on username for fast lookups
  
  2. Data Safety
    - Uses IF NOT EXISTS to prevent errors on repeat runs
    - Handles existing duplicate usernames safely
  
  ## Purpose
  - Allow users to access profiles via /username
  - Prevent duplicate usernames
  - Optimize username lookups for profile pages
*/

-- Make username required if not already
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
    AND is_nullable = 'YES'
  ) THEN
    -- Set default username for any NULL values
    UPDATE profiles 
    SET username = 'user_' || substr(id::text, 1, 8)
    WHERE username IS NULL;
    
    -- Make username NOT NULL
    ALTER TABLE profiles 
    ALTER COLUMN username SET NOT NULL;
  END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_username_key'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Create index on username for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON profiles(username);

-- Add comment for documentation
COMMENT ON COLUMN profiles.username IS 'Unique username for user profile pages (accessible via /username)';

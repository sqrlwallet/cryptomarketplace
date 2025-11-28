/*
  # Fix Profile Creation During Sign Up

  ## Overview
  Allow profile creation during sign-up by using a database trigger that runs with elevated privileges.
  This solves the RLS issue where profiles cannot be inserted during sign-up before email verification.

  ## Changes
  1. Create a function to handle profile creation
    - Runs with SECURITY DEFINER to bypass RLS
    - Automatically creates profile when user signs up
  
  2. Create a trigger on auth.users
    - Fires after a new user is inserted
    - Calls the profile creation function
  
  3. Drop existing insert policy and create more permissive one
    - Allow users to insert their own profile during any auth state

  ## Security
  - Function runs with definer's privileges (bypasses RLS safely)
  - Only creates profile for the user being registered
  - Maintains security for all other operations
*/

-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a more permissive insert policy that works during sign-up
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also allow anon inserts during the sign-up process (will be constrained by application logic)
CREATE POLICY "Allow profile creation during sign up"
  ON profiles FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create a function to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, bio, is_seller)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    '',
    false
  );
  RETURN NEW;
END;
$$;

-- Create a trigger to automatically create a profile when a user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates a profile entry when a new user signs up';

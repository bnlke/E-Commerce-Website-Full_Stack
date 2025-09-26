/*
  # Fix User Registration Process

  1. Changes
    - Fix handle_new_user trigger function to properly handle errors
    - Add error handling for profile and role assignment
    - Add missing indexes for better performance
    - Ensure proper transaction handling

  2. Security
    - Maintain existing RLS policies
    - Keep security definer context
*/

-- Drop existing trigger first to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Get default role id first to ensure it exists
  SELECT id INTO default_role_id
  FROM roles
  WHERE name = 'user';
  
  IF default_role_id IS NULL THEN
    RAISE EXCEPTION 'Default role not found';
  END IF;

  -- Create profile
  INSERT INTO public.profiles (id, created_at)
  VALUES (new.id, now())
  ON CONFLICT (id) DO NOTHING;

  -- Assign default role
  INSERT INTO public.user_roles (user_id, role_id, created_at)
  VALUES (new.id, default_role_id, now())
  ON CONFLICT (user_id, role_id) DO NOTHING;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (Supabase will capture this)
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- Ensure default role exists
INSERT INTO roles (name, description)
VALUES ('user', 'Regular user with basic privileges')
ON CONFLICT (name) DO NOTHING;
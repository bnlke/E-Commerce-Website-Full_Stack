-- Function to remove admin role
CREATE OR REPLACE FUNCTION remove_admin_role(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  admin_role_id uuid;
BEGIN
  -- Get user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Get admin role ID
  SELECT id INTO admin_role_id
  FROM roles
  WHERE name = 'admin';

  IF admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Admin role not found';
  END IF;

  -- Remove admin role
  DELETE FROM user_roles
  WHERE user_id = target_user_id
  AND role_id = admin_role_id;

  -- Ensure user still has basic role
  INSERT INTO user_roles (user_id, role_id)
  SELECT target_user_id, id
  FROM roles
  WHERE name = 'user'
  ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$;
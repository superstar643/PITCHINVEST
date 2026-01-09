-- Enable admin access to users table
-- This allows authenticated users (including admins) to view all users

-- Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to select users" ON users;

-- Policy: Allow authenticated users to SELECT (read) all users
-- This allows admins and other authenticated users to view all users
-- Note: Admin status is determined by email in the frontend, but we allow
-- all authenticated users to read users for admin panel access
CREATE POLICY "Allow authenticated users to select users"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Also allow authenticated users to UPDATE users (for admin actions like approve/reject)
DROP POLICY IF EXISTS "Allow authenticated users to update users" ON users;

CREATE POLICY "Allow authenticated users to update users"
ON users
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

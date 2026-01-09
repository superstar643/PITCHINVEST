-- Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to select users" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to select profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to select commercial_proposals" ON commercial_proposals;
DROP POLICY IF EXISTS "Allow authenticated users to select pitch_materials" ON pitch_materials;

-- Policy: Allow authenticated users to SELECT (read) users table
-- This allows admins and other authenticated users to view user profiles
CREATE POLICY "Allow authenticated users to select users"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to SELECT (read) profiles table
CREATE POLICY "Allow authenticated users to select profiles"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- Enable RLS on commercial_proposals table (if not already enabled)
ALTER TABLE commercial_proposals ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to SELECT (read) commercial_proposals table
CREATE POLICY "Allow authenticated users to select commercial_proposals"
ON commercial_proposals
FOR SELECT
TO authenticated
USING (true);

-- Enable RLS on pitch_materials table (if not already enabled)
ALTER TABLE pitch_materials ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to SELECT (read) pitch_materials table
CREATE POLICY "Allow authenticated users to select pitch_materials"
ON pitch_materials
FOR SELECT
TO authenticated
USING (true);

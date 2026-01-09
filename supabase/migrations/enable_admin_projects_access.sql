-- Enable admin access to projects table
-- This allows authenticated users (including admins) to view all projects

-- Enable RLS on projects table (if not already enabled)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to select projects" ON projects;

-- Policy: Allow authenticated users to SELECT (read) all projects
-- This allows admins and other authenticated users to view all projects
-- Note: Admin status is determined by email in the frontend, but we allow
-- all authenticated users to read projects for admin panel access
CREATE POLICY "Allow authenticated users to select projects"
ON projects
FOR SELECT
TO authenticated
USING (true);

-- Also allow authenticated users to UPDATE projects (for admin actions like approve/reject)
DROP POLICY IF EXISTS "Allow authenticated users to update projects" ON projects;

CREATE POLICY "Allow authenticated users to update projects"
ON projects
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

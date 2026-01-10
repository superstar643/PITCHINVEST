-- Create RPC function to increment project views
-- This function increments the views count for a project atomically

CREATE OR REPLACE FUNCTION increment_project_views(project_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE projects
    SET views = COALESCE(views, 0) + 1,
        updated_at = NOW()
    WHERE id = project_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_project_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_project_views(UUID) TO anon;

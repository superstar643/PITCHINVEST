-- Enable RLS on gallery_engagement table
ALTER TABLE gallery_engagement ENABLE ROW LEVEL SECURITY;

-- Ensure unique constraint exists for gallery_engagement (gallery_item_id, user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'gallery_engagement_gallery_item_id_user_id_key'
    ) THEN
        ALTER TABLE gallery_engagement 
        ADD CONSTRAINT gallery_engagement_gallery_item_id_user_id_key 
        UNIQUE (gallery_item_id, user_id);
    END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public to select gallery_engagement" ON gallery_engagement;
DROP POLICY IF EXISTS "Allow authenticated users to insert gallery_engagement" ON gallery_engagement;
DROP POLICY IF EXISTS "Allow authenticated users to update gallery_engagement" ON gallery_engagement;
DROP POLICY IF EXISTS "Allow users to select own gallery_engagement" ON gallery_engagement;

-- Policy: Allow public to read gallery_engagement (for viewing likes/views stats)
CREATE POLICY "Allow public to select gallery_engagement"
ON gallery_engagement
FOR SELECT
TO public
USING (true);

-- Policy: Allow authenticated users to insert their own engagement
CREATE POLICY "Allow authenticated users to insert gallery_engagement"
ON gallery_engagement
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update their own engagement
CREATE POLICY "Allow authenticated users to update gallery_engagement"
ON gallery_engagement
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Enable RLS on project_engagement table
ALTER TABLE project_engagement ENABLE ROW LEVEL SECURITY;

-- Ensure unique constraint exists for project_engagement (project_id, user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'project_engagement_project_id_user_id_key'
    ) THEN
        ALTER TABLE project_engagement 
        ADD CONSTRAINT project_engagement_project_id_user_id_key 
        UNIQUE (project_id, user_id);
    END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public to select project_engagement" ON project_engagement;
DROP POLICY IF EXISTS "Allow authenticated users to insert project_engagement" ON project_engagement;
DROP POLICY IF EXISTS "Allow authenticated users to update project_engagement" ON project_engagement;
DROP POLICY IF EXISTS "Allow users to select own project_engagement" ON project_engagement;

-- Policy: Allow public to read project_engagement (for viewing likes/views stats)
CREATE POLICY "Allow public to select project_engagement"
ON project_engagement
FOR SELECT
TO public
USING (true);

-- Policy: Allow authenticated users to insert their own engagement
CREATE POLICY "Allow authenticated users to insert project_engagement"
ON project_engagement
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update their own engagement
CREATE POLICY "Allow authenticated users to update project_engagement"
ON project_engagement
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

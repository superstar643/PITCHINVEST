-- Sync projects table to gallery_items table
-- This migration creates a trigger to automatically sync data from projects to gallery_items
-- when a project is created or updated during registration

-- Enable RLS on gallery_items (if not already enabled)
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for gallery_items
DROP POLICY IF EXISTS "Allow public to select gallery_items" ON gallery_items;
CREATE POLICY "Allow public to select gallery_items"
ON gallery_items
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert gallery_items" ON gallery_items;
CREATE POLICY "Allow authenticated users to insert gallery_items"
ON gallery_items
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update gallery_items" ON gallery_items;
CREATE POLICY "Allow authenticated users to update gallery_items"
ON gallery_items
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete gallery_items" ON gallery_items;
CREATE POLICY "Allow authenticated users to delete gallery_items"
ON gallery_items
FOR DELETE
TO authenticated
USING (true);

-- Ensure gallery_items has a unique constraint on project_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'gallery_items_project_id_unique'
    ) THEN
        ALTER TABLE gallery_items ADD CONSTRAINT gallery_items_project_id_unique UNIQUE (project_id);
    END IF;
END $$;

-- Function to sync project to gallery_item
-- Maps projects table columns to gallery_items table columns
CREATE OR REPLACE FUNCTION sync_project_to_gallery_item()
RETURNS TRIGGER AS $$
DECLARE
    user_data RECORD;
    profile_data RECORD;
    artist_name TEXT;
    author_name TEXT;
    author_avatar_url TEXT;
    author_country TEXT;
    author_verified BOOLEAN;
    date_text TEXT;
    actions_array TEXT[];
BEGIN
    -- Get user data for author information
    SELECT 
        u.full_name,
        u.photo_url,
        u.country
    INTO user_data
    FROM users u
    WHERE u.id = NEW.user_id;
    
    -- Get profile data for artist name
    SELECT 
        p.inventor_name,
        p.company_name,
        p.project_name
    INTO profile_data
    FROM profiles p
    WHERE p.user_id = NEW.user_id
    LIMIT 1;
    
    -- Determine artist name (prefer profile data, fallback to user name)
    artist_name := COALESCE(
        profile_data.inventor_name,
        profile_data.company_name,
        profile_data.project_name,
        user_data.full_name,
        'Unknown'
    );
    
    -- Set author information
    author_name := user_data.full_name;
    author_avatar_url := user_data.photo_url;
    author_country := user_data.country;
    author_verified := COALESCE(NEW.verified, false);
    
    -- Format date (e.g., "Jan 09")
    date_text := to_char(NEW.created_at, 'Mon DD');
    
    -- Build actions array based on investment data
    actions_array := ARRAY[]::TEXT[];
    IF NEW.investment_percent IS NOT NULL OR NEW.investment_amount IS NOT NULL THEN
        actions_array := array_append(actions_array, 'EQUITY');
    END IF;
    IF NEW.investment_amount IS NOT NULL THEN
        actions_array := array_append(actions_array, 'INVESTMENT');
    END IF;
    
    -- Insert or update gallery_item when project is created/updated
    INSERT INTO gallery_items (
        project_id,
        title,
        artist,
        subtitle,
        description,
        category,
        image_url,
        images,
        available_status,
        available_label,
        location,
        badges,
        actions,
        views,
        likes,
        author_name,
        author_avatar_url,
        author_country,
        author_verified,
        date,
        featured,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.title,
        artist_name,
        NEW.subtitle,
        NEW.description,
        NEW.category,
        COALESCE(NEW.cover_image_url, ''),
        COALESCE(NEW.image_urls, ARRAY[]::text[]),
        COALESCE(NEW.available_status, true),
        COALESCE(NEW.available_label, 'Available'),
        NEW.location,
        COALESCE(NEW.badges, ARRAY[]::text[]),
        actions_array,
        COALESCE(NEW.views, 0),
        COALESCE(NEW.likes, 0),
        author_name,
        author_avatar_url,
        author_country,
        author_verified,
        date_text,
        COALESCE(NEW.featured, false),
        COALESCE(NEW.created_at, NOW()),
        NOW()
    )
    ON CONFLICT (project_id) 
    DO UPDATE SET
        title = EXCLUDED.title,
        artist = EXCLUDED.artist,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        image_url = EXCLUDED.image_url,
        images = EXCLUDED.images,
        available_status = EXCLUDED.available_status,
        available_label = EXCLUDED.available_label,
        location = EXCLUDED.location,
        badges = EXCLUDED.badges,
        actions = EXCLUDED.actions,
        views = EXCLUDED.views,
        likes = EXCLUDED.likes,
        author_name = EXCLUDED.author_name,
        author_avatar_url = EXCLUDED.author_avatar_url,
        author_country = EXCLUDED.author_country,
        author_verified = EXCLUDED.author_verified,
        date = EXCLUDED.date,
        featured = EXCLUDED.featured,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically sync projects to gallery_items
DROP TRIGGER IF EXISTS trigger_sync_project_to_gallery_item ON projects;
CREATE TRIGGER trigger_sync_project_to_gallery_item
    AFTER INSERT OR UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION sync_project_to_gallery_item();

-- Function to sync existing projects to gallery_items (one-time migration)
CREATE OR REPLACE FUNCTION sync_existing_projects_to_gallery_items()
RETURNS INTEGER AS $$
DECLARE
    synced_count INTEGER;
BEGIN
    -- Sync all existing projects to gallery_items
    INSERT INTO gallery_items (
        project_id,
        title,
        artist,
        subtitle,
        description,
        category,
        image_url,
        images,
        available_status,
        available_label,
        location,
        badges,
        actions,
        views,
        likes,
        author_name,
        author_avatar_url,
        author_country,
        author_verified,
        date,
        featured,
        created_at,
        updated_at
    )
    SELECT 
        p.id,
        p.title,
        COALESCE(
            pr.inventor_name,
            pr.company_name,
            pr.project_name,
            u.full_name,
            'Unknown'
        ) AS artist,
        p.subtitle,
        p.description,
        p.category,
        COALESCE(p.cover_image_url, ''),
        COALESCE(p.image_urls, ARRAY[]::text[]),
        COALESCE(p.available_status, true),
        COALESCE(p.available_label, 'Available'),
        p.location,
        COALESCE(p.badges, ARRAY[]::text[]),
        (
            SELECT COALESCE(array_agg(DISTINCT action), ARRAY[]::text[])
            FROM (
                SELECT 'EQUITY' AS action WHERE p.investment_percent IS NOT NULL OR p.investment_amount IS NOT NULL
                UNION ALL
                SELECT 'INVESTMENT' AS action WHERE p.investment_amount IS NOT NULL
            ) actions_filtered
        ) AS actions,
        COALESCE(p.views, 0),
        COALESCE(p.likes, 0),
        u.full_name AS author_name,
        u.photo_url AS author_avatar_url,
        u.country AS author_country,
        COALESCE(p.verified, false) AS author_verified,
        to_char(p.created_at, 'Mon DD') AS date,
        COALESCE(p.featured, false),
        COALESCE(p.created_at, NOW()),
        NOW()
    FROM projects p
    LEFT JOIN users u ON u.id = p.user_id
    LEFT JOIN profiles pr ON pr.user_id = p.user_id
    WHERE NOT EXISTS (
        SELECT 1 FROM gallery_items gi WHERE gi.project_id = p.id
    )
    ON CONFLICT (project_id) DO NOTHING;
    
    GET DIAGNOSTICS synced_count = ROW_COUNT;
    RETURN synced_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the migration to sync existing projects
SELECT sync_existing_projects_to_gallery_items() AS synced_projects_count;

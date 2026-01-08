-- =========================
-- PITCHINVEST - Populate Projects Table from Registration Data
-- =========================
-- This script creates project entries for existing registered users
-- based on their registration data in users, profiles, commercial_proposals, and pitch_materials tables
-- Only creates projects for Inventor, StartUp, and Company users (NOT Investor)

-- =========================
-- INSERT PROJECTS FROM REGISTRATION DATA
-- =========================

INSERT INTO public.projects (
  user_id,
  title,
  subtitle,
  description,
  category,
  status,
  available_status,
  available_label,
  location,
  investment_percent,
  investment_amount,
  commission,
  cover_image_url,
  image_urls,
  video_url,
  video_urls,
  badges,
  views,
  likes,
  approval_rate,
  featured,
  verified
)
SELECT 
  u.id AS user_id,
  COALESCE(p.project_name, u.full_name || '''s Project') AS title,
  COALESCE(p.company_name, p.inventor_name) AS subtitle,
  pm.description,
  p.project_category AS category,
  'pending' AS status, -- New projects start as pending for admin approval
  true AS available_status,
  'Available' AS available_label,
  -- Combine city and country into location
  CASE 
    WHEN u.city IS NOT NULL AND u.country IS NOT NULL THEN u.city || ', ' || u.country
    WHEN u.city IS NOT NULL THEN u.city
    WHEN u.country IS NOT NULL THEN u.country
    ELSE NULL
  END AS location,
  -- Parse investment_percent from equity_capital_percentage (e.g., "20%" -> 20.00)
  CASE 
    WHEN cp.equity_capital_percentage IS NOT NULL THEN
      CAST(
        REGEXP_REPLACE(
          cp.equity_capital_percentage, 
          '[^0-9.]', 
          '', 
          'g'
        ) AS DECIMAL(5,2)
      )
    ELSE NULL
  END AS investment_percent,
  cp.equity_total_value AS investment_amount,
  0 AS commission, -- Default commission
  u.cover_image_url,
  -- Combine cover_image_url and photos_urls into image_urls array
  CASE 
    WHEN u.cover_image_url IS NOT NULL AND array_length(pm.photos_urls, 1) > 0 THEN
      ARRAY[u.cover_image_url] || pm.photos_urls
    WHEN u.cover_image_url IS NOT NULL THEN
      ARRAY[u.cover_image_url]
    WHEN array_length(pm.photos_urls, 1) > 0 THEN
      pm.photos_urls
    ELSE
      ARRAY[]::text[]
  END AS image_urls,
  pm.pitch_video_url AS video_url,
  pm.pitch_videos_urls AS video_urls,
  ARRAY[]::text[] AS badges, -- Empty initially, can be set by admin later
  0 AS views,
  0 AS likes,
  NULL AS approval_rate, -- Will be calculated later
  false AS featured,
  false AS verified
FROM public.users u
INNER JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.commercial_proposals cp ON u.id = cp.user_id
LEFT JOIN public.pitch_materials pm ON u.id = pm.user_id
WHERE 
  -- Only create projects for non-Investor users
  u.user_type IN ('Inventor', 'StartUp', 'Company')
  -- Only create if project_name exists (required field)
  AND p.project_name IS NOT NULL
  -- Only create if project doesn't already exist for this user
  AND NOT EXISTS (
    SELECT 1 
    FROM public.projects pr 
    WHERE pr.user_id = u.id 
    AND pr.title = COALESCE(p.project_name, u.full_name || '''s Project')
  );

-- =========================
-- VERIFICATION QUERIES
-- =========================

-- Check how many projects were created
SELECT 
  COUNT(*) AS total_projects_created,
  COUNT(DISTINCT user_id) AS unique_users_with_projects
FROM public.projects;

-- Show created projects with user info
SELECT 
  pr.id AS project_id,
  pr.title,
  pr.category,
  pr.status,
  u.full_name AS creator_name,
  u.user_type,
  pr.location,
  pr.investment_percent,
  pr.investment_amount
FROM public.projects pr
INNER JOIN public.users u ON pr.user_id = u.id
ORDER BY pr.created_at DESC;

-- Show users without projects (should only be Investors)
SELECT 
  u.id,
  u.full_name,
  u.user_type,
  u.personal_email,
  p.project_name
FROM public.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.projects pr ON u.id = pr.user_id
WHERE pr.id IS NULL
ORDER BY u.user_type, u.full_name;

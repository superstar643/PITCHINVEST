-- =========================
-- PITCHINVEST - Complete System Schema
-- Includes: Projects, Auctions, Gallery Items, Engagement, Investor Portfolios
-- Run this AFTER 01_schema.sql and 05_bids_schema.sql
-- =========================

-- =========================
-- 1. PROJECTS TABLE
-- =========================
-- Central table for all projects/inventions/startups
-- Projects can be created by Inventor, StartUp, or Company users

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category TEXT, -- e.g., "Medical Technology", "SaaS", "Aerospace"
  
  -- Project Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'active', 'completed', 'archived')),
  available_status BOOLEAN DEFAULT true,
  available_label TEXT DEFAULT 'Available', -- "Available", "Unavailable", "In Auction", etc.
  
  -- Location
  location TEXT, -- City, Country
  
  -- Investment Information
  investment_percent DECIMAL(5,2), -- Percentage offered
  investment_amount TEXT, -- e.g., "€1,800,000"
  commission DECIMAL(5,2) DEFAULT 0, -- Commission percentage
  
  -- Media
  cover_image_url TEXT,
  image_urls TEXT[] DEFAULT '{}'::text[], -- Array of image URLs
  video_url TEXT, -- Main video URL
  video_urls TEXT[] DEFAULT '{}'::text[], -- Array of additional video URLs
  
  -- Badges/Tags
  badges TEXT[] DEFAULT '{}'::text[], -- e.g., ["FEATURED", "TRENDING", "VALIDATED"]
  
  -- Statistics (can be calculated or stored)
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  approval_rate DECIMAL(5,2), -- e.g., 94.50
  
  -- Metadata
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(category, '')), 'C')
  ) STORED
);

-- Indexes for Projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_location ON public.projects(location);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_search_vector ON public.projects USING GIN(search_vector);

-- =========================
-- 2. AUCTIONS TABLE
-- =========================
-- Dedicated auction listings linked to projects

CREATE TABLE IF NOT EXISTS public.auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Auction Details
  title TEXT NOT NULL,
  description TEXT,
  start_bid DECIMAL(15, 2) NOT NULL DEFAULT 0,
  current_bid DECIMAL(15, 2) DEFAULT 0,
  minimum_increment DECIMAL(15, 2) NOT NULL DEFAULT 1000,
  reserve_price DECIMAL(15, 2), -- Optional minimum price to accept
  
  -- Auction Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'ended', 'completed', 'cancelled')),
  
  -- Timing
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Statistics
  total_bids INTEGER DEFAULT 0,
  unique_bidders INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_auction_dates CHECK (end_date > start_date),
  CONSTRAINT valid_increment CHECK (minimum_increment > 0)
);

-- Indexes for Auctions
CREATE INDEX IF NOT EXISTS idx_auctions_project_id ON public.auctions(project_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON public.auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_start_date ON public.auctions(start_date);
CREATE INDEX IF NOT EXISTS idx_auctions_end_date ON public.auctions(end_date);
CREATE INDEX IF NOT EXISTS idx_auctions_active ON public.auctions(status, start_date, end_date) WHERE status = 'active';

-- =========================
-- 3. UPDATE BIDS TABLE
-- =========================
-- Add proper foreign key to auctions table (maintain backward compatibility)

ALTER TABLE public.bids 
  ADD COLUMN IF NOT EXISTS auction_id_new UUID REFERENCES public.auctions(id) ON DELETE CASCADE;

-- Create index for new foreign key
CREATE INDEX IF NOT EXISTS idx_bids_auction_id_new ON public.bids(auction_id_new);

-- =========================
-- 4. GALLERY ITEMS TABLE
-- =========================
-- Gallery showcase items (can be linked to projects OR standalone)

CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL, -- NULL = standalone gallery item
  
  -- Basic Information
  title TEXT NOT NULL,
  artist TEXT, -- Creator/Artist name
  subtitle TEXT,
  description TEXT,
  category TEXT,
  
  -- Media
  image_url TEXT NOT NULL,
  images TEXT[] DEFAULT '{}'::text[], -- Array of image URLs
  
  -- Status & Display
  available_status BOOLEAN DEFAULT true,
  available_label TEXT DEFAULT 'Available',
  
  -- Location
  location TEXT,
  
  -- Badges/Tags (stored as array)
  badges TEXT[] DEFAULT '{}'::text[], -- e.g., ["FEATURED", "TRENDING", "VALIDATED"]
  
  -- Actions/Proposal Types
  actions TEXT[] DEFAULT '{}'::text[], -- e.g., ["ROYALTIES", "TOTAL BUYOUT"]
  
  -- Statistics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  
  -- Author Information (can be denormalized from project or stored separately)
  author_name TEXT,
  author_avatar_url TEXT,
  author_country TEXT,
  author_verified BOOLEAN DEFAULT false,
  
  -- Metadata
  date TEXT, -- Display date (e.g., "Oct 24")
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Gallery Items
CREATE INDEX IF NOT EXISTS idx_gallery_items_project_id ON public.gallery_items(project_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON public.gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_gallery_items_location ON public.gallery_items(location);
CREATE INDEX IF NOT EXISTS idx_gallery_items_featured ON public.gallery_items(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_gallery_items_created_at ON public.gallery_items(created_at DESC);

-- =========================
-- 5. PROJECT ENGAGEMENT TABLE
-- =========================
-- Track likes, views, and other engagement metrics per user

CREATE TABLE IF NOT EXISTS public.project_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL for anonymous views
  
  -- Engagement Types
  liked BOOLEAN DEFAULT false,
  viewed BOOLEAN DEFAULT true, -- Always true when record exists
  bookmarked BOOLEAN DEFAULT false,
  
  -- Timestamps
  first_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  liked_at TIMESTAMPTZ,
  bookmarked_at TIMESTAMPTZ,
  
  -- Unique constraint: one engagement record per user per project
  CONSTRAINT unique_user_project_engagement UNIQUE (project_id, user_id)
);

-- Indexes for Engagement
CREATE INDEX IF NOT EXISTS idx_engagement_project_id ON public.project_engagement(project_id);
CREATE INDEX IF NOT EXISTS idx_engagement_user_id ON public.project_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_liked ON public.project_engagement(project_id) WHERE liked = true;

-- =========================
-- 6. GALLERY ENGAGEMENT TABLE
-- =========================
-- Track engagement for gallery items

CREATE TABLE IF NOT EXISTS public.gallery_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_item_id UUID NOT NULL REFERENCES public.gallery_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  liked BOOLEAN DEFAULT false,
  viewed BOOLEAN DEFAULT true,
  
  first_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  liked_at TIMESTAMPTZ,
  
  CONSTRAINT unique_user_gallery_engagement UNIQUE (gallery_item_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_gallery_engagement_item_id ON public.gallery_engagement(gallery_item_id);
CREATE INDEX IF NOT EXISTS idx_gallery_engagement_user_id ON public.gallery_engagement(user_id);

-- =========================
-- 7. INVESTOR PORTFOLIOS TABLE
-- =========================
-- Track which investors are interested in/following which projects

CREATE TABLE IF NOT EXISTS public.investor_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Interest Level
  interest_level TEXT DEFAULT 'viewed' CHECK (interest_level IN ('viewed', 'interested', 'shortlisted', 'contacted', 'invested')),
  
  -- Notes (private to investor)
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_investor_project UNIQUE (investor_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_portfolios_investor_id ON public.investor_portfolios(investor_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_project_id ON public.investor_portfolios(project_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_interest_level ON public.investor_portfolios(interest_level);

-- =========================
-- 8. RLS POLICIES
-- =========================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_portfolios ENABLE ROW LEVEL SECURITY;

-- Projects Policies
-- Public can read all approved/active projects
DROP POLICY IF EXISTS "projects_select_public" ON public.projects;
CREATE POLICY "projects_select_public"
ON public.projects FOR SELECT
USING (status IN ('approved', 'active', 'completed'));

-- Users can select their own projects (any status)
DROP POLICY IF EXISTS "projects_select_own" ON public.projects;
CREATE POLICY "projects_select_own"
ON public.projects FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own projects
DROP POLICY IF EXISTS "projects_insert_own" ON public.projects;
CREATE POLICY "projects_insert_own"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
DROP POLICY IF EXISTS "projects_update_own" ON public.projects;
CREATE POLICY "projects_update_own"
ON public.projects FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own projects (if draft/pending)
DROP POLICY IF EXISTS "projects_delete_own" ON public.projects;
CREATE POLICY "projects_delete_own"
ON public.projects FOR DELETE
USING (auth.uid() = user_id AND status IN ('draft', 'pending'));

-- Auctions Policies
-- Public can read active auctions
DROP POLICY IF EXISTS "auctions_select_public" ON public.auctions;
CREATE POLICY "auctions_select_public"
ON public.auctions FOR SELECT
USING (status IN ('active', 'scheduled', 'completed'));

-- Project owners can manage their auctions
DROP POLICY IF EXISTS "auctions_select_own" ON public.auctions;
CREATE POLICY "auctions_select_own"
ON public.auctions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = auctions.project_id 
    AND projects.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "auctions_insert_own" ON public.auctions;
CREATE POLICY "auctions_insert_own"
ON public.auctions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = auctions.project_id 
    AND projects.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "auctions_update_own" ON public.auctions;
CREATE POLICY "auctions_update_own"
ON public.auctions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = auctions.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Gallery Items Policies
-- Public can read all gallery items
DROP POLICY IF EXISTS "gallery_items_select_public" ON public.gallery_items;
CREATE POLICY "gallery_items_select_public"
ON public.gallery_items FOR SELECT
USING (true);

-- Project owners can manage gallery items for their projects
DROP POLICY IF EXISTS "gallery_items_manage_own" ON public.gallery_items;
CREATE POLICY "gallery_items_manage_own"
ON public.gallery_items FOR ALL
USING (
  project_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = gallery_items.project_id 
    AND projects.user_id = auth.uid()
  )
)
WITH CHECK (
  project_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = gallery_items.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Engagement Policies
-- Public can view engagement (for statistics)
DROP POLICY IF EXISTS "engagement_select_public" ON public.project_engagement;
CREATE POLICY "engagement_select_public"
ON public.project_engagement FOR SELECT
USING (true);

-- Users can manage their own engagement
DROP POLICY IF EXISTS "engagement_manage_own" ON public.project_engagement;
CREATE POLICY "engagement_manage_own"
ON public.project_engagement FOR ALL
USING (user_id IS NULL OR auth.uid() = user_id)
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Same for gallery engagement
DROP POLICY IF EXISTS "gallery_engagement_select_public" ON public.gallery_engagement;
CREATE POLICY "gallery_engagement_select_public"
ON public.gallery_engagement FOR SELECT
USING (true);

DROP POLICY IF EXISTS "gallery_engagement_manage_own" ON public.gallery_engagement;
CREATE POLICY "gallery_engagement_manage_own"
ON public.gallery_engagement FOR ALL
USING (user_id IS NULL OR auth.uid() = user_id)
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Investor Portfolios Policies
-- Investors can manage their own portfolios
DROP POLICY IF EXISTS "portfolios_manage_own" ON public.investor_portfolios;
CREATE POLICY "portfolios_manage_own"
ON public.investor_portfolios FOR ALL
USING (auth.uid() = investor_id)
WITH CHECK (auth.uid() = investor_id);

-- =========================
-- 9. HELPER FUNCTIONS
-- =========================

-- Function to update project statistics (views, likes)
CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    UPDATE public.projects
    SET 
      views = (
        SELECT COUNT(*) 
        FROM public.project_engagement 
        WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
      ),
      likes = (
        SELECT COUNT(*) 
        FROM public.project_engagement 
        WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) 
        AND liked = true
      ),
      updated_at = NOW()
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update project stats
DROP TRIGGER IF EXISTS trigger_update_project_stats ON public.project_engagement;
CREATE TRIGGER trigger_update_project_stats
AFTER INSERT OR UPDATE OR DELETE ON public.project_engagement
FOR EACH ROW EXECUTE FUNCTION update_project_stats();

-- Function to update gallery item statistics
CREATE OR REPLACE FUNCTION update_gallery_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    UPDATE public.gallery_items
    SET 
      views = (
        SELECT COUNT(*) 
        FROM public.gallery_engagement 
        WHERE gallery_item_id = COALESCE(NEW.gallery_item_id, OLD.gallery_item_id)
      ),
      likes = (
        SELECT COUNT(*) 
        FROM public.gallery_engagement 
        WHERE gallery_item_id = COALESCE(NEW.gallery_item_id, OLD.gallery_item_id) 
        AND liked = true
      ),
      updated_at = NOW()
    WHERE id = COALESCE(NEW.gallery_item_id, OLD.gallery_item_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update gallery stats
DROP TRIGGER IF EXISTS trigger_update_gallery_stats ON public.gallery_engagement;
CREATE TRIGGER trigger_update_gallery_stats
AFTER INSERT OR UPDATE OR DELETE ON public.gallery_engagement
FOR EACH ROW EXECUTE FUNCTION update_gallery_stats();

-- Function to update auction bid statistics
CREATE OR REPLACE FUNCTION update_auction_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_auction_id UUID;
BEGIN
  -- Determine which auction_id to use (prefer new, fallback to old TEXT)
  target_auction_id := COALESCE(NEW.auction_id_new, OLD.auction_id_new);
  
  -- If new column is NULL, try to find auction by TEXT ID
  IF target_auction_id IS NULL THEN
    SELECT id INTO target_auction_id
    FROM public.auctions
    WHERE id::TEXT = COALESCE(NEW.auction_id, OLD.auction_id)
    LIMIT 1;
  END IF;
  
  IF target_auction_id IS NOT NULL THEN
    UPDATE public.auctions
    SET 
      total_bids = (
        SELECT COUNT(*) 
        FROM public.bids 
        WHERE auction_id_new = target_auction_id
           OR (auction_id_new IS NULL AND auction_id = target_auction_id::TEXT)
      ),
      unique_bidders = (
        SELECT COUNT(DISTINCT user_id) 
        FROM public.bids 
        WHERE auction_id_new = target_auction_id
           OR (auction_id_new IS NULL AND auction_id = target_auction_id::TEXT)
      ),
      current_bid = (
        SELECT COALESCE(MAX(bid_amount), start_bid)
        FROM public.bids 
        WHERE auction_id_new = target_auction_id
           OR (auction_id_new IS NULL AND auction_id = target_auction_id::TEXT)
      ),
      updated_at = NOW()
    WHERE id = target_auction_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update auction stats
DROP TRIGGER IF EXISTS trigger_update_auction_stats ON public.bids;
CREATE TRIGGER trigger_update_auction_stats
AFTER INSERT OR UPDATE OR DELETE ON public.bids
FOR EACH ROW EXECUTE FUNCTION update_auction_stats();

-- Function to validate investor portfolios (ensure only Investor user_type can create portfolios)
CREATE OR REPLACE FUNCTION validate_investor_portfolio()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the investor_id belongs to a user with user_type = 'Investor'
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = NEW.investor_id AND user_type = 'Investor'
  ) THEN
    RAISE EXCEPTION 'Only users with user_type = Investor can create investor portfolios. User % has type %', NEW.investor_id, (SELECT user_type FROM public.users WHERE id = NEW.investor_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate investor portfolios
DROP TRIGGER IF EXISTS trigger_validate_investor_portfolio ON public.investor_portfolios;
CREATE TRIGGER trigger_validate_investor_portfolio
BEFORE INSERT OR UPDATE ON public.investor_portfolios
FOR EACH ROW EXECUTE FUNCTION validate_investor_portfolio();

-- =========================
-- 10. VIEWS FOR EASY QUERYING (OPTIONAL - REMOVED)
-- =========================
-- Views are optional convenience queries - removed to avoid "UNRESTRICTED" warnings
-- Drop existing views if they were previously created (uncomment to remove):
DROP VIEW IF EXISTS public.projects_full;
DROP VIEW IF EXISTS public.active_auctions_full;
DROP VIEW IF EXISTS public.gallery_items_full;

-- Note: If you want to use these views in the future, uncomment the view definitions below

-- -- View: Projects with full details
-- CREATE OR REPLACE VIEW projects_full AS
-- SELECT 
--   p.*,
--   u.full_name as creator_name,
--   u.user_type as creator_type,
--   u.photo_url as creator_avatar,
--   u.country as creator_country,
--   prof.project_name,
--   prof.project_category,
--   a.id as auction_id,
--   a.status as auction_status,
--   a.current_bid as auction_current_bid,
--   a.end_date as auction_end_date
-- FROM public.projects p
-- JOIN public.users u ON p.user_id = u.id
-- LEFT JOIN public.profiles prof ON p.user_id = prof.user_id
-- LEFT JOIN public.auctions a ON p.id = a.project_id AND a.status = 'active';

-- -- View: Active Auctions with Project Details
-- CREATE OR REPLACE VIEW active_auctions_full AS
-- SELECT 
--   a.*,
--   p.title as project_title,
--   p.description as project_description,
--   p.image_urls as project_images,
--   u.full_name as project_creator,
--   u.user_type as creator_type
-- FROM public.auctions a
-- JOIN public.projects p ON a.project_id = p.id
-- JOIN public.users u ON p.user_id = u.id
-- WHERE a.status = 'active' AND a.end_date > NOW();

-- -- View: Gallery Items with Project Links
-- CREATE OR REPLACE VIEW gallery_items_full AS
-- SELECT 
--   g.*,
--   p.title as project_title,
--   p.user_id as project_owner_id,
--   u.full_name as project_owner_name
-- FROM public.gallery_items g
-- LEFT JOIN public.projects p ON g.project_id = p.id
-- LEFT JOIN public.users u ON p.user_id = u.id;

-- =========================
-- 11. VERIFICATION QUERIES
-- =========================
-- Run these to verify everything was created:

-- Check tables were created (should return 6 rows):
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
--   AND table_name IN ('projects', 'auctions', 'gallery_items', 'project_engagement', 'gallery_engagement', 'investor_portfolios');

-- Check indexes were created:
-- SELECT indexname, tablename 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
--   AND tablename IN ('projects', 'auctions', 'gallery_items', 'project_engagement', 'gallery_engagement', 'investor_portfolios')
-- ORDER BY tablename, indexname;

-- Check policies were created:
-- SELECT tablename, policyname 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
--   AND tablename IN ('projects', 'auctions', 'gallery_items', 'project_engagement', 'gallery_engagement', 'investor_portfolios')
-- ORDER BY tablename, policyname;


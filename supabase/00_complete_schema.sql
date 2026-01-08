-- =========================
-- PITCHINVEST - Complete Database Schema (All 11 Tables)
-- Updated with new field names
-- Run this in Supabase SQL Editor
-- =========================

-- Required for gen_random_uuid() and password hashing
create extension if not exists pgcrypto WITH SCHEMA public;

-- =========================
-- TABLE 1: users
-- =========================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  user_type text check (user_type is null or user_type in ('Inventor','StartUp','Company','Investor')),
  full_name text not null,
  personal_email text not null,
  telephone text,
  country text,
  city text,
  cover_image_url text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- =========================
-- TABLE 2: profiles
-- =========================
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,

  project_name text,
  project_category text,

  -- Company / StartUp fields
  company_name text,
  company_nif text,
  company_telephone text,
  smart_money text,
  total_sale_of_project text,

  -- Investor fields
  investment_preferences text,

  -- Inventor fields
  inventor_name text,
  license_number text,
  release_date text,
  initial_license_value text, -- Patent Exploitation Fee
  exploitation_license_royalty text, -- Patent Exploitation Royalties
  patent_sale text, -- Full Patent Assignment (100%)
  investors_count text,

  created_at timestamptz not null default now()
);

-- =========================
-- TABLE 3: commercial_proposals
-- =========================
create table if not exists public.commercial_proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,

  -- Block 1: Investment Offer (%)
  -- equity_capital_percentage = Equity
  -- equity_total_value = Investment Amount
  equity_capital_percentage text,
  equity_total_value text,

  -- Block 2: Brand Exploitation Rights
  -- license_fee = Initial Licensing Fee
  -- licensing_royalties_percentage = Royalties (%)
  license_fee text,
  licensing_royalties_percentage text,

  -- Block 3: Franchise
  -- franchisee_investment = Franchise Fee
  -- monthly_royalties = Royalties (%)
  franchisee_investment text,
  monthly_royalties text,

  -- Block 4: Patent Licensing (Inventor)
  patent_upfront_fee text,
  patent_royalties text,

  created_at timestamptz not null default now()
);

-- =========================
-- TABLE 4: pitch_materials
-- =========================
create table if not exists public.pitch_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,

  pitch_video_url text,
  photos_urls text[] not null default '{}'::text[],
  pitch_videos_urls text[] not null default '{}'::text[],
  description text,
  fact_sheet text,
  technical_sheet text,

  created_at timestamptz not null default now()
);

-- =========================
-- TABLE 5: projects
-- =========================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category TEXT,
  
  -- Project Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'active', 'completed', 'archived')),
  available_status BOOLEAN DEFAULT true,
  available_label TEXT DEFAULT 'Available',
  
  -- Location
  location TEXT,
  
  -- Investment Information
  investment_percent DECIMAL(5,2),
  investment_amount TEXT,
  commission DECIMAL(5,2) DEFAULT 0,
  
  -- Media
  cover_image_url TEXT,
  image_urls TEXT[] DEFAULT '{}'::text[],
  video_url TEXT,
  video_urls TEXT[] DEFAULT '{}'::text[],
  
  -- Badges/Tags
  badges TEXT[] DEFAULT '{}'::text[],
  
  -- Statistics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  approval_rate DECIMAL(5,2),
  
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
-- TABLE 6: auctions
-- =========================
CREATE TABLE IF NOT EXISTS public.auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  
  -- Auction Details
  title TEXT NOT NULL,
  description TEXT,
  start_bid DECIMAL(15, 2) NOT NULL DEFAULT 0,
  current_bid DECIMAL(15, 2) DEFAULT 0,
  minimum_increment DECIMAL(15, 2) NOT NULL DEFAULT 1000,
  reserve_price DECIMAL(15, 2),
  
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
-- TABLE 7: bids
-- =========================
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id TEXT NOT NULL,
  auction_id_new UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bid_amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Bids
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_auction_id_new ON public.bids(auction_id_new);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON public.bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON public.bids(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_auction_amount ON public.bids(auction_id, bid_amount DESC);

-- =========================
-- TABLE 8: gallery_items
-- =========================
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  
  -- Basic Information
  title TEXT NOT NULL,
  artist TEXT,
  subtitle TEXT,
  description TEXT,
  category TEXT,
  
  -- Media
  image_url TEXT NOT NULL,
  images TEXT[] DEFAULT '{}'::text[],
  
  -- Status & Display
  available_status BOOLEAN DEFAULT true,
  available_label TEXT DEFAULT 'Available',
  
  -- Location
  location TEXT,
  
  -- Badges/Tags
  badges TEXT[] DEFAULT '{}'::text[],
  
  -- Actions/Proposal Types
  actions TEXT[] DEFAULT '{}'::text[],
  
  -- Statistics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  
  -- Author Information
  author_name TEXT,
  author_avatar_url TEXT,
  author_country TEXT,
  author_verified BOOLEAN DEFAULT false,
  
  -- Metadata
  date TEXT,
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
-- TABLE 9: project_engagement
-- =========================
CREATE TABLE IF NOT EXISTS public.project_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Engagement Types
  liked BOOLEAN DEFAULT false,
  viewed BOOLEAN DEFAULT true,
  bookmarked BOOLEAN DEFAULT false,
  
  -- Timestamps
  first_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  liked_at TIMESTAMPTZ,
  bookmarked_at TIMESTAMPTZ,
  
  CONSTRAINT unique_user_project_engagement UNIQUE (project_id, user_id)
);

-- Indexes for Engagement
CREATE INDEX IF NOT EXISTS idx_engagement_project_id ON public.project_engagement(project_id);
CREATE INDEX IF NOT EXISTS idx_engagement_user_id ON public.project_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_liked ON public.project_engagement(project_id) WHERE liked = true;

-- =========================
-- TABLE 10: gallery_engagement
-- =========================
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
-- TABLE 11: investor_portfolios
-- =========================
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
-- ROW LEVEL SECURITY (RLS)
-- =========================

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.commercial_proposals enable row level security;
alter table public.pitch_materials enable row level security;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_portfolios ENABLE ROW LEVEL SECURITY;

-- Users Policies
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users for select using (auth.uid() = id);

drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "users_delete_own" on public.users;
create policy "users_delete_own" on public.users for delete using (auth.uid() = id);

-- Profiles Policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = user_id);

-- Commercial Proposals Policies
drop policy if exists "commercial_proposals_select_own" on public.commercial_proposals;
create policy "commercial_proposals_select_own" on public.commercial_proposals for select using (auth.uid() = user_id);

drop policy if exists "commercial_proposals_insert_own" on public.commercial_proposals;
create policy "commercial_proposals_insert_own" on public.commercial_proposals for insert with check (auth.uid() = user_id);

drop policy if exists "commercial_proposals_update_own" on public.commercial_proposals;
create policy "commercial_proposals_update_own" on public.commercial_proposals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "commercial_proposals_delete_own" on public.commercial_proposals;
create policy "commercial_proposals_delete_own" on public.commercial_proposals for delete using (auth.uid() = user_id);

-- Pitch Materials Policies
drop policy if exists "pitch_materials_select_own" on public.pitch_materials;
create policy "pitch_materials_select_own" on public.pitch_materials for select using (auth.uid() = user_id);

drop policy if exists "pitch_materials_insert_own" on public.pitch_materials;
create policy "pitch_materials_insert_own" on public.pitch_materials for insert with check (auth.uid() = user_id);

drop policy if exists "pitch_materials_update_own" on public.pitch_materials;
create policy "pitch_materials_update_own" on public.pitch_materials for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "pitch_materials_delete_own" on public.pitch_materials;
create policy "pitch_materials_delete_own" on public.pitch_materials for delete using (auth.uid() = user_id);

-- Bids Policies
DROP POLICY IF EXISTS "bids_select_all" ON public.bids;
CREATE POLICY "bids_select_all" ON public.bids FOR SELECT USING (true);

DROP POLICY IF EXISTS "bids_insert_own" ON public.bids;
CREATE POLICY "bids_insert_own" ON public.bids FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bids_update_own" ON public.bids;
CREATE POLICY "bids_update_own" ON public.bids FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bids_delete_own" ON public.bids;
CREATE POLICY "bids_delete_own" ON public.bids FOR DELETE USING (auth.uid() = user_id);

-- Projects Policies
DROP POLICY IF EXISTS "projects_select_public" ON public.projects;
CREATE POLICY "projects_select_public" ON public.projects FOR SELECT USING (status IN ('approved', 'active', 'completed'));

DROP POLICY IF EXISTS "projects_select_own" ON public.projects;
CREATE POLICY "projects_select_own" ON public.projects FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_insert_own" ON public.projects;
CREATE POLICY "projects_insert_own" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_update_own" ON public.projects;
CREATE POLICY "projects_update_own" ON public.projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_delete_own" ON public.projects;
CREATE POLICY "projects_delete_own" ON public.projects FOR DELETE USING (auth.uid() = user_id AND status IN ('draft', 'pending'));

-- Auctions Policies
DROP POLICY IF EXISTS "auctions_select_public" ON public.auctions;
CREATE POLICY "auctions_select_public" ON public.auctions FOR SELECT USING (status IN ('active', 'scheduled', 'completed'));

DROP POLICY IF EXISTS "auctions_select_own" ON public.auctions;
CREATE POLICY "auctions_select_own" ON public.auctions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = auctions.project_id AND projects.user_id = auth.uid())
);

DROP POLICY IF EXISTS "auctions_insert_own" ON public.auctions;
CREATE POLICY "auctions_insert_own" ON public.auctions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = auctions.project_id AND projects.user_id = auth.uid())
);

DROP POLICY IF EXISTS "auctions_update_own" ON public.auctions;
CREATE POLICY "auctions_update_own" ON public.auctions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = auctions.project_id AND projects.user_id = auth.uid())
);

-- Gallery Items Policies
DROP POLICY IF EXISTS "gallery_items_select_public" ON public.gallery_items;
CREATE POLICY "gallery_items_select_public" ON public.gallery_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "gallery_items_manage_own" ON public.gallery_items;
CREATE POLICY "gallery_items_manage_own" ON public.gallery_items FOR ALL
USING (
  project_id IS NULL OR
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = gallery_items.project_id AND projects.user_id = auth.uid())
)
WITH CHECK (
  project_id IS NULL OR
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = gallery_items.project_id AND projects.user_id = auth.uid())
);

-- Engagement Policies
DROP POLICY IF EXISTS "engagement_select_public" ON public.project_engagement;
CREATE POLICY "engagement_select_public" ON public.project_engagement FOR SELECT USING (true);

DROP POLICY IF EXISTS "engagement_manage_own" ON public.project_engagement;
CREATE POLICY "engagement_manage_own" ON public.project_engagement FOR ALL
USING (user_id IS NULL OR auth.uid() = user_id)
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "gallery_engagement_select_public" ON public.gallery_engagement;
CREATE POLICY "gallery_engagement_select_public" ON public.gallery_engagement FOR SELECT USING (true);

DROP POLICY IF EXISTS "gallery_engagement_manage_own" ON public.gallery_engagement;
CREATE POLICY "gallery_engagement_manage_own" ON public.gallery_engagement FOR ALL
USING (user_id IS NULL OR auth.uid() = user_id)
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Investor Portfolios Policies
DROP POLICY IF EXISTS "portfolios_manage_own" ON public.investor_portfolios;
CREATE POLICY "portfolios_manage_own" ON public.investor_portfolios FOR ALL
USING (auth.uid() = investor_id)
WITH CHECK (auth.uid() = investor_id);

-- =========================
-- HELPER FUNCTIONS
-- =========================

-- Function: Get Highest Bid for Auction
CREATE OR REPLACE FUNCTION get_highest_bid(auction_id_param TEXT)
RETURNS DECIMAL(15, 2) AS $$
BEGIN
  RETURN (
    SELECT COALESCE(MAX(bid_amount), 0)
    FROM public.bids
    WHERE auction_id = auction_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Bid Count for Auction
CREATE OR REPLACE FUNCTION get_bid_count(auction_id_param TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.bids
    WHERE auction_id = auction_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update Project Statistics
CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    UPDATE public.projects
    SET 
      views = (SELECT COUNT(*) FROM public.project_engagement WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)),
      likes = (SELECT COUNT(*) FROM public.project_engagement WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) AND liked = true),
      updated_at = NOW()
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update Project Stats
DROP TRIGGER IF EXISTS trigger_update_project_stats ON public.project_engagement;
CREATE TRIGGER trigger_update_project_stats
AFTER INSERT OR UPDATE OR DELETE ON public.project_engagement
FOR EACH ROW EXECUTE FUNCTION update_project_stats();

-- Function: Update Gallery Item Statistics
CREATE OR REPLACE FUNCTION update_gallery_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    UPDATE public.gallery_items
    SET 
      views = (SELECT COUNT(*) FROM public.gallery_engagement WHERE gallery_item_id = COALESCE(NEW.gallery_item_id, OLD.gallery_item_id)),
      likes = (SELECT COUNT(*) FROM public.gallery_engagement WHERE gallery_item_id = COALESCE(NEW.gallery_item_id, OLD.gallery_item_id) AND liked = true),
      updated_at = NOW()
    WHERE id = COALESCE(NEW.gallery_item_id, OLD.gallery_item_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update Gallery Stats
DROP TRIGGER IF EXISTS trigger_update_gallery_stats ON public.gallery_engagement;
CREATE TRIGGER trigger_update_gallery_stats
AFTER INSERT OR UPDATE OR DELETE ON public.gallery_engagement
FOR EACH ROW EXECUTE FUNCTION update_gallery_stats();

-- Function: Update Auction Statistics
CREATE OR REPLACE FUNCTION update_auction_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_auction_id UUID;
BEGIN
  target_auction_id := COALESCE(NEW.auction_id_new, OLD.auction_id_new);
  
  IF target_auction_id IS NULL THEN
    SELECT id INTO target_auction_id
    FROM public.auctions
    WHERE id::TEXT = COALESCE(NEW.auction_id, OLD.auction_id)
    LIMIT 1;
  END IF;
  
  IF target_auction_id IS NOT NULL THEN
    UPDATE public.auctions
    SET 
      total_bids = (SELECT COUNT(*) FROM public.bids WHERE auction_id_new = target_auction_id OR (auction_id_new IS NULL AND auction_id = target_auction_id::TEXT)),
      unique_bidders = (SELECT COUNT(DISTINCT user_id) FROM public.bids WHERE auction_id_new = target_auction_id OR (auction_id_new IS NULL AND auction_id = target_auction_id::TEXT)),
      current_bid = (SELECT COALESCE(MAX(bid_amount), start_bid) FROM public.bids WHERE auction_id_new = target_auction_id OR (auction_id_new IS NULL AND auction_id = target_auction_id::TEXT)),
      updated_at = NOW()
    WHERE id = target_auction_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update Auction Stats
DROP TRIGGER IF EXISTS trigger_update_auction_stats ON public.bids;
CREATE TRIGGER trigger_update_auction_stats
AFTER INSERT OR UPDATE OR DELETE ON public.bids
FOR EACH ROW EXECUTE FUNCTION update_auction_stats();

-- Function: Validate Investor Portfolios
CREATE OR REPLACE FUNCTION validate_investor_portfolio()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.investor_id AND user_type = 'Investor') THEN
    RAISE EXCEPTION 'Only users with user_type = Investor can create investor portfolios. User % has type %', NEW.investor_id, (SELECT user_type FROM public.users WHERE id = NEW.investor_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Validate Investor Portfolios
DROP TRIGGER IF EXISTS trigger_validate_investor_portfolio ON public.investor_portfolios;
CREATE TRIGGER trigger_validate_investor_portfolio
BEFORE INSERT OR UPDATE ON public.investor_portfolios
FOR EACH ROW EXECUTE FUNCTION validate_investor_portfolio();

-- =========================
-- VERIFICATION QUERIES
-- =========================
-- Run these to verify all 11 tables were created:

-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
--   AND table_name IN (
--     'users', 'profiles', 'commercial_proposals', 'pitch_materials', 
--     'bids', 'projects', 'auctions', 'gallery_items', 
--     'project_engagement', 'gallery_engagement', 'investor_portfolios'
--   )
-- ORDER BY table_name;

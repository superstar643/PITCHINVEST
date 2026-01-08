-- PITCHINVEST - Bids schema for auction system
-- Run this in Supabase SQL Editor

-- =========================
-- Bids Table
-- =========================

CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bid_amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- Indexes for Performance
-- =========================

CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON public.bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON public.bids(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_auction_amount ON public.bids(auction_id, bid_amount DESC);

-- =========================
-- RLS Policies
-- =========================

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Public can read all bids (for displaying bid history)
DROP POLICY IF EXISTS "bids_select_all" ON public.bids;
CREATE POLICY "bids_select_all"
ON public.bids FOR SELECT
USING (true);

-- Authenticated users can insert their own bids
DROP POLICY IF EXISTS "bids_insert_own" ON public.bids;
CREATE POLICY "bids_insert_own"
ON public.bids FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bids (if needed for bid cancellation/modification)
DROP POLICY IF EXISTS "bids_update_own" ON public.bids;
CREATE POLICY "bids_update_own"
ON public.bids FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bids (if needed for bid cancellation)
DROP POLICY IF EXISTS "bids_delete_own" ON public.bids;
CREATE POLICY "bids_delete_own"
ON public.bids FOR DELETE
USING (auth.uid() = user_id);

-- =========================
-- Helper Function: Get Highest Bid for Auction
-- =========================

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

-- =========================
-- Helper Function: Get Bid Count for Auction
-- =========================

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


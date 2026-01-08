-- PITCHINVEST - Registration schema
-- Run this in Supabase SQL Editor (project: maamrtqggssxcroxrdye)

-- Required for gen_random_uuid() and password hashing
-- Note: pgcrypto must be enabled for password hashing functions
create extension if not exists pgcrypto WITH SCHEMA public;

-- =========================
-- Tables
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
-- RLS
-- =========================

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.commercial_proposals enable row level security;
alter table public.pitch_materials enable row level security;

-- Users
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
on public.users for select
using (auth.uid() = id);

drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own"
on public.users for insert
with check (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "users_delete_own" on public.users;
create policy "users_delete_own"
on public.users for delete
using (auth.uid() = id);

-- Profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles for delete
using (auth.uid() = user_id);

-- Commercial proposals
drop policy if exists "commercial_proposals_select_own" on public.commercial_proposals;
create policy "commercial_proposals_select_own"
on public.commercial_proposals for select
using (auth.uid() = user_id);

drop policy if exists "commercial_proposals_insert_own" on public.commercial_proposals;
create policy "commercial_proposals_insert_own"
on public.commercial_proposals for insert
with check (auth.uid() = user_id);

drop policy if exists "commercial_proposals_update_own" on public.commercial_proposals;
create policy "commercial_proposals_update_own"
on public.commercial_proposals for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "commercial_proposals_delete_own" on public.commercial_proposals;
create policy "commercial_proposals_delete_own"
on public.commercial_proposals for delete
using (auth.uid() = user_id);

-- Pitch materials
drop policy if exists "pitch_materials_select_own" on public.pitch_materials;
create policy "pitch_materials_select_own"
on public.pitch_materials for select
using (auth.uid() = user_id);

drop policy if exists "pitch_materials_insert_own" on public.pitch_materials;
create policy "pitch_materials_insert_own"
on public.pitch_materials for insert
with check (auth.uid() = user_id);

drop policy if exists "pitch_materials_update_own" on public.pitch_materials;
create policy "pitch_materials_update_own"
on public.pitch_materials for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "pitch_materials_delete_own" on public.pitch_materials;
create policy "pitch_materials_delete_own"
on public.pitch_materials for delete
using (auth.uid() = user_id);

-- =========================
-- Helper Function: Create Auth Users
-- =========================
-- NOTE: Direct insertion into auth.users requires elevated permissions.
-- If this fails, create users manually via Supabase Dashboard → Authentication → Users
-- 
-- This function creates auth users with proper password hashing
-- Usage: SELECT create_test_auth_user('inventor@test.com', 'Test123!@#', 'Dr. Sarah Johnson');

CREATE OR REPLACE FUNCTION create_test_auth_user(
  user_email text,
  user_password text,
  user_display_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  user_id uuid;
  encrypted_pw text;
  existing_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO existing_user_id FROM auth.users WHERE email = user_email LIMIT 1;
  IF existing_user_id IS NOT NULL THEN
    RAISE NOTICE 'User already exists: % (ID: %)', user_email, existing_user_id;
    RETURN existing_user_id;
  END IF;
  
  -- Generate a new UUID for the user
  user_id := gen_random_uuid();
  
  -- Hash the password using bcrypt (Supabase standard)
  -- pgcrypto functions are available without schema prefix once extension is enabled
  encrypted_pw := crypt(user_password, gen_salt('bf'));
  
  -- Insert into auth.users
  -- Note: This requires permissions to insert into auth.users
  BEGIN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      user_id,
      'authenticated',
      'authenticated',
      user_email,
      encrypted_pw,
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', COALESCE(user_display_name, user_email)),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
    
    RAISE NOTICE 'Auth user created successfully: % (ID: %)', user_email, user_id;
    RETURN user_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create auth user %: %. You may need to create this user manually via Supabase Dashboard → Authentication → Users', user_email, SQLERRM;
    RETURN NULL;
  END;
END;
$$;

-- =========================
-- Create Test Auth Users
-- =========================
-- This will attempt to create 4 test users in auth.users
-- Passwords are: Test123!@# (for all users)
-- 
-- NOTE: If this fails due to permissions, create users manually:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user"
-- 3. Create each user with the emails below and password: Test123!@#
-- 4. Check "Auto Confirm User" for each

DO $$
DECLARE
  inventor_uuid uuid;
  startup_uuid uuid;
  company_uuid uuid;
  investor_uuid uuid;
  users_created int := 0;
BEGIN
  RAISE NOTICE 'Attempting to create test auth users...';
  
  -- Create auth users
  SELECT create_test_auth_user('inventor@test.com', 'Test123!@#', 'Dr. Sarah Johnson') INTO inventor_uuid;
  IF inventor_uuid IS NOT NULL THEN users_created := users_created + 1; END IF;
  
  SELECT create_test_auth_user('startup@test.com', 'Test123!@#', 'Michael Chen') INTO startup_uuid;
  IF startup_uuid IS NOT NULL THEN users_created := users_created + 1; END IF;
  
  SELECT create_test_auth_user('company@test.com', 'Test123!@#', 'Maria Rodriguez') INTO company_uuid;
  IF company_uuid IS NOT NULL THEN users_created := users_created + 1; END IF;
  
  SELECT create_test_auth_user('investor@test.com', 'Test123!@#', 'James Anderson') INTO investor_uuid;
  IF investor_uuid IS NOT NULL THEN users_created := users_created + 1; END IF;
  
  RAISE NOTICE '========================================';
  IF users_created = 4 THEN
    RAISE NOTICE '✅ All 4 auth users created successfully!';
    RAISE NOTICE '  Inventor: % (inventor@test.com)', inventor_uuid;
    RAISE NOTICE '  StartUp: % (startup@test.com)', startup_uuid;
    RAISE NOTICE '  Company: % (company@test.com)', company_uuid;
    RAISE NOTICE '  Investor: % (investor@test.com)', investor_uuid;
  ELSIF users_created > 0 THEN
    RAISE NOTICE '⚠️  Only % out of 4 users were created. Some may already exist or creation failed.', users_created;
  ELSE
    RAISE NOTICE '❌ No users were created. This may be due to permissions.';
    RAISE NOTICE 'Please create users manually via Supabase Dashboard → Authentication → Users';
  END IF;
  RAISE NOTICE '========================================';
END $$;



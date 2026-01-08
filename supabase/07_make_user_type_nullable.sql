-- =========================
-- Migration: Make user_type nullable for OAuth registration flow
-- This allows OAuth users to complete registration without selecting a role first
-- Run this in Supabase SQL Editor if you have an existing database
-- =========================

-- Make user_type nullable
ALTER TABLE public.users 
ALTER COLUMN user_type DROP NOT NULL;

-- Update the check constraint to allow NULL
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_user_type_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_user_type_check 
CHECK (user_type IS NULL OR user_type IN ('Inventor','StartUp','Company','Investor'));

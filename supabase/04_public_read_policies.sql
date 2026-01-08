-- =========================
-- Public Read Policies for Profile Pages
-- =========================
-- These policies allow anyone (including anonymous users) to read basic profile information
-- Access control for media (photos, videos) is handled in the frontend

-- Users: Allow public read access
drop policy if exists "users_select_public" on public.users;
create policy "users_select_public"
on public.users for select
using (true);

-- Profiles: Allow public read access
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
on public.profiles for select
using (true);

-- Commercial Proposals: Allow public read access
drop policy if exists "commercial_proposals_select_public" on public.commercial_proposals;
create policy "commercial_proposals_select_public"
on public.commercial_proposals for select
using (true);

-- Pitch Materials: Allow public read access (frontend will limit what's shown)
drop policy if exists "pitch_materials_select_public" on public.pitch_materials;
create policy "pitch_materials_select_public"
on public.pitch_materials for select
using (true);

-- Note: The frontend will handle access control:
-- - Visitors (not logged in): See 2-3 photos, no videos/documents
-- - Logged-in users: See all photos, videos, and documents


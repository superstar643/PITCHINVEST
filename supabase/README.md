# PITCHINVEST - Supabase Setup Guide

This directory contains SQL scripts to set up the Supabase backend for the PITCHINVEST registration system.

## Prerequisites

1. A Supabase project (create one at https://supabase.com)
2. Your Supabase project URL and anon key (add to `.env` file):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Setup Steps

### Step 1: Run Database Schema

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `01_schema.sql`
3. Click **Run** (or press `Ctrl+Enter`)
4. **Verify**: Go to **Table Editor** → You should see 4 tables:
   - `users`
   - `profiles`
   - `commercial_proposals`
   - `pitch_materials`

### Step 2: Run Storage Setup

1. In **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `02_storage.sql`
3. Click **Run** (or press `Ctrl+Enter`)
4. **Verify**: 
   - Go to **Storage** → **Buckets** → You should see 4 buckets:
     - `cover-images`
     - `user-photos`
     - `pitch-videos`
     - `pitch-photos`
   - Go to **Storage** → **Policies** → You should see 4 policies for `objects` table

### Step 3: Verify Setup

Run these verification queries in the SQL Editor:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'profiles', 'commercial_proposals', 'pitch_materials');

-- Check buckets exist
SELECT id, name, public 
FROM storage.buckets 
WHERE id IN ('cover-images','user-photos','pitch-videos','pitch-photos');

-- Check storage policies exist
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%registration_buckets%';
```

## Important Notes

### Authentication

- **Users are NOT created by SQL scripts** - they are created automatically when `supabase.auth.signUp()` is called from the frontend
- After a user registers, check: **Authentication** → **Users** to see the new user
- If email confirmation is enabled, users must verify their email before they can log in

### Email Confirmation Setting

**CRITICAL**: If email confirmation is enabled in Supabase:
- `signUp()` will NOT return a session immediately
- File uploads will fail because `auth.uid()` will be `null`
- **Solution**: Either:
  1. **Disable email confirmation** (for testing): 
     - Go to **Authentication** → **Settings** → **Email Auth** → Uncheck "Enable email confirmations"
  2. **OR** use an Edge Function with service role to handle registration (more secure, but requires additional setup)

### Storage Policies

The storage policies require:
- User must be authenticated (`auth.uid() is not null`)
- Files must be uploaded to a folder matching the user's UUID
- Example path: `{user-uuid}/filename.jpg`

## Troubleshooting

### "Nothing is added" after running SQL

1. **Check the right place**:
   - Storage buckets → **Storage** tab (NOT Authentication tab)
   - Database tables → **Table Editor** tab
   - Policies → **Storage** → **Policies** tab

2. **Check for errors**:
   - Look at the SQL Editor output for any error messages
   - Common errors:
     - "must be owner" → Already fixed in `02_storage.sql`
     - "relation does not exist" → Run `01_schema.sql` first

3. **Refresh the dashboard**:
   - Sometimes you need to refresh the browser to see new buckets/tables

4. **Run verification queries**:
   - Use the queries in Step 3 above to verify everything was created

### Registration fails with "Bucket not found"

- Make sure you ran `02_storage.sql` successfully
- Check **Storage** → **Buckets** to see if the 4 buckets exist
- If not, run `02_storage.sql` again

### Registration fails with "Table not found"

- Make sure you ran `01_schema.sql` successfully
- Check **Table Editor** to see if the 4 tables exist
- If not, run `01_schema.sql` again

### File uploads fail during registration

- Check if email confirmation is enabled (see "Email Confirmation Setting" above)
- Check browser console for specific error messages
- Verify storage policies were created (see verification queries)

## Testing Registration

After setup is complete:

1. Start your dev server: `npm run dev`
2. Navigate to `/register`
3. Fill out the registration form for any user type
4. Check:
   - **Authentication** → **Users** → New user should appear
   - **Table Editor** → `users` table → New row should appear
   - **Table Editor** → `profiles` table → New row should appear
   - **Storage** → **Buckets** → Files should appear in the buckets

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs: **Logs** → **Postgres Logs** or **API Logs**
3. Verify all SQL scripts ran without errors
4. Make sure your `.env` file has the correct Supabase credentials

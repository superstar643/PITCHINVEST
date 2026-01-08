# PITCHINVEST - Database Schema Summary

## All 11 Database Tables

### Core Registration Tables (from `01_schema.sql`)

1. **`users`**
   - User accounts and authentication
   - Fields: id, user_type, full_name, personal_email, telephone, country, city, cover_image_url, photo_url, created_at

2. **`profiles`**
   - Extended profile information
   - Fields: project_name, project_category, company info, inventor info, investor preferences
   - **Updated field comments:**
     - `initial_license_value` → Patent Exploitation Fee
     - `exploitation_license_royalty` → Patent Exploitation Royalties
     - `patent_sale` → Full Patent Assignment (100%)

3. **`commercial_proposals`**
   - Commercial proposal details
   - **Updated field comments:**
     - Block 1: Investment Offer (%) (was: Equity Participation)
       - `equity_capital_percentage` → Equity
       - `equity_total_value` → Investment Amount
     - Block 2: Brand Exploitation Rights (was: Brand Licensing (Exploitation))
       - `license_fee` → Initial Licensing Fee
       - `licensing_royalties_percentage` → Royalties (%)
     - Block 3: Franchise (was: Franchising)
       - `franchisee_investment` → Franchise Fee
       - `monthly_royalties` → Royalties (%)
     - Block 4: Patent Licensing (Inventor)

4. **`pitch_materials`**
   - Pitch videos, photos, documents
   - Fields: pitch_video_url, photos_urls, pitch_videos_urls, description, fact_sheet, technical_sheet

### Auction System (from `05_bids_schema.sql`)

5. **`bids`**
   - Auction bid records
   - Fields: id, auction_id, auction_id_new, user_id, bid_amount, created_at

### Extended System Tables (from `06_complete_system_schema.sql`)

6. **`projects`**
   - Main projects/inventions/startups listings
   - Fields: title, subtitle, description, category, status, location, investment info, media, badges, statistics

7. **`auctions`**
   - Auction listings linked to projects
   - Fields: project_id, title, description, start_bid, current_bid, status, timing, statistics

8. **`gallery_items`**
   - Gallery showcase items
   - Fields: project_id, title, artist, images, badges, actions, statistics, author info

9. **`project_engagement`**
   - Project likes, views, bookmarks
   - Fields: project_id, user_id, liked, viewed, bookmarked, timestamps

10. **`gallery_engagement`**
    - Gallery item engagement
    - Fields: gallery_item_id, user_id, liked, viewed, timestamps

11. **`investor_portfolios`**
    - Investor interest/following of projects
    - Fields: investor_id, project_id, interest_level, notes, timestamps

## Installation Order

Run these SQL files in order:

1. `01_schema.sql` - Creates tables 1-4 + RLS policies
2. `05_bids_schema.sql` - Creates table 5 (bids) + updates
3. `06_complete_system_schema.sql` - Creates tables 6-11 + RLS policies + triggers

**OR** use the consolidated file:
- `00_complete_schema.sql` - All 11 tables in one file (recommended for fresh installs)

## Additional Files

- `02_storage.sql` - Storage buckets and policies
- `03_sample_data.sql` - Sample data insertion
- `03_storage.sql` - Alternative sample data
- `04_public_read_policies.sql` - Public read access policies

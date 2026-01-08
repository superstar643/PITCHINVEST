-- PITCHINVEST - Sample Data for Testing
-- 
-- This script automatically:
--   1. Fetches existing auth users by email, OR
--   2. Creates them using create_test_auth_user() if they don't exist
--   3. Inserts sample data into all tables
--
-- No manual UUID replacement needed!

-- =========================
-- AUTOMATIC USER CREATION/FETCHING
-- =========================
DO $$
DECLARE
  inventor_id uuid;
  startup_id uuid;
  company_id uuid;
  investor_id uuid;
BEGIN
  RAISE NOTICE 'Starting sample data insertion...';
  RAISE NOTICE 'Fetching or creating auth users...';

  -- Get or create Inventor user
  SELECT id INTO inventor_id FROM auth.users WHERE email = 'inventor@test.com' LIMIT 1;
  IF inventor_id IS NULL THEN
    RAISE NOTICE 'Creating auth user: inventor@test.com';
    inventor_id := create_test_auth_user('inventor@test.com', 'Test123!@#', 'Dr. Sarah Johnson');
  ELSE
    RAISE NOTICE 'Found existing auth user: inventor@test.com (ID: %)', inventor_id;
  END IF;

  -- Get or create StartUp user
  SELECT id INTO startup_id FROM auth.users WHERE email = 'startup@test.com' LIMIT 1;
  IF startup_id IS NULL THEN
    RAISE NOTICE 'Creating auth user: startup@test.com';
    startup_id := create_test_auth_user('startup@test.com', 'Test123!@#', 'Michael Chen');
  ELSE
    RAISE NOTICE 'Found existing auth user: startup@test.com (ID: %)', startup_id;
  END IF;

  -- Get or create Company user
  SELECT id INTO company_id FROM auth.users WHERE email = 'company@test.com' LIMIT 1;
  IF company_id IS NULL THEN
    RAISE NOTICE 'Creating auth user: company@test.com';
    company_id := create_test_auth_user('company@test.com', 'Test123!@#', 'Maria Rodriguez');
  ELSE
    RAISE NOTICE 'Found existing auth user: company@test.com (ID: %)', company_id;
  END IF;

  -- Get or create Investor user
  SELECT id INTO investor_id FROM auth.users WHERE email = 'investor@test.com' LIMIT 1;
  IF investor_id IS NULL THEN
    RAISE NOTICE 'Creating auth user: investor@test.com';
    investor_id := create_test_auth_user('investor@test.com', 'Test123!@#', 'James Anderson');
  ELSE
    RAISE NOTICE 'Found existing auth user: investor@test.com (ID: %)', investor_id;
  END IF;

  RAISE NOTICE 'All auth users ready. Starting data insertion...';

  -- =========================
  -- Sample Inventor User
  -- =========================
  INSERT INTO public.users (id, user_type, full_name, personal_email, telephone, country, city, cover_image_url, photo_url)
  VALUES (
    inventor_id,
    'Inventor',
    'Dr. Sarah Johnson',
    'inventor@test.com',
    '+15551234567',
    'United States',
    'San Francisco',
    'https://via.placeholder.com/800x400?text=Cover+Image',
    'https://via.placeholder.com/200x200?text=Photo'
  ) ON CONFLICT (id) DO UPDATE SET
    user_type = EXCLUDED.user_type,
    full_name = EXCLUDED.full_name,
    personal_email = EXCLUDED.personal_email,
    telephone = EXCLUDED.telephone,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    cover_image_url = EXCLUDED.cover_image_url,
    photo_url = EXCLUDED.photo_url;

  INSERT INTO public.profiles (user_id, project_name, project_category, inventor_name, license_number, release_date, initial_license_value, exploitation_license_royalty, patent_sale, investors_count)
  VALUES (
    inventor_id,
    'AI-Powered Medical Diagnostic Device',
    'Medical Technology',
    'Dr. Sarah Johnson',
    'LIC-2024-001234',
    '2024-01-15',
    '$15,000',
    '6%',
    '$450,000',
    '5 Investors'
  ) ON CONFLICT (user_id) DO UPDATE SET
    project_name = EXCLUDED.project_name,
    project_category = EXCLUDED.project_category,
    inventor_name = EXCLUDED.inventor_name,
    license_number = EXCLUDED.license_number,
    release_date = EXCLUDED.release_date,
    initial_license_value = EXCLUDED.initial_license_value,
    exploitation_license_royalty = EXCLUDED.exploitation_license_royalty,
    patent_sale = EXCLUDED.patent_sale,
    investors_count = EXCLUDED.investors_count;

  INSERT INTO public.commercial_proposals (user_id, patent_upfront_fee, patent_royalties, equity_capital_percentage, equity_total_value, license_fee, licensing_royalties_percentage)
  VALUES (
    inventor_id,
    '$15,000',
    '6%',
    '15%',
    '$200,000',
    '$12,000',
    '5%'
  ) ON CONFLICT (user_id) DO UPDATE SET
    patent_upfront_fee = EXCLUDED.patent_upfront_fee,
    patent_royalties = EXCLUDED.patent_royalties,
    equity_capital_percentage = EXCLUDED.equity_capital_percentage,
    equity_total_value = EXCLUDED.equity_total_value,
    license_fee = EXCLUDED.license_fee,
    licensing_royalties_percentage = EXCLUDED.licensing_royalties_percentage;

  INSERT INTO public.pitch_materials (user_id, pitch_video_url, photos_urls, pitch_videos_urls, description, fact_sheet, technical_sheet)
  VALUES (
    inventor_id,
    'https://via.placeholder.com/800x600?text=Pitch+Video',
    ARRAY['https://via.placeholder.com/800x600?text=Photo+1', 'https://via.placeholder.com/800x600?text=Photo+2', 'https://via.placeholder.com/800x600?text=Photo+3'],
    ARRAY['https://via.placeholder.com/800x600?text=Video+1', 'https://via.placeholder.com/800x600?text=Video+2'],
    'Revolutionary AI-powered medical diagnostic device that can detect early-stage diseases with 95% accuracy. Our device uses advanced machine learning algorithms to analyze medical images and provide instant diagnostic results.',
    'Fact Sheet: The device has been tested on 10,000+ patients with FDA approval pending.',
    'Technical Sheet: Uses TensorFlow 2.0, processes images in under 2 seconds, compatible with standard medical imaging equipment.'
  ) ON CONFLICT (user_id) DO UPDATE SET
    pitch_video_url = EXCLUDED.pitch_video_url,
    photos_urls = EXCLUDED.photos_urls,
    pitch_videos_urls = EXCLUDED.pitch_videos_urls,
    description = EXCLUDED.description,
    fact_sheet = EXCLUDED.fact_sheet,
    technical_sheet = EXCLUDED.technical_sheet;

  RAISE NOTICE 'Inventor data inserted successfully';

  -- =========================
  -- Sample StartUp User
  -- =========================
  INSERT INTO public.users (id, user_type, full_name, personal_email, telephone, country, city, cover_image_url, photo_url)
  VALUES (
    startup_id,
    'StartUp',
    'Michael Chen',
    'startup@test.com',
    '+15559876543',
    'United States',
    'New York',
    'https://via.placeholder.com/800x400?text=StartUp+Cover',
    'https://via.placeholder.com/200x200?text=StartUp+Photo'
  ) ON CONFLICT (id) DO UPDATE SET
    user_type = EXCLUDED.user_type,
    full_name = EXCLUDED.full_name,
    personal_email = EXCLUDED.personal_email,
    telephone = EXCLUDED.telephone,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    cover_image_url = EXCLUDED.cover_image_url,
    photo_url = EXCLUDED.photo_url;

  INSERT INTO public.profiles (user_id, project_name, project_category, company_name, company_nif, company_telephone, smart_money, total_sale_of_project)
  VALUES (
    startup_id,
    'SaaS Project Management Platform',
    'SaaS',
    'TechFlow Inc',
    'NIF-2024-ST001',
    '+15559876544',
    'Looking for investors who can provide strategic guidance, industry connections, and mentorship in addition to capital. We value partners who understand the SaaS market and can help us scale.',
    '$2,500,000'
  ) ON CONFLICT (user_id) DO UPDATE SET
    project_name = EXCLUDED.project_name,
    project_category = EXCLUDED.project_category,
    company_name = EXCLUDED.company_name,
    company_nif = EXCLUDED.company_nif,
    company_telephone = EXCLUDED.company_telephone,
    smart_money = EXCLUDED.smart_money,
    total_sale_of_project = EXCLUDED.total_sale_of_project;

  INSERT INTO public.commercial_proposals (user_id, equity_capital_percentage, equity_total_value, license_fee, licensing_royalties_percentage)
  VALUES (
    startup_id,
    '20%',
    '$250,000',
    '$18,000',
    '7%'
  ) ON CONFLICT (user_id) DO UPDATE SET
    equity_capital_percentage = EXCLUDED.equity_capital_percentage,
    equity_total_value = EXCLUDED.equity_total_value,
    license_fee = EXCLUDED.license_fee,
    licensing_royalties_percentage = EXCLUDED.licensing_royalties_percentage;

  INSERT INTO public.pitch_materials (user_id, pitch_video_url, photos_urls, pitch_videos_urls, description, fact_sheet, technical_sheet)
  VALUES (
    startup_id,
    'https://via.placeholder.com/800x600?text=StartUp+Pitch',
    ARRAY['https://via.placeholder.com/800x600?text=StartUp+Photo+1', 'https://via.placeholder.com/800x600?text=StartUp+Photo+2', 'https://via.placeholder.com/800x600?text=StartUp+Photo+3', 'https://via.placeholder.com/800x600?text=StartUp+Photo+4'],
    ARRAY['https://via.placeholder.com/800x600?text=StartUp+Video+1', 'https://via.placeholder.com/800x600?text=StartUp+Video+2'],
    'TechFlow is a next-generation SaaS project management platform designed for remote teams. We combine AI-powered task automation with intuitive collaboration tools to help teams work more efficiently.',
    'Fact Sheet: Currently in beta with 500+ active users, $50K MRR, growing at 20% month-over-month.',
    'Technical Sheet: Built on React, Node.js, PostgreSQL. Scalable microservices architecture, supports 10,000+ concurrent users.'
  ) ON CONFLICT (user_id) DO UPDATE SET
    pitch_video_url = EXCLUDED.pitch_video_url,
    photos_urls = EXCLUDED.photos_urls,
    pitch_videos_urls = EXCLUDED.pitch_videos_urls,
    description = EXCLUDED.description,
    fact_sheet = EXCLUDED.fact_sheet,
    technical_sheet = EXCLUDED.technical_sheet;

  RAISE NOTICE 'StartUp data inserted successfully';

  -- =========================
  -- Sample Company User
  -- =========================
  INSERT INTO public.users (id, user_type, full_name, personal_email, telephone, country, city, cover_image_url, photo_url)
  VALUES (
    company_id,
    'Company',
    'Maria Rodriguez',
    'company@test.com',
    '+34612345678',
    'Spain',
    'Madrid',
    'https://via.placeholder.com/800x400?text=Company+Cover',
    'https://via.placeholder.com/200x200?text=Company+Photo'
  ) ON CONFLICT (id) DO UPDATE SET
    user_type = EXCLUDED.user_type,
    full_name = EXCLUDED.full_name,
    personal_email = EXCLUDED.personal_email,
    telephone = EXCLUDED.telephone,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    cover_image_url = EXCLUDED.cover_image_url,
    photo_url = EXCLUDED.photo_url;

  INSERT INTO public.profiles (user_id, project_name, project_category, company_name, company_nif, company_telephone, total_sale_of_project)
  VALUES (
    company_id,
    'Mediterranean Restaurant Chain Expansion',
    'Restaurant',
    'Sabor Mediterráneo S.L.',
    'B-12345678',
    '+34612345679',
    '$5,000,000'
  ) ON CONFLICT (user_id) DO UPDATE SET
    project_name = EXCLUDED.project_name,
    project_category = EXCLUDED.project_category,
    company_name = EXCLUDED.company_name,
    company_nif = EXCLUDED.company_nif,
    company_telephone = EXCLUDED.company_telephone,
    total_sale_of_project = EXCLUDED.total_sale_of_project;

  INSERT INTO public.commercial_proposals (user_id, equity_capital_percentage, equity_total_value, license_fee, licensing_royalties_percentage, franchisee_investment, monthly_royalties)
  VALUES (
    company_id,
    '15%',
    '$500,000',
    '$20,000',
    '6%',
    '$75,000',
    '5%'
  ) ON CONFLICT (user_id) DO UPDATE SET
    equity_capital_percentage = EXCLUDED.equity_capital_percentage,
    equity_total_value = EXCLUDED.equity_total_value,
    license_fee = EXCLUDED.license_fee,
    licensing_royalties_percentage = EXCLUDED.licensing_royalties_percentage,
    franchisee_investment = EXCLUDED.franchisee_investment,
    monthly_royalties = EXCLUDED.monthly_royalties;

  INSERT INTO public.pitch_materials (user_id, pitch_video_url, photos_urls, pitch_videos_urls, description, fact_sheet, technical_sheet)
  VALUES (
    company_id,
    'https://via.placeholder.com/800x600?text=Company+Pitch',
    ARRAY['https://via.placeholder.com/800x600?text=Restaurant+Photo+1', 'https://via.placeholder.com/800x600?text=Restaurant+Photo+2', 'https://via.placeholder.com/800x600?text=Restaurant+Photo+3', 'https://via.placeholder.com/800x600?text=Restaurant+Photo+4', 'https://via.placeholder.com/800x600?text=Restaurant+Photo+5'],
    ARRAY['https://via.placeholder.com/800x600?text=Company+Video+1', 'https://via.placeholder.com/800x600?text=Company+Video+2'],
    'Sabor Mediterráneo is a successful Mediterranean restaurant chain with 5 locations across Spain. We are looking to expand through franchising and licensing opportunities. Our proven business model, signature recipes, and comprehensive training program make us an ideal partner for entrepreneurs.',
    'Fact Sheet: Established 2018, 5 locations, €2.5M annual revenue, 4.8/5 customer rating, 15% profit margin.',
    'Technical Sheet: Standard kitchen setup: €50K, seating capacity: 80-120, staff: 8-12 per location, training program: 4 weeks.'
  ) ON CONFLICT (user_id) DO UPDATE SET
    pitch_video_url = EXCLUDED.pitch_video_url,
    photos_urls = EXCLUDED.photos_urls,
    pitch_videos_urls = EXCLUDED.pitch_videos_urls,
    description = EXCLUDED.description,
    fact_sheet = EXCLUDED.fact_sheet,
    technical_sheet = EXCLUDED.technical_sheet;

  RAISE NOTICE 'Company data inserted successfully';

  -- =========================
  -- Sample Investor User
  -- =========================
  INSERT INTO public.users (id, user_type, full_name, personal_email, telephone, country, city, cover_image_url, photo_url)
  VALUES (
    investor_id,
    'Investor',
    'James Anderson',
    'investor@test.com',
    '+441234567890',
    'United Kingdom',
    'London',
    'https://via.placeholder.com/800x400?text=Investor+Cover',
    'https://via.placeholder.com/200x200?text=Investor+Photo'
  ) ON CONFLICT (id) DO UPDATE SET
    user_type = EXCLUDED.user_type,
    full_name = EXCLUDED.full_name,
    personal_email = EXCLUDED.personal_email,
    telephone = EXCLUDED.telephone,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    cover_image_url = EXCLUDED.cover_image_url,
    photo_url = EXCLUDED.photo_url;

  INSERT INTO public.profiles (user_id, project_category, investment_preferences)
  VALUES (
    investor_id,
    'Medical Technology, SaaS, FinTech, Clean Energy',
    'I am an angel investor with 10+ years of experience in early-stage startups. I focus on B2B SaaS, healthcare technology, and fintech companies. I typically invest $50K-$500K in seed and Series A rounds. I provide strategic guidance, industry connections, and mentorship to portfolio companies. Looking for innovative solutions with strong market potential and experienced founding teams.'
  ) ON CONFLICT (user_id) DO UPDATE SET
    project_category = EXCLUDED.project_category,
    investment_preferences = EXCLUDED.investment_preferences;

  INSERT INTO public.pitch_materials (user_id, pitch_video_url, photos_urls, pitch_videos_urls, description)
  VALUES (
    investor_id,
    'https://via.placeholder.com/800x600?text=Investor+Video',
    ARRAY[]::text[],
    ARRAY[]::text[],
    'Experienced angel investor and entrepreneur. I have invested in 25+ startups, with 8 successful exits. My investment focus includes B2B SaaS, healthcare technology, and fintech. I provide not just capital, but strategic guidance, industry connections, and hands-on mentorship to help startups scale and succeed.'
  ) ON CONFLICT (user_id) DO UPDATE SET
    pitch_video_url = EXCLUDED.pitch_video_url,
    photos_urls = EXCLUDED.photos_urls,
    pitch_videos_urls = EXCLUDED.pitch_videos_urls,
    description = EXCLUDED.description;

  RAISE NOTICE 'Investor data inserted successfully';
  RAISE NOTICE '✅ All sample data inserted successfully into all 4 tables!';
END $$;

-- =========================
-- Verification Queries
-- =========================
-- Run these to verify sample data was created:

SELECT 'users' as table_name, COUNT(*) as row_count FROM public.users
UNION ALL
SELECT 'profiles', COUNT(*) FROM public.profiles
UNION ALL
SELECT 'commercial_proposals', COUNT(*) FROM public.commercial_proposals
UNION ALL
SELECT 'pitch_materials', COUNT(*) FROM public.pitch_materials;

-- View all inserted data:
SELECT u.id, u.user_type, u.full_name, u.personal_email, p.project_name
FROM public.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
ORDER BY u.user_type;


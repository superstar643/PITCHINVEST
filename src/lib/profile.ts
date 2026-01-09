import { supabase } from './supabase';

export interface ProfileData {
  user: {
    id: string;
    user_type: 'Inventor' | 'StartUp' | 'Company' | 'Investor';
    full_name: string;
    personal_email: string;
    telephone: string | null;
    country: string | null;
    city: string | null;
    cover_image_url: string | null;
    photo_url: string | null;
    created_at: string;
  } | null;
  profile: {
    id: string;
    user_id: string;
    project_name: string | null;
    project_category: string | null;
    company_name: string | null;
    company_nif: string | null;
    company_telephone: string | null;
    smart_money: string | null;
    total_sale_of_project: string | null;
    investment_preferences: string | null;
    inventor_name: string | null;
    license_number: string | null;
    release_date: string | null;
    initial_license_value: string | null;
    exploitation_license_royalty: string | null;
    patent_sale: string | null;
    investors_count: string | null;
    created_at: string;
  } | null;
  proposals: {
    id: string;
    user_id: string;
    equity_capital_percentage: string | null;
    equity_total_value: string | null;
    license_fee: string | null;
    licensing_royalties_percentage: string | null;
    franchisee_investment: string | null;
    monthly_royalties: string | null;
    patent_upfront_fee: string | null;
    patent_royalties: string | null;
    created_at: string;
  } | null;
  materials: {
    id: string;
    user_id: string;
    pitch_video_url: string | null;
    photos_urls: string[];
    pitch_videos_urls: string[];
    description: string | null;
    fact_sheet: string | null;
    technical_sheet: string | null;
    created_at: string;
  } | null;
}

export async function fetchUserProfile(userId: string): Promise<ProfileData> {
  try {
    // Use a single joined query so we can see all related data and any errors clearly
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        user_type,
        full_name,
        personal_email,
        telephone,
        country,
        city,
        cover_image_url,
        photo_url,
        created_at,
        profiles:profiles (*),
        commercial_proposals:commercial_proposals (*),
        pitch_materials:pitch_materials (*)
      `)
      .eq('id', userId)
      .maybeSingle();


    if (error) {
      throw error;
    }

    if (!data) {
      // No row found – return empty structures so UI can still render
      return {
        user: null,
        profile: null,
        proposals: null,
        materials: null,
      };
    }

    const profileRow = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
    const proposalsRow = Array.isArray(data.commercial_proposals)
      ? data.commercial_proposals[0]
      : data.commercial_proposals;
    const materialsRow = Array.isArray(data.pitch_materials)
      ? data.pitch_materials[0]
      : data.pitch_materials;

    const materials = materialsRow
      ? {
          ...materialsRow,
          photos_urls: Array.isArray(materialsRow.photos_urls) ? materialsRow.photos_urls : [],
          pitch_videos_urls: Array.isArray(materialsRow.pitch_videos_urls)
            ? materialsRow.pitch_videos_urls
            : [],
        }
      : null;

    return {
      user: {
        id: data.id,
        user_type: data.user_type,
        full_name: data.full_name,
        personal_email: data.personal_email,
        telephone: data.telephone ?? null,
        country: data.country ?? null,
        city: data.city ?? null,
        cover_image_url: data.cover_image_url ?? null,
        photo_url: data.photo_url ?? null,
        created_at: data.created_at,
      },
      profile: profileRow ?? null,
      proposals: proposalsRow ?? null,
      materials,
    };
  } catch (error) {
    console.error('Error fetching profile (joined query):', error);
    throw error;
  }
}

// Admin function to fetch user profile - uses direct query with admin session
// This function assumes RLS policies allow authenticated users to read profiles
// If RLS blocks, you'll need to create policies or use an edge function with service role
export async function fetchUserProfileAsAdmin(userId: string): Promise<ProfileData> {
  try {
    // For now, use the same function but ensure we're authenticated
    // In production, you should create RLS policies that allow admins to read all profiles
    // OR use an edge function with service role key
    
    // Try regular fetch first (will work if RLS allows)
    try {
      return await fetchUserProfile(userId);
    } catch (error: any) {
      console.error('Regular fetch failed for admin:', error);
      
      // If RLS blocks, we need to handle it
      // For now, re-throw the error so the UI can show it
      throw new Error(`Failed to fetch user profile. RLS policy may be blocking admin access. Error: ${error.message}`);
    }
  } catch (error) {
    console.error('Error fetching profile as admin:', error);
    throw error;
  }
}

// Helper to determine available investment options
export function getAvailableOptions(proposals: ProfileData['proposals'], profile: ProfileData['profile']): string[] {
  const options: string[] = [];
  
  if (!proposals) return options;
  
  if (proposals.equity_capital_percentage || proposals.equity_total_value) {
    options.push('Investment Offer (%)');
  }
  if (proposals.license_fee || proposals.licensing_royalties_percentage) {
    options.push('Brand Exploitation Rights');
  }
  if (proposals.franchisee_investment || proposals.monthly_royalties) {
    options.push('Franchise');
  }
  if (proposals.patent_upfront_fee || proposals.patent_royalties) {
    options.push('Patent Licensing');
  }
  
  // Total Sale is in profiles table
  if (profile?.total_sale_of_project) {
    options.push('Total Sale');
  }
  
  return options;
}


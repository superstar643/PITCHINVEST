import { supabase } from './supabase';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  status: string;
  available_status: boolean;
  available_label?: string;
  location?: string;
  investment_percent?: number;
  investment_amount?: string;
  commission?: number;
  cover_image_url?: string;
  image_urls?: string[];
  video_url?: string;
  video_urls?: string[];
  badges?: string[];
  views: number;
  likes: number;
  approval_rate?: number;
  featured: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
  // User information (joined)
  user?: {
    id: string;
    full_name: string;
    photo_url?: string;
    country?: string;
    city?: string;
    user_type?: string;
  };
  // Profile information (joined)
  profile?: {
    project_name?: string;
    company_name?: string;
    inventor_name?: string;
  };
}

/**
 * Fetch all projects with user information
 * @param options - Filtering and pagination options
 * @returns Array of projects with user data
 */
export const fetchProjects = async (options?: {
  status?: string[];
  category?: string;
  location?: string;
  featured?: boolean;
  verified?: boolean;
  limit?: number;
  offset?: number;
}): Promise<Project[]> => {
  try {
    // First, fetch all projects
    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (options?.status && options.status.length > 0) {
      query = query.in('status', options.status);
    }

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    if (options?.location) {
      query = query.ilike('location', `%${options.location}%`);
    }

    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured);
    }

    if (options?.verified !== undefined) {
      query = query.eq('verified', options.verified);
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
    }

    const { data: projects, error: projectsError } = await query;

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      throw projectsError;
    }

    if (!projects || projects.length === 0) {
      return [];
    }

    // Extract unique user IDs
    const userIds = [...new Set(projects.map(p => p.user_id))];

    // Fetch all users in batch
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, photo_url, country, city, user_type')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
    }

    // Fetch all profiles in batch
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, project_name, company_name, inventor_name')
      .in('user_id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Create maps for quick lookup
    const userMap = new Map((users || []).map(u => [u.id, u]));
    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    // Combine projects with user and profile data
    const projectsWithData: Project[] = projects.map(project => ({
      ...project,
      user: userMap.get(project.user_id) || undefined,
      profile: profileMap.get(project.user_id) || undefined,
    })) as Project[];

    return projectsWithData;
  } catch (error) {
    console.error('Error in fetchProjects:', error);
    return [];
  }
};

/**
 * Fetch a single project by ID with user information
 * @param projectId - Project ID
 * @returns Project with user data or null
 */
export const fetchProjectById = async (projectId: string): Promise<Project | null> => {
  try {
    // Fetch project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return null;
    }

    if (!projectData) {
      return null;
    }

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, full_name, photo_url, country, city, user_type')
      .eq('id', projectData.user_id)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
    }

    // Fetch profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('project_name, company_name, inventor_name')
      .eq('user_id', projectData.user_id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    return {
      ...projectData,
      user: userData || undefined,
      profile: profileData || undefined,
    } as Project;
  } catch (error) {
    console.error('Error in fetchProjectById:', error);
    return null;
  }
};

/**
 * Increment project views
 * Also tracks views in gallery_engagement table if gallery_item_id is provided
 * @param projectId - Project ID
 * @param galleryItemId - Optional Gallery Item ID for gallery_engagement tracking
 * @param userId - Optional User ID for per-user view tracking
 */
export const incrementProjectViews = async (
  projectId: string,
  galleryItemId?: string,
  userId?: string
): Promise<void> => {
  try {
    // Track view in gallery_engagement if gallery item ID is provided
    if (galleryItemId && userId) {
      try {
        await supabase
          .from('gallery_engagement')
          .upsert({
            gallery_item_id: galleryItemId,
            user_id: userId,
            viewed: true,
            viewed_at: new Date().toISOString(),
          }, {
            onConflict: 'gallery_item_id,user_id',
          });
      } catch (error) {
        console.error('Error tracking view in gallery_engagement:', error);
        // Continue even if gallery_engagement fails
      }
    }

    // Increment views in projects table
    const { error } = await supabase.rpc('increment_project_views', {
      project_id: projectId,
    });

    if (error) {
      console.error('Error incrementing project views:', error);
      // Fallback to manual update if RPC doesn't exist
      const { data: project } = await supabase
        .from('projects')
        .select('views')
        .eq('id', projectId)
        .single();

      if (project) {
        await supabase
          .from('projects')
          .update({ views: (project.views || 0) + 1 })
          .eq('id', projectId);
      }
    }
  } catch (error) {
    console.error('Error in incrementProjectViews:', error);
  }
};

/**
 * Toggle project like
 * Also tracks likes in gallery_engagement table if gallery_item_id is provided
 * @param projectId - Project ID
 * @param userId - User ID
 * @param galleryItemId - Optional Gallery Item ID for gallery_engagement tracking
 * @returns Updated like count
 */
export const toggleProjectLike = async (
  projectId: string,
  userId: string,
  galleryItemId?: string
): Promise<number> => {
  try {
    // Check if user already liked this project
    const { data: engagement } = await supabase
      .from('project_engagement')
      .select('liked')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    const newLikedStatus = !engagement?.liked;

    // Update or insert engagement in project_engagement
    await supabase
      .from('project_engagement')
      .upsert({
        project_id: projectId,
        user_id: userId,
        liked: newLikedStatus,
        liked_at: newLikedStatus ? new Date().toISOString() : null,
      }, {
        onConflict: 'project_id,user_id',
      });

    // Also track in gallery_engagement if gallery item ID is provided
    if (galleryItemId) {
      try {
        await supabase
          .from('gallery_engagement')
          .upsert({
            gallery_item_id: galleryItemId,
            user_id: userId,
            liked: newLikedStatus,
            liked_at: newLikedStatus ? new Date().toISOString() : null,
          }, {
            onConflict: 'gallery_item_id,user_id',
          });
      } catch (error) {
        console.error('Error tracking like in gallery_engagement:', error);
        // Continue even if gallery_engagement fails
      }
    }

    // Update project like count
    const { data: project } = await supabase
      .from('projects')
      .select('likes')
      .eq('id', projectId)
      .single();

    if (project) {
      const currentLikes = project.likes || 0;
      const newLikes = newLikedStatus ? currentLikes + 1 : Math.max(0, currentLikes - 1);

      await supabase
        .from('projects')
        .update({ likes: newLikes })
        .eq('id', projectId);

      return newLikes;
    }

    return project?.likes || 0;
  } catch (error) {
    console.error('Error in toggleProjectLike:', error);
    return 0;
  }
};

/**
 * Gallery Item interface matching the gallery_items table
 */
export interface GalleryItem {
  id: string;
  project_id?: string;
  title: string;
  artist?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  image_url: string;
  images?: string[];
  available_status?: boolean;
  available_label?: string;
  location?: string;
  badges?: string[];
  actions?: string[];
  views: number;
  likes: number;
  author_name?: string;
  author_avatar_url?: string;
  author_country?: string;
  author_verified?: boolean;
  date?: string;
  featured?: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch gallery items from gallery_items table
 * Only returns items where the matching project status is NOT 'pending'
 * (i.e., only approved/active projects are shown in the gallery)
 * @param options - Filtering and pagination options
 * @returns Array of gallery items
 */
export const fetchGalleryItems = async (options?: {
  category?: string;
  location?: string;
  featured?: boolean;
  available_status?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<GalleryItem[]> => {
  try {
    // First, fetch all approved/active projects (not pending)
    // This gives us the list of project IDs that should be visible
    const { data: approvedProjects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .neq('status', 'pending')
      .in('status', ['approved', 'active', 'completed']);

    if (projectsError) {
      console.error('Error fetching approved projects:', projectsError);
      // If we can't fetch projects, return empty array for safety
      return [];
    }

    // If no approved projects, return empty array
    if (!approvedProjects || approvedProjects.length === 0) {
      return [];
    }

    // Get list of approved project IDs
    const approvedProjectIds = approvedProjects.map(p => p.id);

    // Now fetch gallery items that match approved projects
    let query = supabase
      .from('gallery_items')
      .select('*')
      .in('project_id', approvedProjectIds)
      .order('created_at', { ascending: false });

    // Apply filters
    if (options?.category) {
      query = query.eq('category', options.category);
    }

    if (options?.location) {
      query = query.ilike('location', `%${options.location}%`);
    }

    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured);
    }

    if (options?.available_status !== undefined) {
      query = query.eq('available_status', options.available_status);
    }

    // Search filter
    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,artist.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset !== undefined && options?.limit) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    }

    const { data: galleryItems, error } = await query;

    if (error) {
      console.error('Error fetching gallery items:', error);
      throw error;
    }

    return (galleryItems || []) as GalleryItem[];
  } catch (error) {
    console.error('Error in fetchGalleryItems:', error);
    return [];
  }
};

/**
 * Fetch a single gallery item by ID
 * Only returns if the matching project status is NOT 'pending'
 * @param itemId - Gallery item ID
 * @returns Gallery item or null
 */
export const fetchGalleryItemById = async (itemId: string): Promise<GalleryItem | null> => {
  try {
    // Fetch the gallery item with its project status
    const { data: galleryItem, error } = await supabase
      .from('gallery_items')
      .select(`
        *,
        projects!gallery_items_project_id_fkey (
          id,
          status
        )
      `)
      .eq('id', itemId)
      .single();

    if (error) {
      console.error('Error fetching gallery item:', error);
      return null;
    }

    if (!galleryItem) {
      return null;
    }

    // Check if project is approved (not pending)
    const project = Array.isArray(galleryItem.projects) 
      ? galleryItem.projects[0] 
      : galleryItem.projects;

    if (!project || project.status === 'pending') {
      // Project is pending, don't show the gallery item
      return null;
    }

    return galleryItem as GalleryItem;
  } catch (error) {
    console.error('Error in fetchGalleryItemById:', error);
    return null;
  }
};

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
 * @param projectId - Project ID
 */
export const incrementProjectViews = async (projectId: string): Promise<void> => {
  try {
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
 * @param projectId - Project ID
 * @param userId - User ID
 * @returns Updated like count
 */
export const toggleProjectLike = async (
  projectId: string,
  userId: string
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

    // Update or insert engagement
    await supabase
      .from('project_engagement')
      .upsert({
        project_id: projectId,
        user_id: userId,
        liked: newLikedStatus,
      }, {
        onConflict: 'project_id,user_id',
      });

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

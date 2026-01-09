import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Eye, Search, Filter, MoveLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Project {
  id: string;
  user_id: string;
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    personal_email: string;
    user_type: string;
  };
}

const AdminProjects: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      });
      return;
    }

    if (isAdmin) {
      loadProjects();
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, statusFilter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch all projects with user information
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      if (!projectsData || projectsData.length === 0) {
        setProjects([]);
        setFilteredProjects([]);
        return;
      }

      // Fetch user information for each project
      const userIds = [...new Set(projectsData.map(p => p.user_id))];
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, personal_email, user_type')
        .in('id', userIds);

      const userMap = new Map((usersData || []).map(u => [u.id, u]));

      const projectsWithUsers: Project[] = projectsData.map(project => ({
        ...project,
        user: userMap.get(project.user_id),
      }));

      setProjects(projectsWithUsers);
      setFilteredProjects(projectsWithUsers);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredProjects(filtered);
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Project ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`,
      });

      loadProjects();
    } catch (error: any) {
      console.error('Error updating project status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Active</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (adminLoading || loading) {
    return (
      <LoadingSpinner fullScreen />
    );
  }

  if (!isAdmin) {
    return null;
  }

  const color = '#0a3d5c';

  return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back to Admin Link */}
          <div className="mb-6 border-b border-[#0a3d5c] px-4 py-2">
            <Link to="/admin" className="text-sm flex gap-2 items-center" style={{ color }}>
              <MoveLeft size={16} /> Back to Admin
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0a3d5c] mb-2">Project Management</h1>
            <p className="text-gray-600">Approve, reject, or manage project submissions</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-600 flex items-center">
                  Showing {filteredProjects.length} of {projects.length} projects
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects List */}
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No projects found</p>
                </CardContent>
              </Card>
            ) : (
              filteredProjects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          {getStatusBadge(project.status)}
                        </div>
                        {project.subtitle && (
                          <CardDescription className="text-base mt-1">{project.subtitle}</CardDescription>
                        )}
                        <div className="mt-3 space-y-1 text-sm text-gray-600">
                          {project.user && (
                            <>
                              <p><span className="font-medium">User:</span> {project.user.full_name} ({project.user.user_type})</p>
                              <p><span className="font-medium">Email:</span> {project.user.personal_email}</p>
                            </>
                          )}
                          {project.category && (
                            <p><span className="font-medium">Category:</span> {project.category}</p>
                          )}
                          <p><span className="font-medium">Created:</span> {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {project.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(project.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusChange(project.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/gallery/${project.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {project.description && (
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
  );
};

export default AdminProjects;

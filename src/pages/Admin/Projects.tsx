import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle2, XCircle, Eye, Search, Filter, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AdminLayout from '@/components/AdminLayout';

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
  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);

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

  const handleApproveClick = (project: Project) => {
    setSelectedProject(project);
    setPendingAction('approve');
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (project: Project) => {
    setSelectedProject(project);
    setPendingAction('reject');
    setRejectDialogOpen(true);
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    // Prevent multiple simultaneous updates
    if (updatingProjectId === projectId) {
      return;
    }

    try {
      setUpdatingProjectId(projectId);

      // Update project status
      const { data, error } = await supabase
        .from('projects')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Project not found');
      }

      // Show success message
      const statusMessage = newStatus === 'approved' 
        ? 'approved' 
        : newStatus === 'rejected' 
        ? 'rejected' 
        : 'updated';
      
      toast({
        title: 'Success',
        description: `Project ${statusMessage} successfully. ${newStatus === 'approved' ? 'It will now be visible in the gallery.' : ''}`,
      });

      // Close dialogs
      setApproveDialogOpen(false);
      setRejectDialogOpen(false);
      setSelectedProject(null);
      setPendingAction(null);

      // Reload projects to reflect the change
      await loadProjects();
    } catch (error: any) {
      console.error('Error updating project status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingProjectId(null);
    }
  };

  const handleConfirmAction = () => {
    if (!selectedProject || !pendingAction) return;

    const newStatus = pendingAction === 'approve' ? 'approved' : 'rejected';
    handleStatusChange(selectedProject.id, newStatus);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 text-white border-0 font-semibold px-3 py-1">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-600 text-white border-0 font-semibold px-3 py-1">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 text-white border-0 font-semibold px-3 py-1">Rejected</Badge>;
      case 'active':
        return <Badge className="bg-blue-600 text-white border-0 font-semibold px-3 py-1">Active</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white border-0 font-semibold px-3 py-1">{status}</Badge>;
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
    <AdminLayout>
      <div className="py-6 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-[#0a3d5c] mb-2">Project Management</h1>
            <p className="text-lg font-medium text-gray-700">Approve, reject, or manage project submissions</p>
          </div>

          {/* Filters */}
          <Card className="mb-6 border border-[#0a3d5c]">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border border-[#0a3d5c] focus:border-[#083146] focus:ring-1 focus:ring-[#0a3d5c] font-medium"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border border-[#0a3d5c] focus:border-[#083146] font-medium">
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
                <div className="text-base font-semibold text-[#0a3d5c] flex items-center">
                  Showing {filteredProjects.length} of {projects.length} projects
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects List */}
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <Card className="border border-[#0a3d5c]">
                <CardContent className="py-12 text-center">
                  <p className="text-lg text-gray-700">No projects found</p>
                </CardContent>
              </Card>
            ) : (
              filteredProjects.map((project) => {
                const statusColors: Record<string, string> = {
                  'pending': 'border-yellow-500 hover:border-yellow-600',
                  'approved': 'border-green-600 hover:border-green-700',
                  'rejected': 'border-red-600 hover:border-red-700',
                  'active': 'border-blue-600 hover:border-blue-700',
                };
                const borderColor = statusColors[project.status] || 'border-[#0a3d5c] hover:border-[#083146]';
                return (
                <Card key={project.id} className={`border ${borderColor}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl font-bold text-[#0a3d5c]">{project.title}</CardTitle>
                          {getStatusBadge(project.status)}
                        </div>
                        {project.subtitle && (
                          <CardDescription className="text-base mt-1 font-medium">{project.subtitle}</CardDescription>
                        )}
                        <div className="mt-3 space-y-1 text-base text-gray-700">
                          {project.user && (
                            <>
                              <p><span className="font-bold">User:</span> {project.user.full_name} ({project.user.user_type})</p>
                              <p><span className="font-bold">Email:</span> {project.user.personal_email}</p>
                            </>
                          )}
                          {project.category && (
                            <p><span className="font-bold">Category:</span> {project.category}</p>
                          )}
                          
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4 flex-shrink-0">
                        {project.status === 'pending' && (
                          <>
                            <Button
                              size="default"
                              onClick={() => handleApproveClick(project)}
                              className="bg-green-600 hover:bg-green-700 text-white font-semibold border border-green-600 hover:border-green-700"
                              disabled={updatingProjectId === project.id}
                            >
                              {updatingProjectId === project.id ? (
                                <>
                                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-5 w-5 mr-2" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="default"
                              variant="destructive"
                              onClick={() => handleRejectClick(project)}
                              className="font-semibold border border-red-600 hover:border-red-700"
                              disabled={updatingProjectId === project.id}
                            >
                              {updatingProjectId === project.id ? (
                                <>
                                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-5 w-5 mr-2" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </>
                        )}
                        {project.status === 'approved' && (
                          <Badge className="bg-green-600 text-white border-0 font-semibold px-4 py-2">
                            ✓ Approved
                          </Badge>
                        )}
                        {project.status === 'rejected' && (
                          <Badge className="bg-red-600 text-white border-0 font-semibold px-4 py-2">
                            ✗ Rejected
                          </Badge>
                        )}
                        <Button
                          size="default"
                          variant="outline"
                          onClick={() => navigate(`/gallery/${project.id}`)}
                          className="border border-[#0a3d5c] hover:border-[#083146] text-[#0a3d5c] hover:bg-[#0a3d5c] hover:text-white font-semibold"
                          disabled={updatingProjectId === project.id}
                        >
                          <Eye className="h-5 w-5 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {project.description && (
                    <CardContent>
                      <p className="text-base text-gray-700 line-clamp-2">{project.description}</p>
                    </CardContent>
                  )}
                </Card>
              );
              })
            )}
          </div>
        </div>
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-[#0a3d5c]">Approve Project</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to approve the project <span className="font-semibold text-[#0a3d5c]">"{selectedProject?.title}"</span>?
              <br /><br />
              Once approved, the project will be visible in the gallery and accessible to all platform users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updatingProjectId === selectedProject?.id} className="font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={updatingProjectId === selectedProject?.id}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {updatingProjectId === selectedProject?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve Project
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-600">Reject Project</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to reject the project <span className="font-semibold text-[#0a3d5c]">"{selectedProject?.title}"</span>?
              <br /><br />
              This action cannot be undone. The project will not be visible in the gallery and the user will need to resubmit for approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updatingProjectId === selectedProject?.id} className="font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={updatingProjectId === selectedProject?.id}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {updatingProjectId === selectedProject?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Project
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminProjects;

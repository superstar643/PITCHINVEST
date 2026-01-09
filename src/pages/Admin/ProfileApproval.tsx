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
import { CheckCircle2, XCircle, Eye, Search, Filter, Loader2, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AdminLayout from '@/components/AdminLayout';

interface UserProfile {
  id: string;
  full_name: string;
  personal_email: string;
  user_type: string;
  country: string | null;
  city: string | null;
  photo_url: string | null;
  created_at: string;
  profile_status?: string;
}

const AdminProfileApproval: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [updatingProfileId, setUpdatingProfileId] = useState<string | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'reset' | null>(null);

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
      loadProfiles();
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchTerm, statusFilter, typeFilter]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      
      // Fetch all users with profile_status
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, personal_email, user_type, country, city, photo_url, created_at, profile_status')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Map users to profiles with status (default to 'pending' if not set)
      const profilesWithStatus: UserProfile[] = (usersData || []).map(user => ({
        ...user,
        profile_status: user.profile_status || 'pending',
      }));

      setProfiles(profilesWithStatus);
      setFilteredProfiles(profilesWithStatus);
    } catch (error: any) {
      console.error('Error loading profiles:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load user profiles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = [...profiles];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.personal_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.profile_status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.user_type === typeFilter);
    }

    setFilteredProfiles(filtered);
  };

  const handleApproveClick = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setPendingAction('approve');
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setPendingAction('reject');
    setRejectDialogOpen(true);
  };

  const handleResetClick = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setPendingAction('reset');
    setResetDialogOpen(true);
  };

  const handleStatusChange = async (profileId: string, newStatus: string) => {
    if (updatingProfileId === profileId) {
      return;
    }

    try {
      setUpdatingProfileId(profileId);

      // Update profile status in users table
      console.log(newStatus)
      const { error } = await supabase
        .from('users')
        .update({ 
          profile_status: newStatus
        })
        .eq('id', profileId);

      if (error) {
        console.error('Error updating profile status:', error);
        throw error;
      }

      const statusMessage = newStatus === 'approved' 
        ? 'approved' 
        : newStatus === 'rejected' 
        ? 'rejected' 
        : newStatus === 'pending'
        ? 'reset to pending'
        : 'updated';
      
      toast({
        title: 'Success',
        description: `Profile ${statusMessage} successfully. ${newStatus === 'approved' ? 'The user now has full access to the platform.' : ''}`,
      });

      // Close dialogs
      setApproveDialogOpen(false);
      setRejectDialogOpen(false);
      setResetDialogOpen(false);
      setSelectedProfile(null);
      setPendingAction(null);

      // Reload profiles to reflect the change
      await loadProfiles();
    } catch (error: any) {
      console.error('Error updating profile status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingProfileId(null);
    }
  };

  const handleConfirmAction = () => {
    if (!selectedProfile || !pendingAction) return;

    let newStatus: string;
    if (pendingAction === 'approve') {
      newStatus = 'approved';
    } else if (pendingAction === 'reject') {
      newStatus = 'rejected';
    } else {
      newStatus = 'pending';
    }

    handleStatusChange(selectedProfile.id, newStatus);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 text-white border-0 font-semibold px-2 sm:px-3 py-1 text-xs sm:text-sm">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-600 text-white border-0 font-semibold px-2 sm:px-3 py-1 text-xs sm:text-sm">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 text-white border-0 font-semibold px-2 sm:px-3 py-1 text-xs sm:text-sm">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white border-0 font-semibold px-2 sm:px-3 py-1 text-xs sm:text-sm">{status}</Badge>;
    }
  };

  if (adminLoading || loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAdmin) {
    return null;
  }

  const pendingCount = profiles.filter(p => p.profile_status === 'pending').length;
  const approvedCount = profiles.filter(p => p.profile_status === 'approved').length;

  return (
    <AdminLayout>
      <div className="py-4 sm:py-6 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-4 sm:mb-6 px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0a3d5c] mb-2">Profile Approval</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-700">Approve or reject user profiles before they go public</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="border border-yellow-500 hover:border-yellow-600">
            <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base md:text-lg font-bold text-[#0a3d5c]">Pending Profiles</CardTitle>
                <UserX className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-[#0a3d5c]">{pendingCount}</div>
            </CardContent>
          </Card>

          <Card className="border border-green-600 hover:border-green-700">
            <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base md:text-lg font-bold text-[#0a3d5c]">Approved Profiles</CardTitle>
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-[#0a3d5c]">{approvedCount}</div>
            </CardContent>
          </Card>

          <Card className="border border-[#0a3d5c] hover:border-[#083146] sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base md:text-lg font-bold text-[#0a3d5c]">Total Profiles</CardTitle>
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-[#0a3d5c]" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-[#0a3d5c]">{profiles.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-4 sm:mb-6 border border-[#0a3d5c]">
          <CardContent className="pt-4 sm:pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  placeholder="Search profiles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border border-[#0a3d5c] focus:border-[#083146] focus:ring-1 focus:ring-[#0a3d5c] font-medium text-sm sm:text-base"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border border-[#0a3d5c] focus:border-[#083146] font-medium text-sm sm:text-base">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="border border-[#0a3d5c] focus:border-[#083146] font-medium text-sm sm:text-base">
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Inventor">Inventor</SelectItem>
                  <SelectItem value="StartUp">StartUp</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="Investor">Investor</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs sm:text-sm md:text-base font-semibold text-[#0a3d5c] flex items-center sm:col-span-2 lg:col-span-1">
                Showing {filteredProfiles.length} of {profiles.length} profiles
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profiles List */}
        <div className="space-y-4">
          {filteredProfiles.length === 0 ? (
            <Card className="border border-[#0a3d5c]">
              <CardContent className="py-12 text-center">
                <p className="text-lg text-gray-700">No profiles found</p>
              </CardContent>
            </Card>
          ) : (
            filteredProfiles.map((profile) => {
              const statusColors: Record<string, string> = {
                'pending': 'border-yellow-500 hover:border-yellow-600',
                'approved': 'border-green-600 hover:border-green-700',
                'rejected': 'border-red-600 hover:border-red-700',
              };
              const borderColor = statusColors[profile.profile_status || 'pending'] || 'border-[#0a3d5c] hover:border-[#083146]';
              return (
                <Card key={profile.id} className={`border ${borderColor}`}>
                  <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      {profile.photo_url ? (
                        <img
                          src={profile.photo_url}
                          alt={profile.full_name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-[#0a3d5c] flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0a3d5c] flex items-center justify-center text-white text-xl sm:text-2xl font-bold border border-[#0a3d5c] flex-shrink-0">
                          {profile.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <CardTitle className="text-lg sm:text-xl font-bold text-[#0a3d5c] break-words">{profile.full_name}</CardTitle>
                          {getStatusBadge(profile.profile_status || 'pending')}
                          <Badge className="bg-blue-600 text-white border-0 font-semibold px-2 sm:px-3 py-1 text-xs sm:text-sm">
                            {profile.user_type}
                          </Badge>
                        </div>
                        <div className="mt-2 sm:mt-3 space-y-1 text-sm sm:text-base text-gray-700">
                          <p className="break-words"><span className="font-bold">Email:</span> {profile.personal_email}</p>
                          {(profile.country || profile.city) && (
                            <p className="break-words">
                              <span className="font-bold">Location:</span>{' '}
                              {[profile.city, profile.country].filter(Boolean).join(', ') || 'N/A'}
                            </p>
                          )}
                          <p><span className="font-bold">Created:</span> {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:ml-4 lg:flex-shrink-0">
                      {profile.profile_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApproveClick(profile)}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold border border-green-600 hover:border-green-700 text-xs sm:text-sm px-3 sm:px-4"
                            disabled={updatingProfileId === profile.id}
                          >
                            {updatingProfileId === profile.id ? (
                              <>
                                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 animate-spin" />
                                <span className="hidden sm:inline">Processing...</span>
                                <span className="sm:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectClick(profile)}
                            className="font-semibold border border-red-600 hover:border-red-700 text-xs sm:text-sm px-3 sm:px-4"
                            disabled={updatingProfileId === profile.id}
                          >
                            {updatingProfileId === profile.id ? (
                              <>
                                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 animate-spin" />
                                <span className="hidden sm:inline">Processing...</span>
                                <span className="sm:hidden">...</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                                Reject
                              </>
                            )}
                          </Button>
                        </>
                      )}
                      {profile.profile_status === 'approved' && (
                        <>
                          <Badge className="bg-green-600 text-white border-0 font-semibold px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                            ✓ Approved
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetClick(profile)}
                            className="border border-yellow-600 hover:border-yellow-700 text-yellow-600 hover:bg-yellow-600 hover:text-white font-semibold text-xs sm:text-sm px-3 sm:px-4"
                            disabled={updatingProfileId === profile.id}
                          >
                            <span className="hidden sm:inline">Reset to Pending</span>
                            <span className="sm:hidden">Reset</span>
                          </Button>
                        </>
                      )}
                      {profile.profile_status === 'rejected' && (
                        <>
                          <Badge className="bg-red-600 text-white border-0 font-semibold px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                            ✗ Rejected
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetClick(profile)}
                            className="border border-yellow-600 hover:border-yellow-700 text-yellow-600 hover:bg-yellow-600 hover:text-white font-semibold text-xs sm:text-sm px-3 sm:px-4"
                            disabled={updatingProfileId === profile.id}
                          >
                            <span className="hidden sm:inline">Reset to Pending</span>
                            <span className="sm:hidden">Reset</span>
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/user/${profile.id}`)}
                        className="border border-[#0a3d5c] hover:border-[#083146] text-[#0a3d5c] hover:bg-[#0a3d5c] hover:text-white font-semibold text-xs sm:text-sm px-3 sm:px-4"
                        disabled={updatingProfileId === profile.id}
                      >
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                  </CardHeader>
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
            <AlertDialogTitle className="text-xl font-bold text-[#0a3d5c]">Approve Profile</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to approve the profile for <span className="font-semibold text-[#0a3d5c]">"{selectedProfile?.full_name}"</span>?
              <br /><br />
              Once approved, the user will have full access to the platform and their profile will be visible to other users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updatingProfileId === selectedProfile?.id} className="font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={updatingProfileId === selectedProfile?.id}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
              {updatingProfileId === selectedProfile?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve Profile
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
            <AlertDialogTitle className="text-xl font-bold text-red-600">Reject Profile</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to reject the profile for <span className="font-semibold text-[#0a3d5c]">"{selectedProfile?.full_name}"</span>?
              <br /><br />
              This action cannot be undone. The user will not be able to access the platform until their profile is reset to pending or approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updatingProfileId === selectedProfile?.id} className="font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={updatingProfileId === selectedProfile?.id}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {updatingProfileId === selectedProfile?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Profile
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset to Pending Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-yellow-600">Reset Profile Status</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to reset the profile status for <span className="font-semibold text-[#0a3d5c]">"{selectedProfile?.full_name}"</span> back to pending?
              <br /><br />
              The profile will need to be reviewed and approved again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updatingProfileId === selectedProfile?.id} className="font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={updatingProfileId === selectedProfile?.id}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
            >
              {updatingProfileId === selectedProfile?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Reset to Pending'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminProfileApproval;

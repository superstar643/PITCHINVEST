import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Filter, Users as UsersIcon, UserCheck, UserX, Download, Ban, MessageSquare, Activity, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AdminLayout from '@/components/AdminLayout';

const ITEMS_PER_PAGE = 10;

interface User {
  id: string;
  full_name: string;
  personal_email: string;
  user_type: string;
  country: string | null;
  city: string | null;
  photo_url: string | null;
  created_at: string;
  subscription?: {
    id: string;
    status: string;
    monthly_price: number;
    currency: string;
  };
}

const AdminUsers: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPageInput, setGoToPageInput] = useState('');
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const [showBannedUsers, setShowBannedUsers] = useState(false);
  const [showSupportRequests, setShowSupportRequests] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);
  const [supportRequests, setSupportRequests] = useState<any[]>([]);

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
      loadUsers();
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, typeFilter, subscriptionFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, subscriptionFilter]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  
  // Get current page items
  const currentUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setGoToPageInput(''); // Clear input after navigation
    }
  };

  const handleGoToPage = () => {
    const page = parseInt(goToPageInput);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setGoToPageInput('');
    }
  };

  const handleGoToPageKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };

  // Generate page numbers to display - show more pages for better navigation
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 4) {
        // Show pages 2-5, then ellipsis, then last page
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show first page, ellipsis, then last 5 pages
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Get session for admin verification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }
  
      // Use edge function to fetch all users (bypasses RLS)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase configuration');
      }
  
      const functionUrl = `${supabaseUrl}/functions/v1/admin-get-users`;
      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch users: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
  
      const usersData = data.users || [];
      const subscriptionsData = data.subscriptions || [];
  
      if (usersData.length === 0) {
        setUsers([]);
        setFilteredUsers([]);
        return;
      }
  
      // Map subscriptions to users
      const subscriptionMap = new Map(
        subscriptionsData.map((s: any) => [s.user_id, s])
      );
  
      const usersWithSubscriptions: User[] = usersData.map((user: any) => ({
        ...user,
        subscription: subscriptionMap.get(user.id),
      }));
  
      setUsers(usersWithSubscriptions);
      setFilteredUsers(usersWithSubscriptions);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.personal_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(u => u.user_type === typeFilter);
    }

    // Apply subscription filter
    if (subscriptionFilter === 'subscribed') {
      filtered = filtered.filter(u => u.subscription !== undefined);
    } else if (subscriptionFilter === 'not_subscribed') {
      filtered = filtered.filter(u => u.subscription === undefined);
    }

    setFilteredUsers(filtered);
  };

  const getUserTypeBadge = (userType: string) => {
    const colors: Record<string, string> = {
      'Inventor': 'bg-blue-600 text-white border-0 font-semibold',
      'StartUp': 'bg-purple-600 text-white border-0 font-semibold',
      'Company': 'bg-indigo-600 text-white border-0 font-semibold',
      'Investor': 'bg-green-600 text-white border-0 font-semibold',
    };
    return (
      <Badge className={colors[userType] || 'bg-gray-600 text-white border-0 font-semibold'}>
        {userType}
      </Badge>
    );
  };

  const exportEmailList = () => {
    const emails = filteredUsers.map(u => u.personal_email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-emails-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Success',
      description: 'Email list exported successfully',
    });
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'User Type', 'Country', 'City', 'Created At', 'Subscription Status'];
    const rows = filteredUsers.map(u => [
      u.full_name,
      u.personal_email,
      u.user_type,
      u.country || 'N/A',
      u.city || 'N/A',
      new Date(u.created_at).toLocaleDateString(),
      u.subscription ? 'Subscribed' : 'Not Subscribed',
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Success',
      description: 'User data exported to CSV successfully',
    });
  };

  const loadActivityLogs = async () => {
    try {
      // Fetch user registrations and payments
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, personal_email, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('id, user_id, total_amount, payment_status, created_at, users(full_name, personal_email)')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })
        .limit(50);

      const logs: any[] = [];
      
      usersData?.forEach(user => {
        logs.push({
          type: 'registration',
          user_id: user.id,
          user_name: user.full_name,
          user_email: user.personal_email,
          timestamp: user.created_at,
          description: `User ${user.full_name} registered`,
        });
      });

      invoicesData?.forEach(invoice => {
        const user = invoice.users as any;
        logs.push({
          type: 'payment',
          user_id: invoice.user_id,
          user_name: user?.full_name || 'Unknown',
          user_email: user?.personal_email || 'Unknown',
          timestamp: invoice.created_at,
          description: `Payment of $${invoice.total_amount} received from ${user?.full_name || 'Unknown'}`,
          amount: invoice.total_amount,
        });
      });

      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivityLogs(logs.slice(0, 100));
    } catch (error: any) {
      console.error('Error loading activity logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load activity logs',
        variant: 'destructive',
      });
    }
  };

  const toggleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      // Note: You'll need to add a 'banned' or 'is_banned' field to users table
      const { error } = await supabase
        .from('users')
        .update({ 
          is_banned: !isBanned,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) {
        console.warn('Ban user may require database migration:', error);
        // Fallback: use local state
        if (isBanned) {
          setBannedUsers(prev => prev.filter(id => id !== userId));
        } else {
          setBannedUsers(prev => [...prev, userId]);
        }
        toast({
          title: 'Note',
          description: 'Ban feature requires an is_banned column in users table.',
        });
        return;
      }

      if (isBanned) {
        setBannedUsers(prev => prev.filter(id => id !== userId));
        toast({
          title: 'Success',
          description: 'User unbanned successfully',
        });
      } else {
        setBannedUsers(prev => [...prev, userId]);
        toast({
          title: 'Success',
          description: 'User banned successfully',
        });
      }
    } catch (error: any) {
      console.error('Error toggling ban:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user ban status',
        variant: 'destructive',
      });
    }
  };

  const loadSupportRequests = async () => {
    try {
      // Note: You'll need to create a 'support_requests' table
      // For now, this is a placeholder
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error && error.code !== '42P01') {
        throw error;
      }

      setSupportRequests(data || []);
    } catch (error: any) {
      if (error.code !== '42P01') {
        console.error('Error loading support requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to load support requests',
          variant: 'destructive',
        });
      }
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
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-4xl font-bold text-[#0a3d5c] mb-2">User Management</h1>
                <p className="text-lg font-medium text-gray-700">View and manage all platform users</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={exportEmailList}
                  className="bg-[#0a3d5c] hover:bg-[#083146] text-white font-semibold border border-[#0a3d5c] hover:border-[#083146]"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Export Emails
                </Button>
                <Button
                  onClick={exportCSV}
                  variant="outline"
                  className="border border-[#0a3d5c] hover:border-[#083146] text-[#0a3d5c] hover:bg-[#0a3d5c] hover:text-white font-semibold"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Export CSV
                </Button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <Button
                onClick={() => {
                  setShowActivityLogs(!showActivityLogs);
                  if (!showActivityLogs) loadActivityLogs();
                }}
                variant={showActivityLogs ? 'default' : 'outline'}
                className={showActivityLogs ? 'bg-[#0a3d5c] text-white font-semibold border border-[#0a3d5c]' : 'border border-[#0a3d5c] hover:border-[#083146] text-[#0a3d5c] hover:bg-[#0a3d5c] hover:text-white font-semibold'}
              >
                <Activity className="mr-2 h-5 w-5" />
                Activity Logs
              </Button>
              <Button
                onClick={() => {
                  setShowBannedUsers(!showBannedUsers);
                }}
                variant={showBannedUsers ? 'default' : 'outline'}
                className={showBannedUsers ? 'bg-red-600 text-white font-semibold border border-red-600' : 'border border-red-600 hover:border-red-700 text-red-600 hover:bg-red-600 hover:text-white font-semibold'}
              >
                <Ban className="mr-2 h-5 w-5" />
                Banned Users
              </Button>
              <Button
                onClick={() => {
                  setShowSupportRequests(!showSupportRequests);
                  if (!showSupportRequests) loadSupportRequests();
                }}
                variant={showSupportRequests ? 'default' : 'outline'}
                className={showSupportRequests ? 'bg-blue-600 text-white font-semibold border border-blue-600' : 'border border-blue-600 hover:border-blue-700 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold'}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Support Requests
              </Button>
            </div>
          </div>

          {/* Activity Logs Section */}
          {showActivityLogs && (
            <Card className="mb-6 border border-[#0a3d5c]">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#0a3d5c]">System Activity Logs</CardTitle>
                <CardDescription className="text-base">User registrations and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activityLogs.length === 0 ? (
                    <p className="text-center text-gray-700 py-8">No activity logs found</p>
                  ) : (
                    activityLogs.map((log, index) => (
                      <div key={index} className="border border-gray-300 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-[#0a3d5c]">{log.description}</p>
                            <p className="text-sm text-gray-700 mt-1">
                              {log.user_name} ({log.user_email})
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge className={log.type === 'payment' ? 'bg-green-600 text-white font-semibold' : 'bg-blue-600 text-white font-semibold'}>
                            {log.type === 'payment' ? 'Payment' : 'Registration'}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Banned Users Section */}
          {showBannedUsers && (
            <Card className="mb-6 border border-red-600">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-red-600">Banned Users</CardTitle>
                <CardDescription className="text-base">Manage user bans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredUsers.filter(u => bannedUsers.includes(u.id) || (u as any).is_banned).length === 0 ? (
                    <p className="text-center text-gray-700 py-8">No banned users</p>
                  ) : (
                    filteredUsers.filter(u => bannedUsers.includes(u.id) || (u as any).is_banned).map(user => (
                      <div key={user.id} className="border border-red-300 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#0a3d5c]">{user.full_name}</p>
                          <p className="text-sm text-gray-700">{user.personal_email}</p>
                        </div>
                        <Button
                          onClick={() => toggleBanUser(user.id, bannedUsers.includes(user.id) || (user as any).is_banned)}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                        >
                          Unban User
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Support Requests Section */}
          {showSupportRequests && (
            <Card className="mb-6 border border-blue-600">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-600">Support Requests</CardTitle>
                <CardDescription className="text-base">Respond to user support requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {supportRequests.length === 0 ? (
                    <p className="text-center text-gray-700 py-8">
                      No support requests found. Create a 'support_requests' table in Supabase to enable this feature.
                    </p>
                  ) : (
                    supportRequests.map((request) => (
                      <div key={request.id} className="border border-blue-300 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-[#0a3d5c]">{request.subject || 'Support Request'}</p>
                          <Badge className={request.status === 'resolved' ? 'bg-green-600 text-white font-semibold' : 'bg-yellow-600 text-white font-semibold'}>
                            {request.status || 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{request.message || request.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border border-[#0a3d5c] hover:border-[#083146]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-bold text-[#0a3d5c]">Total Users</CardTitle>
                <UsersIcon className="h-6 w-6 text-[#0a3d5c]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#0a3d5c]">{filteredUsers.length}</div>
              </CardContent>
            </Card>
            <Card className="border border-green-600 hover:border-green-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-bold text-[#0a3d5c]">Subscribed</CardTitle>
                <UserCheck className="h-6 w-6 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#0a3d5c]">
                  {filteredUsers.filter(u => u.subscription).length}
                </div>
              </CardContent>
            </Card>
            <Card className="border border-gray-500 hover:border-gray-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-bold text-[#0a3d5c]">Not Subscribed</CardTitle>
                <UserX className="h-6 w-6 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#0a3d5c]">
                  {filteredUsers.filter(u => !u.subscription).length}
                </div>
              </CardContent>
            </Card>
            <Card className="border border-blue-600 hover:border-blue-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-bold text-[#0a3d5c]">Investors</CardTitle>
                <UsersIcon className="h-6 w-6 text-[#0a3d5c]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#0a3d5c]">
                  {filteredUsers.filter(u => u.user_type === 'Investor').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6 border border-[#0a3d5c]">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border border-[#0a3d5c] focus:border-[#083146] focus:ring-1 focus:ring-[#0a3d5c] font-medium"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="border border-[#0a3d5c] focus:border-[#083146] font-medium">
                    <Filter className="mr-2 h-4 w-4" />
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
                <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                  <SelectTrigger className="border border-[#0a3d5c] focus:border-[#083146] font-medium">
                    <SelectValue placeholder="Subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="subscribed">Subscribed</SelectItem>
                    <SelectItem value="not_subscribed">Not Subscribed</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-base font-semibold text-[#0a3d5c] flex items-center">
                  Showing {filteredUsers.length > 0 ? `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of ${filteredUsers.length}` : '0'} users
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <div className="space-y-4">
            {currentUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No users found</p>
                </CardContent>
              </Card>
            ) : (
              currentUsers.map((user) => {
                const isBanned = bannedUsers.includes(user.id) || (user as any).is_banned;
                return (
                  <Card key={user.id} className={`border ${isBanned ? 'border-red-600 hover:border-red-700' : 'border-[#0a3d5c] hover:border-[#083146]'}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {user.photo_url ? (
                            <img
                              src={user.photo_url}
                              alt={user.full_name}
                              className="w-20 h-20 rounded-full object-cover border border-[#0a3d5c]"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-[#0a3d5c] flex items-center justify-center text-white text-2xl font-bold border border-[#0a3d5c]">
                              {user.full_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-xl font-bold text-[#0a3d5c]">{user.full_name}</CardTitle>
                              {getUserTypeBadge(user.user_type)}
                              {user.subscription && (
                                <Badge className="bg-green-600 text-white border-0 font-semibold">
                                  Subscribed
                                </Badge>
                              )}
                              {isBanned && (
                                <Badge className="bg-red-600 text-white border-0 font-semibold">
                                  Banned
                                </Badge>
                              )}
                            </div>
                            <div className="mt-3 space-y-1 text-base text-gray-700">
                              <p><span className="font-bold">Email:</span> {user.personal_email}</p>
                              {(user.country || user.city) && (
                                <p>
                                  <span className="font-bold">Location:</span>{' '}
                                  {[user.city, user.country].filter(Boolean).join(', ') || 'N/A'}
                                </p>
                              )}
                              {user.subscription && (
                                <p>
                                  <span className="font-bold">Subscription:</span>{' '}
                                  {user.subscription.currency} {user.subscription.monthly_price.toFixed(2)}/month
                                </p>
                              )}
                              <p>
                                <span className="font-bold">Joined:</span>{' '}
                                {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4 flex-col">
                          <Button
                            size="default"
                            variant="outline"
                            onClick={() => navigate(`/user/${user.id}`)}
                            className="border border-[#0a3d5c] hover:border-[#083146] text-[#0a3d5c] hover:bg-[#0a3d5c] hover:text-white font-semibold"
                          >
                            <Eye className="h-5 w-5 mr-2" />
                            View Profile
                          </Button>
                          <Button
                            size="default"
                            variant="outline"
                            onClick={() => toggleBanUser(user.id, isBanned)}
                            className={isBanned ? 'border border-green-600 hover:border-green-700 text-green-600 hover:bg-green-600 hover:text-white font-semibold' : 'border border-red-600 hover:border-red-700 text-red-600 hover:bg-red-600 hover:text-white font-semibold'}
                          >
                            <Ban className="h-5 w-5 mr-2" />
                            {isBanned ? 'Unban' : 'Ban'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {/* First & Previous Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className={`px-4 py-2 rounded-full border font-semibold text-sm transition-all duration-200 ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-[#0a3d5c] hover:border-[#083146] text-[#0a3d5c] hover:bg-[#0a3d5c]/10'
                    }`}
                  >
                    First
                  </Button>
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className={`px-4 py-2 rounded-full border font-semibold text-sm transition-all duration-200 ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-[#0a3d5c] hover:border-[#083146] text-[#0a3d5c] hover:bg-[#0a3d5c]/10'
                    }`}
                  >
                    Previous
                  </Button>
                </div>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {getPageNumbers().map((page, index) => (
                    <Button
                      key={`${page}-${index}`}
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={page === '...'}
                      variant={page === currentPage ? 'default' : 'ghost'}
                      size="sm"
                      className={`min-w-10 h-10 rounded-full font-semibold text-sm transition-all duration-200 ${
                        page === currentPage
                          ? 'bg-[#0a3d5c] text-white shadow-md hover:bg-[#0a3d5c]/90'
                          : page === '...'
                          ? 'text-gray-400 cursor-default hover:bg-transparent'
                          : 'bg-gray-100 text-gray-600 hover:bg-[#0a3d5c]/20 hover:text-[#0a3d5c]'
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                {/* Next & Last Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className={`px-4 py-2 rounded-full border font-semibold text-sm transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-[#0a3d5c] hover:border-[#083146] text-[#0a3d5c] hover:bg-[#0a3d5c]/10'
                    }`}
                  >
                    Next
                  </Button>
                  <Button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className={`px-4 py-2 rounded-full border font-semibold text-sm transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-[#0a3d5c] hover:border-[#083146] text-[#0a3d5c] hover:bg-[#0a3d5c]/10'
                    }`}
                  >
                    Last
                  </Button>
                </div>
              </div>

              {/* Go to Page Input */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-600">Go to page:</span>
                  <Input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={goToPageInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= totalPages)) {
                        setGoToPageInput(value);
                      }
                    }}
                    onKeyPress={handleGoToPageKeyPress}
                    placeholder={`1-${totalPages}`}
                    className="w-20 h-9 text-center"
                  />
                  <Button
                    onClick={handleGoToPage}
                    disabled={!goToPageInput || parseInt(goToPageInput) < 1 || parseInt(goToPageInput) > totalPages}
                    size="sm"
                    className="px-4 py-2 bg-[#0a3d5c] text-white hover:bg-[#0a3d5c]/90"
                  >
                    Go
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Page info */}
          {filteredUsers.length > 0 && (
            <div className="text-center mt-4 text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Filter, Users as UsersIcon, UserCheck, UserX, MoveLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
      'Inventor': 'bg-blue-100 text-blue-800 border-blue-300',
      'StartUp': 'bg-purple-100 text-purple-800 border-purple-300',
      'Company': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'Investor': 'bg-green-100 text-green-800 border-green-300',
    };
    return (
      <Badge className={colors[userType] || 'bg-gray-100 text-gray-800 border-gray-300'}>
        {userType}
      </Badge>
    );
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
            <h1 className="text-3xl font-bold text-[#0a3d5c] mb-2">User Management</h1>
            <p className="text-gray-600">View and manage all platform users</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredUsers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscribed</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredUsers.filter(u => u.subscription).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Not Subscribed</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredUsers.filter(u => !u.subscription).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investors</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredUsers.filter(u => u.user_type === 'Investor').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="subscribed">Subscribed</SelectItem>
                    <SelectItem value="not_subscribed">Not Subscribed</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-600 flex items-center">
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
              currentUsers.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {user.photo_url ? (
                          <img
                            src={user.photo_url}
                            alt={user.full_name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-[#0a3d5c] flex items-center justify-center text-white text-lg font-semibold">
                            {user.full_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">{user.full_name}</CardTitle>
                            {getUserTypeBadge(user.user_type)}
                            {user.subscription && (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                Subscribed
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Email:</span> {user.personal_email}</p>
                            {(user.country || user.city) && (
                              <p>
                                <span className="font-medium">Location:</span>{' '}
                                {[user.city, user.country].filter(Boolean).join(', ') || 'N/A'}
                              </p>
                            )}
                            {user.subscription && (
                              <p>
                                <span className="font-medium">Subscription:</span>{' '}
                                {user.subscription.currency} {user.subscription.monthly_price.toFixed(2)}/month
                              </p>
                            )}
                            <p>
                              <span className="font-medium">Joined:</span>{' '}
                              {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/user/${user.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
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
                    className={`px-4 py-2 rounded-full border-2 font-semibold text-sm transition-all duration-200 ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-[#0a3d5c] text-[#0a3d5c] hover:bg-[#0a3d5c]/10'
                    }`}
                  >
                    First
                  </Button>
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className={`px-4 py-2 rounded-full border-2 font-semibold text-sm transition-all duration-200 ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-[#0a3d5c] text-[#0a3d5c] hover:bg-[#0a3d5c]/10'
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
                    className={`px-4 py-2 rounded-full border-2 font-semibold text-sm transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-[#0a3d5c] text-[#0a3d5c] hover:bg-[#0a3d5c]/10'
                    }`}
                  >
                    Next
                  </Button>
                  <Button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className={`px-4 py-2 rounded-full border-2 font-semibold text-sm transition-all duration-200 ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-[#0a3d5c] text-[#0a3d5c] hover:bg-[#0a3d5c]/10'
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
  );
};

export default AdminUsers;

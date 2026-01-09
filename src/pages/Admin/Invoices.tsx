import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Eye, DollarSign, Filter, MoveLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Invoice {
  id: string;
  subscription_id: string | null;
  user_id: string;
  invoice_type: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_status: string;
  billing_period_start: string | null;
  billing_period_end: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  user?: {
    full_name: string;
    personal_email: string;
  };
  subscription?: {
    id: string;
    status: string;
  };
}

const AdminInvoices: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

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
      loadInvoices();
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, statusFilter, typeFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      // Fetch all invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      if (!invoicesData || invoicesData.length === 0) {
        setInvoices([]);
        setFilteredInvoices([]);
        return;
      }

      // Fetch user information
      const userIds = [...new Set(invoicesData.map(i => i.user_id))];
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, personal_email')
        .in('id', userIds);

      const userMap = new Map((usersData || []).map(u => [u.id, u]));

      // Fetch subscription information
      const subscriptionIds = invoicesData
        .map(i => i.subscription_id)
        .filter((id): id is string => id !== null);
      
      let subscriptionMap = new Map();
      if (subscriptionIds.length > 0) {
        const { data: subscriptionsData } = await supabase
          .from('subscriptions')
          .select('id, status')
          .in('id', subscriptionIds);
        
        subscriptionMap = new Map((subscriptionsData || []).map(s => [s.id, s]));
      }

      const invoicesWithData: Invoice[] = invoicesData.map(invoice => ({
        ...invoice,
        user: userMap.get(invoice.user_id),
        subscription: invoice.subscription_id ? subscriptionMap.get(invoice.subscription_id) : undefined,
      }));

      setInvoices(invoicesWithData);
      setFilteredInvoices(invoicesWithData);
    } catch (error: any) {
      console.error('Error loading invoices:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load invoices',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(i => 
        i.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.user?.personal_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.payment_status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(i => i.invoice_type === typeFilter);
    }

    setFilteredInvoices(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const calculateTotalRevenue = () => {
    return filteredInvoices
      .filter(i => i.payment_status === 'paid')
      .reduce((sum, inv) => sum + (parseFloat(inv.total_amount.toString()) || 0), 0);
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
            <h1 className="text-3xl font-bold text-[#0a3d5c] mb-2">Invoice Management</h1>
            <p className="text-gray-600">View and manage all platform invoices</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredInvoices.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${calculateTotalRevenue().toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredInvoices.filter(i => i.payment_status === 'paid').length}
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
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Invoice Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="advertising">Advertising</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-600 flex items-center">
                  Showing {filteredInvoices.length} invoices
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices List */}
          <div className="space-y-4">
            {filteredInvoices.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No invoices found</p>
                </CardContent>
              </Card>
            ) : (
              filteredInvoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">Invoice #{invoice.id.slice(0, 8)}</CardTitle>
                          {getStatusBadge(invoice.payment_status)}
                        </div>
                        <div className="mt-3 space-y-1 text-sm text-gray-600">
                          {invoice.user && (
                            <>
                              <p><span className="font-medium">User:</span> {invoice.user.full_name}</p>
                              <p><span className="font-medium">Email:</span> {invoice.user.personal_email}</p>
                            </>
                          )}
                          <p><span className="font-medium">Type:</span> {invoice.invoice_type}</p>
                          <p><span className="font-medium">Amount:</span> {invoice.currency} {parseFloat(invoice.total_amount.toString()).toFixed(2)}</p>
                          {invoice.paid_at && (
                            <p><span className="font-medium">Paid:</span> {formatDistanceToNow(new Date(invoice.paid_at), { addSuffix: true })}</p>
                          )}
                          <p><span className="font-medium">Created:</span> {formatDistanceToNow(new Date(invoice.created_at), { addSuffix: true })}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
  );
};

export default AdminInvoices;

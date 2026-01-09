import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileCheck, DollarSign, CreditCard, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const AdminDashboard: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingProjects: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    approvedProjects: 0,
  });

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
      loadStats();
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Fetch total users
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch pending projects
      const { count: pendingCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch approved projects
      const { count: approvedCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .in('status', ['approved', 'active']);

      // Fetch total invoices
      const { count: invoicesCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true });

      // Fetch total revenue (sum of paid invoices)
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, payment_status')
        .eq('payment_status', 'paid');

      const revenue = invoices?.reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0) || 0;

      // Fetch active subscriptions
      const { count: subscriptionsCount } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        totalUsers: usersCount || 0,
        pendingProjects: pendingCount || 0,
        totalInvoices: invoicesCount || 0,
        totalRevenue: revenue,
        activeSubscriptions: subscriptionsCount || 0,
        approvedProjects: approvedCount || 0,
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/admin/users',
    },
    {
      title: 'Pending Projects',
      value: stats.pendingProjects,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      link: '/admin/projects',
    },
    {
      title: 'Approved Projects',
      value: stats.approvedProjects,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/admin/projects',
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/admin/users',
    },
    {
      title: 'Total Invoices',
      value: stats.totalInvoices,
      icon: FileCheck,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      link: '/admin/invoices',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/admin/invoices',
    },
  ];

  const quickActions = [
    { title: 'Manage Projects', description: 'Approve or reject pending projects', link: '/admin/projects', icon: FileCheck },
    { title: 'Manage Users', description: 'View and manage all users', link: '/admin/users', icon: Users },
    { title: 'View Invoices', description: 'View all invoices and payments', link: '/admin/invoices', icon: CreditCard },
    { title: 'Manage Pricing', description: 'Set subscription and advertising prices', link: '/admin/pricing', icon: DollarSign },
  ];

  return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0a3d5c] mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your platform and monitor activity</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Link key={index} to={stat.link}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                      <div className={`${stat.bgColor} p-2 rounded-lg`}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-[#0a3d5c]">{stat.value}</div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#0a3d5c] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={index} to={action.link}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-[#0a3d5c]/10 p-2 rounded-lg">
                            <Icon className="h-5 w-5 text-[#0a3d5c]" />
                          </div>
                          <CardTitle className="text-lg">{action.title}</CardTitle>
                        </div>
                        <CardDescription>{action.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Section */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform activity and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Recent activity will be displayed here</p>
                <p className="text-sm mt-2">This feature can be expanded with real-time updates</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default AdminDashboard;

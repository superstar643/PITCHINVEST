import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Globe, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format, subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';
import AdminLayout from '@/components/AdminLayout';

const COLORS = ['#0a3d5c', '#1e5a7a', '#2d6f8f', '#3c84a4', '#4b99b9'];

const AdminAnalytics: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [geographicalData, setGeographicalData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    growthPercentage: 0,
    totalRevenue: 0,
    revenueGrowth: 0,
    topCountry: '',
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
      loadAnalytics();
    }
  }, [isAdmin, adminLoading, navigate, toast, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'week':
          startDate = subWeeks(now, 1);
          break;
        case 'month':
          startDate = subMonths(now, 1);
          break;
        case 'year':
          startDate = subYears(now, 1);
          break;
        default:
          startDate = subMonths(now, 1);
      }

      // Fetch users data
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, created_at, country')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (usersError) throw usersError;

      // Fetch previous period for comparison
      let previousStartDate: Date;
      switch (timeRange) {
        case 'week':
          previousStartDate = subWeeks(startDate, 1);
          break;
        case 'month':
          previousStartDate = subMonths(startDate, 1);
          break;
        case 'year':
          previousStartDate = subYears(startDate, 1);
          break;
        default:
          previousStartDate = subMonths(startDate, 1);
      }

      const { data: previousUsersData } = await supabase
        .from('users')
        .select('id')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString());

      // Fetch revenue data
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('total_amount, created_at, payment_status')
        .gte('created_at', startDate.toISOString())
        .eq('payment_status', 'paid');

      const { data: previousInvoicesData } = await supabase
        .from('invoices')
        .select('total_amount')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', startDate.toISOString())
        .eq('payment_status', 'paid');

      // Process user growth data by time period
      const processedUserData = processTimeSeriesData(usersData || [], startDate, now, timeRange);
      setUserGrowthData(processedUserData);

      // Process geographical data
      const geoData = processGeographicalData(usersData || []);
      setGeographicalData(geoData);

      // Process revenue data
      const processedRevenueData = processTimeSeriesData(
        invoicesData?.map(inv => ({ created_at: inv.created_at, amount: parseFloat(inv.total_amount) })) || [],
        startDate,
        now,
        timeRange,
        'amount'
      );
      setRevenueData(processedRevenueData);

      // Calculate summary stats
      const currentUsers = usersData?.length || 0;
      const previousUsers = previousUsersData?.length || 0;
      const growthPercentage = previousUsers > 0 
        ? ((currentUsers - previousUsers) / previousUsers) * 100 
        : currentUsers > 0 ? 100 : 0;

      const currentRevenue = invoicesData?.reduce((sum, inv) => sum + parseFloat(inv.total_amount || '0'), 0) || 0;
      const previousRevenue = previousInvoicesData?.reduce((sum, inv) => sum + parseFloat(inv.total_amount || '0'), 0) || 0;
      const revenueGrowth = previousRevenue > 0 
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
        : currentRevenue > 0 ? 100 : 0;

      const topCountryEntry = geoData.length > 0 ? geoData[0] : null;

      setSummaryStats({
        totalUsers: currentUsers,
        newUsers: currentUsers,
        growthPercentage,
        totalRevenue: currentRevenue,
        revenueGrowth,
        topCountry: topCountryEntry?.country || 'N/A',
      });
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const processTimeSeriesData = (data: any[], startDate: Date, endDate: Date, range: string, valueKey: string = 'count') => {
    const intervals: any[] = [];
    let current = new Date(startDate);
    
    while (current <= endDate) {
      let next: Date;
      let label: string;
      
      if (range === 'week') {
        next = new Date(current);
        next.setDate(next.getDate() + 1);
        label = format(current, 'MMM dd');
      } else if (range === 'month') {
        next = new Date(current);
        next.setDate(next.getDate() + 1);
        label = format(current, 'MMM dd');
      } else {
        next = new Date(current);
        next.setMonth(next.getMonth() + 1);
        label = format(current, 'MMM yyyy');
      }
      
      const count = data.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= current && itemDate < next;
      }).length;
      
      const value = valueKey === 'amount' 
        ? data.filter(item => {
            const itemDate = new Date(item.created_at);
            return itemDate >= current && itemDate < next;
          }).reduce((sum, item) => sum + (item.amount || 0), 0)
        : count;
      
      intervals.push({
        date: label,
        [valueKey === 'amount' ? 'revenue' : 'users']: value,
      });
      
      current = next;
    }
    
    return intervals;
  };

  const processGeographicalData = (users: any[]) => {
    const countryMap = new Map<string, number>();
    
    users.forEach(user => {
      const country = user.country || 'Unknown';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });
    
    return Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, users: count }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 10);
  };

  if (adminLoading || loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="py-6 px-4">
        <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-4xl font-bold text-[#0a3d5c] mb-2">Analytics Dashboard</h1>
              <p className="text-lg text-gray-700">Track user growth and performance metrics</p>
            </div>
            <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'year') => setTimeRange(value)}>
              <SelectTrigger className="w-40 border border-[#0a3d5c] focus:border-[#083146] font-semibold">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border border-blue-600 hover:border-blue-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-[#0a3d5c">New Users</CardTitle>
                <Users className="h-6 w-6 text-[#0a3d5c]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#0a3d5c] mb-2">{summaryStats.newUsers}</div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className={`font-semibold ${summaryStats.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summaryStats.growthPercentage >= 0 ? '+' : ''}{summaryStats.growthPercentage.toFixed(1)}%
                </span>
                <span className="text-gray-700">vs previous period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-green-600 hover:border-green-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-[#0a3d5c">Revenue</CardTitle>
                <DollarSign className="h-6 w-6 text-[#0a3d5c]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#0a3d5c] mb-2">${summaryStats.totalRevenue.toFixed(2)}</div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className={`font-semibold ${summaryStats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summaryStats.revenueGrowth >= 0 ? '+' : ''}{summaryStats.revenueGrowth.toFixed(1)}%
                </span>
                <span className="text-gray-700">vs previous period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#0a3d5c] hover:border-[#083146]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-[#0a3d5c">Top Country</CardTitle>
                <Globe className="h-6 w-6 text-[#0a3d5c]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#0a3d5c] mb-2">{summaryStats.topCountry}</div>
              <div className="text-sm text-gray-700">
                {geographicalData.length > 0 ? `${geographicalData[0].users} users` : 'No data'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Growth Chart */}
          <Card className="border border-[#0a3d5c]">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#0a3d5c">User Registration Growth</CardTitle>
              <CardDescription className="text-base">New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#0a3d5c" strokeWidth={3} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card className="border border-[#0a3d5c]">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#0a3d5c">Revenue Growth</CardTitle>
              <CardDescription className="text-base">Revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0a3d5c" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Geographical Performance */}
        <Card className="border border-[#0a3d5c]">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#0a3d5c">Geographical Performance</CardTitle>
            <CardDescription className="text-base">User registrations by country</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={geographicalData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="country" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" fill="#0a3d5c" name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={geographicalData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ country, percent }) => `${country}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="users"
                    >
                      {geographicalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;

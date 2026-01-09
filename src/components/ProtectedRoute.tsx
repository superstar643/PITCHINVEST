import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMembership } from '@/hooks/useMembership';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard, UserCheck, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AppLayout from '@/components/AppLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { hasActiveSubscription, isApproved, profileStatus, canAccess, loading: membershipLoading } = useMembership();

  // Show loading while checking auth and membership
  if (authLoading || membershipLoading) {
    return (
      <AppLayout>
        <LoadingSpinner fullScreen />
      </AppLayout>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    useEffect(() => {
      navigate('/login');
    }, [navigate]);
    return null;
  }

  // If user can access (admin or approved member), show content
  if (canAccess) {
    return <>{children}</>;
  }

  // User is authenticated but doesn't have access
  // Show appropriate message based on status
  const getStatusMessage = () => {
    if (!hasActiveSubscription) {
      return {
        title: 'Subscription Required',
        description: 'You need an active subscription to access this platform. Please complete your subscription to continue.',
        action: 'Complete Subscription',
        actionPath: '/subscription?mandatory=true',
        icon: CreditCard,
      };
    }

    if (profileStatus === 'pending') {
      return {
        title: 'Account Pending Approval',
        description: 'Your account is pending admin approval. Once approved, you will have full access to the platform. Please check back soon.',
        action: 'Check Subscription Status',
        actionPath: '/subscription',
        icon: UserCheck,
      };
    }

    if (profileStatus === 'rejected') {
      return {
        title: 'Account Not Approved',
        description: 'Your account has been rejected. Please contact support for more information.',
        action: 'Contact Support',
        actionPath: '/contact',
        icon: AlertCircle,
      };
    }

    return {
      title: 'Access Restricted',
      description: 'You do not have access to this platform. Please ensure you have an active subscription and your account is approved.',
      action: 'Go to Subscription',
      actionPath: '/subscription',
      icon: AlertCircle,
    };
  };

  const statusInfo = getStatusMessage();
  const Icon = statusInfo.icon;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="p-12 max-w-md w-full text-center">
          <div className="h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon className="h-10 w-10 text-yellow-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-[#0a3d5c] mb-3">
            {statusInfo.title}
          </h1>
          
          <p className="text-gray-600 mb-8">
            {statusInfo.description}
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => navigate(statusInfo.actionPath)}
              className="w-full bg-[#0a3d5c] hover:bg-[#0a3d5c]/90"
            >
              {statusInfo.action}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Return Home
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
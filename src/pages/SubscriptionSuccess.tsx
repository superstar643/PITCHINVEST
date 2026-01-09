import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getUserSubscription, verifyCheckoutSession } from '@/lib/stripe';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        setLoading(true);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
          setError('No session ID found. Please contact support if you completed the payment.');
          setLoading(false);
          return;
        }

        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }

        // Verify checkout session and create subscription if needed
        const { subscription: verifiedSub, error: verifyError } = await verifyCheckoutSession(sessionId);

        if (verifyError) {
          console.error('Error verifying checkout session:', verifyError);
          // Try to get existing subscription anyway
          const { subscription: existingSub } = await getUserSubscription(session.user.id);
          if (existingSub) {
            setSubscription(existingSub);
          } else {
            setError('Failed to verify subscription. Please contact support if payment was completed.');
          }
        } else if (verifiedSub) {
          setSubscription(verifiedSub);
        } else {
          // Fallback: try to get subscription directly
          const { subscription: sub } = await getUserSubscription(session.user.id);
          if (sub) {
            setSubscription(sub);
          } else {
            setError('Subscription not found. Please contact support if payment was completed.');
          }
        }

        toast({
          title: 'Payment Successful!',
          description: 'Your subscription has been activated successfully.',
        });
      } catch (error: any) {
        console.error('Error verifying subscription:', error);
        setError(error.message || 'Failed to verify subscription. Please check your account status.');
        toast({
          title: 'Verification Error',
          description: 'We received your payment, but there was an issue verifying your subscription. Our team will process it shortly.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    verifySubscription();
  }, [searchParams, navigate, toast]);

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
          <Card className="p-12 max-w-md w-full text-center">
            <LoadingSpinner message="Processing Your Payment..." />
            <p className="text-gray-600 mt-4">
              Please wait while we verify your subscription...
            </p>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (error && !subscription) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
          <Card className="p-12 max-w-md w-full text-center">
            <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0a3d5c] mb-2">Payment Received</h2>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/settings?tab=subscription')}
                className="w-full bg-[#0a3d5c] hover:bg-[#0a3d5c]/90"
              >
                Check Subscription Status
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="p-12 max-w-md w-full text-center">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-[#0a3d5c] mb-3">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-2">
            Thank you for your subscription.
          </p>
          
          <p className="text-gray-600 mb-8">
            Your account has been activated and you now have full access to all platform features.
          </p>

          {subscription && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-[#0a3d5c] mb-4">Subscription Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">{subscription.pricing_plan?.plan_name || 'Monthly Subscription'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    {subscription.currency === 'USD' ? '$' : subscription.currency} {subscription.monthly_price.toFixed(2)}/month
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600 capitalize">{subscription.status}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-[#0a3d5c] hover:bg-[#0a3d5c]/90"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/settings?tab=subscription')}
              className="w-full"
            >
              View Subscription Details
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            A confirmation email with invoice details has been sent to your email address.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SubscriptionSuccess;

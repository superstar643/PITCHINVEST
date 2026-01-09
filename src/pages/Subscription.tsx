import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, CheckCircle2, XCircle, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getUserPricingPlan, createCheckoutSession, getUserSubscription, getStripe } from '@/lib/stripe';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PricingPlan {
  id: string;
  plan_name: string;
  monthly_price: number;
  currency: string;
  description?: string;
}

function CheckoutForm({ pricingPlan, onSuccess, onCancel }: { 
  pricingPlan: PricingPlan; 
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      // Create checkout session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Create checkout session
      const { sessionId, url, error: sessionError } = await createCheckoutSession(
        pricingPlan.id,
        session.user.id,
        `${window.location.origin}/subscription/success`,
        `${window.location.origin}/subscription`
      );

      if (sessionError || !sessionId) {
        console.error('Checkout session creation error:', { sessionError, sessionId, url });
        throw sessionError || new Error('Failed to create checkout session');
      }

      if (sessionId === 'free_subscription') {
        // Free subscription created
        onSuccess();
        return;
      }

      // Redirect to Stripe Checkout using the URL directly
      if (url) {
        window.location.href = url;
      } else {
        console.error('Checkout URL missing:', { sessionId, url, sessionError });
        throw new Error('Checkout URL not available. Session ID: ' + sessionId);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  // For free subscriptions, handle separately
  const handleFreeSubscription = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { sessionId, url, error: sessionError } = await createCheckoutSession(
        pricingPlan.id,
        session.user.id,
        `${window.location.origin}/subscription/success`,
        `${window.location.origin}/subscription`
      );

      if (sessionError || !sessionId) {
        throw sessionError || new Error('Failed to create subscription');
      }

      if (sessionId === 'free_subscription') {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Free subscription error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to activate subscription',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          You will be redirected to Stripe's secure checkout page to complete your subscription.
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubscribe}
          disabled={loading}
          className="flex-1 bg-[#0a3d5c] hover:bg-[#0a3d5c]/90"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Subscribe
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pricingPlan, setPricingPlan] = useState<PricingPlan | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [subscription, setSubscription] = useState<any | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }

        // Get user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_type, country')
          .eq('id', session.user.id)
          .single();

        if (userError || !userData) {
          throw new Error('Failed to load user data');
        }

        setUserType(userData.user_type);
        setCountry(userData.country);

        // Check if user already has active subscription
        const { subscription: activeSub, error: subError } = await getUserSubscription(session.user.id);
        if (activeSub) {
          setSubscription(activeSub);
          setLoading(false);
          return;
        }

        // Get pricing plan
        const { pricingPlan: plan, error: planError } = await getUserPricingPlan(
          userData.user_type || '',
          userData.country
        );

        if (planError || !plan) {
          throw planError || new Error('Pricing plan not found');
        }

        // ✅ FIX: Ensure monthly_price is a valid number
        const monthlyPrice = typeof plan.monthly_price === 'string' 
          ? parseFloat(plan.monthly_price) 
          : (plan.monthly_price ?? 0);
        
        // ✅ FIX: Validate monthly_price is a number
        if (isNaN(monthlyPrice) || monthlyPrice < 0) {
          console.error('Invalid monthly_price:', plan.monthly_price);
          throw new Error('Invalid pricing plan: monthly price is not a valid number');
        }

        // ✅ FIX: Set pricing plan with validated number
        setPricingPlan({
          ...plan,
          monthly_price: monthlyPrice
        });

        // Initialize Stripe
        const stripe = await getStripe();
        if (stripe) {
          setStripePromise(Promise.resolve(stripe));
        }
      } catch (error: any) {
        console.error('Error loading subscription data:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load subscription information.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, toast]);

  const handleSuccess = async () => {
    toast({
      title: 'Success!',
      description: 'Your subscription has been activated successfully.',
    });
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingSpinner fullScreen />
      </AppLayout>
    );
  }

  // If user already has active subscription, show subscription details
  if (subscription) {
    const periodEnd = new Date(subscription.current_period_end);
    const isExpiringSoon = periodEnd.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days

    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <h1 className="text-3xl font-bold text-[#0a3d5c]">Active Subscription</h1>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Plan</p>
                    <p className="font-semibold">{subscription.pricing_plan?.plan_name || 'Monthly Subscription'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-semibold">
                      {subscription.currency === 'USD' ? '$' : subscription.currency} {subscription.monthly_price.toFixed(2)}/month
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Renews on</p>
                      <p className={`font-semibold ${isExpiringSoon ? 'text-orange-500' : ''}`}>
                        {periodEnd.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold text-green-500 capitalize">{subscription.status}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/settings')}
                  className="flex-1"
                >
                  Manage Subscription
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show subscription purchase form
  if (!pricingPlan) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-8 max-w-md">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-center mb-4">Subscription Not Available</h2>
            <p className="text-gray-600 text-center mb-6">
              Unable to find a subscription plan for your account type. Please contact support.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Return Home
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }
  // ✅ FIX: Ensure monthly_price is a valid number before rendering
  const monthlyPrice = typeof pricingPlan.monthly_price === 'number' 
    ? pricingPlan.monthly_price 
    : (typeof pricingPlan.monthly_price === 'string' 
      ? parseFloat(pricingPlan.monthly_price) 
      : 0);
  
  const isValidPrice = !isNaN(monthlyPrice) && monthlyPrice >= 0;
  const isPaidPlan = isValidPrice && monthlyPrice > 0;
  const isFreePlan = isValidPrice && monthlyPrice === 0;
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#0a3d5c] mb-2">Complete Your Subscription</h1>
              <p className="text-gray-600">
                Subscribe to keep your account active and access all platform features.
              </p>
            </div>

            {/* Pricing Plan Info */}
            <div className="mb-8 p-6 bg-[#0a3d5c]/5 rounded-lg border border-[#0a3d5c]/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#0a3d5c]">{pricingPlan.plan_name}</h3>
                  {pricingPlan.description && (
                    <p className="text-sm text-gray-600 mt-1">{pricingPlan.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1">
                    <DollarSign className="h-5 w-5 text-[#d5b775]" />
                    <span className="text-3xl font-bold text-[#0a3d5c]">
                      {monthlyPrice.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">per month</p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            {/* ✅ FIX: Only render checkout form if price is valid and > 0 */}
            {isPaidPlan && isValidPrice ? (
              <CheckoutForm 
                pricingPlan={{
                  ...pricingPlan,
                  monthly_price: monthlyPrice
                }} 
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            ) : isFreePlan ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    This is a free subscription. Click below to activate your account.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session) {
                          throw new Error('Not authenticated');
                        }

                        const { sessionId, url, error: sessionError } = await createCheckoutSession(
                          pricingPlan.id,
                          session.user.id,
                          `${window.location.origin}/subscription/success`,
                          `${window.location.origin}/subscription`
                        );

                        if (sessionError || !sessionId) {
                          throw sessionError || new Error('Failed to create subscription');
                        }

                        if (sessionId === 'free_subscription') {
                          handleSuccess();
                        }
                      } catch (error: any) {
                        console.error('Free subscription error:', error);
                        toast({
                          title: 'Error',
                          description: error.message || 'Failed to activate subscription',
                          variant: 'destructive',
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="flex-1 bg-[#0a3d5c] hover:bg-[#0a3d5c]/90"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      'Activate Free Subscription'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 font-semibold">Invalid Pricing Plan</p>
                  <p className="text-sm text-gray-600 mt-2">
                    The pricing plan has an invalid monthly price. Please contact support.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Subscription;

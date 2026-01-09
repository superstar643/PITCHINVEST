import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getUserSubscription, cancelSubscription } from '@/lib/stripe';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const SubscriptionManagement: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return;
      }

      // Load subscription
      const { subscription: sub, error: subError } = await getUserSubscription(session.user.id);
      if (subError && subError.message !== 'No subscription found') {
        console.error('Error loading subscription:', subError);
      }
      setSubscription(sub);

      // Load invoices
      if (sub) {
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('subscription_id', sub.id)
          .order('created_at', { ascending: false });

        if (invoiceError) {
          console.error('Error loading invoices:', invoiceError);
        } else {
          setInvoices(invoiceData || []);
        }
      }
    } catch (error: any) {
      console.error('Error loading subscription data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription information.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    const confirmMessage = subscription.cancel_at_period_end
      ? 'Your subscription is already set to cancel at the end of the billing period. Do you want to cancel it immediately instead?'
      : 'Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setCanceling(true);
      const { success, error } = await cancelSubscription(
        subscription.id,
        subscription.cancel_at_period_end // Cancel immediately if already set to cancel
      );

      if (error) throw error;

      if (success) {
        toast({
          title: 'Success',
          description: subscription.cancel_at_period_end
            ? 'Subscription canceled immediately.'
            : 'Subscription will be canceled at the end of the billing period.',
        });
        loadSubscriptionData(); // Reload to show updated status
      }
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <CardContent className="p-12">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#0a3d5c] to-[#062a3d] text-white pb-4">
          <CardTitle className="text-white text-2xl">Subscription</CardTitle>
          <CardDescription className="text-white/90">Manage your subscription</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-6">
              You don't have an active subscription. Subscribe now to access all platform features.
            </p>
            <Button
              onClick={() => navigate('/subscription')}
              className="bg-[#0a3d5c] hover:bg-[#0a3d5c]/90"
            >
              Subscribe Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const periodEnd = new Date(subscription.current_period_end);
  const isExpiringSoon = periodEnd.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days
  const isActive = subscription.status === 'active' && periodEnd > new Date();
  const isCanceling = subscription.cancel_at_period_end || subscription.status === 'canceled';

  return (
    <>
      {/* Current Subscription */}
      <Card className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#0a3d5c] to-[#062a3d] text-white pb-4">
          <CardTitle className="text-white text-2xl">Current Subscription</CardTitle>
          <CardDescription className="text-white/90">Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {isActive ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-semibold capitalize ${
                    isActive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {subscription.status}
                    {isCanceling && ' (Canceling)'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-semibold text-[#0a3d5c]">
                  {subscription.pricing_plan?.plan_name || 'Monthly Subscription'}
                </p>
              </div>
            </div>

            {/* Billing Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-600">Monthly Price</p>
                </div>
                <p className="text-xl font-bold text-[#0a3d5c]">
                  {subscription.currency === 'USD' ? '$' : subscription.currency} {subscription.monthly_price.toFixed(2)}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-600">Current Period</p>
                </div>
                <p className="text-sm font-medium">
                  {format(new Date(subscription.current_period_start), 'MMM d, yyyy')} - {format(periodEnd, 'MMM d, yyyy')}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className={`h-5 w-5 ${isExpiringSoon ? 'text-orange-500' : 'text-gray-400'}`} />
                  <p className="text-sm text-gray-600">
                    {isCanceling ? 'Expires on' : 'Renews on'}
                  </p>
                </div>
                <p className={`text-sm font-medium ${isExpiringSoon ? 'text-orange-600' : ''}`}>
                  {format(periodEnd, 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              {isActive && !isCanceling && (
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  disabled={canceling}
                  className="flex-1"
                >
                  {canceling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Canceling...
                    </>
                  ) : (
                    'Cancel Subscription'
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate('/subscription')}
                className="flex-1"
              >
                Change Plan
              </Button>
            </div>

            {isCanceling && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  Your subscription will remain active until {format(periodEnd, 'MMMM d, yyyy')}. 
                  After that date, your account will be deactivated unless you renew.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#0a3d5c] to-[#062a3d] text-white pb-4">
          <CardTitle className="text-white text-2xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice History
          </CardTitle>
          <CardDescription className="text-white/90">View and download your invoices</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No invoices yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-[#0a3d5c]">{invoice.invoice_number}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        invoice.payment_status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.payment_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.payment_status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{format(new Date(invoice.created_at), 'MMM d, yyyy')}</span>
                      {invoice.billing_period_start && invoice.billing_period_end && (
                        <span>
                          {format(new Date(invoice.billing_period_start), 'MMM d')} - {format(new Date(invoice.billing_period_end), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#0a3d5c]">
                      {invoice.currency === 'USD' ? '$' : invoice.currency} {invoice.total_amount.toFixed(2)}
                    </p>
                    {invoice.pdf_url && (
                      <a
                        href={invoice.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#0a3d5c] hover:underline mt-1 block"
                      >
                        Download PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default SubscriptionManagement;

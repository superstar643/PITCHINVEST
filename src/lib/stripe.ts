// Stripe integration utilities for PITCHINVEST
// Handles Stripe payment processing and subscription management

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Initialize Stripe (using publishable key from environment)
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = async (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('Stripe publishable key not found. Please set VITE_STRIPE_PUBLISHABLE_KEY in .env');
      return null;
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Payment intent types
export interface PaymentIntentData {
  amount: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionData {
  pricing_plan_id: string;
  user_id: string;
  payment_method_id?: string;
}


// Create a checkout session for subscription
export const createCheckoutSession = async (
  pricingPlanId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string | null; url: string | null; error: Error | null }> => {
  try {
 // Refresh session to ensure we have a valid token
 const { data: { session }, error: sessionError } = await supabase.auth.getSession();
 if (sessionError || !session) {
   return { sessionId: null, url: null, error: new Error('User not authenticated') };
 }

 // Ensure session is still valid
 if (!session.access_token) {
   return { sessionId: null, url: null, error: new Error('Invalid session token') };
 }

    // Get pricing plan details
    const { data: pricingPlan, error: planError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', pricingPlanId)
      .single();

    if (planError || !pricingPlan) {
      return { sessionId: null, url: null, error: new Error('Pricing plan not found') };
    }

    if (pricingPlan.monthly_price === 0) {
      // If price is 0, create subscription directly without Stripe
      const result = await createFreeSubscription(userId, pricingPlanId);
      return { ...result, url: null };
    }

    // Create checkout session via Supabase Edge Function
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return { 
        sessionId: null, 
        url: null,
        error: new Error('Missing Supabase configuration. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY') 
      };
    }

    const functionUrl = `${supabaseUrl}/functions/v1/create-checkout-session`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        pricing_plan_id: pricingPlanId,
        user_id: userId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = 'Failed to create checkout session';
      try {
        const errorData = await response.json();
        // Handle different error response formats
        errorMessage = errorData.error || errorData.message || errorData.error_description || errorMessage;
        
        // Log full error details for debugging
        console.error('Edge function error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
      } catch (parseError) {
        // If JSON parsing fails, get text response
        const textResponse = await response.text().catch(() => 'Unknown error');
        errorMessage = textResponse || `HTTP ${response.status}: ${response.statusText}`;
        console.error('Edge function error (non-JSON):', {
          status: response.status,
          statusText: response.statusText,
          textResponse,
        });
      }
      return { 
        sessionId: null, 
        url: null,
        error: new Error(errorMessage) 
      };
    }

    // Parse successful response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      return { 
        sessionId: null, 
        url: null,
        error: new Error('Invalid response format from checkout session endpoint') 
      };
    }

    // Check if response contains an error
    if (data.error) {
      console.error('Edge function returned an error:', data.error);
      return {
        sessionId: data.sessionId || null,
        url: null,
        error: new Error(data.error || 'Failed to create checkout session')
      };
    }

    // Handle different possible response formats
    // Stripe checkout sessions might return: sessionId, session_id, id, or url
    const sessionId = data.sessionId || data.session_id || data.id || data.checkout_session_id;
    const url = data.url || data.checkout_url || null;
    
   
    if (!sessionId && sessionId !== 'free_subscription') {
      console.error('No session ID in response:', data);
      return { 
        sessionId: null, 
        url: null,
        error: new Error('Checkout session created but no session ID returned') 
      };
    }

    // If we have a sessionId but no URL, and it's not a free subscription,
    // try to construct a basic checkout URL as a fallback
    // Note: This is a workaround - the edge function should always return the URL
    if (sessionId && !url && sessionId !== 'free_subscription') {
      console.warn('URL missing from checkout session response, attempting fallback:', {
        sessionId,
        dataKeys: Object.keys(data),
        fullData: data
      });
      
      // Try to get the URL from Stripe directly using the session ID
      // This is a fallback - normally the edge function should provide the URL
      try {
        // We can't directly call Stripe API from frontend without exposing secret key
        // So we'll need to rely on the edge function fix
        // For now, return an error with the session ID so the user can report it
        console.error('Cannot retrieve URL from frontend - edge function should provide it');
        return {
          sessionId,
          url: null,
          error: new Error('Checkout session URL not available. Please check edge function logs. Session ID: ' + sessionId)
        };
      } catch (fallbackError) {
        console.error('Fallback URL retrieval failed:', fallbackError);
        return {
          sessionId,
          url: null,
          error: new Error('Checkout session URL not available in response. Session ID: ' + sessionId)
        };
      }
    }

    return { sessionId, url, error: null };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { 
      sessionId: null, 
      url: null,
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
};

// Create a free subscription (when price is 0)
const createFreeSubscription = async (
  userId: string,
  pricingPlanId: string
): Promise<{ sessionId: string | null; error: Error | null }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { sessionId: null, error: new Error('User not authenticated') };
    }

    // Get pricing plan
    const { data: pricingPlan } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', pricingPlanId)
      .single();

    if (!pricingPlan) {
      return { sessionId: null, error: new Error('Pricing plan not found') };
    }

    // Calculate period dates (1 month from now)
    const now = new Date();
    const periodStart = now;
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Create subscription directly in database (no payment needed)
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        pricing_plan_id: pricingPlanId,
        status: 'active',
        monthly_price: pricingPlan.monthly_price,
        currency: pricingPlan.currency,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .select()
      .single();

    if (subError) {
      return { sessionId: null, error: subError };
    }

    // Generate invoice for free subscription
    await generateInvoice(userId, subscription.id, pricingPlan.monthly_price, pricingPlan.currency);

    return { sessionId: 'free_subscription', error: null };
  } catch (error) {
    console.error('Error creating free subscription:', error);
    return { 
      sessionId: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
};

// Generate invoice after successful subscription
export const generateInvoice = async (
  userId: string,
  subscriptionId: string,
  amount: number,
  currency: string = 'USD'
): Promise<{ invoiceId: string | null; error: Error | null }> => {
  try {
    // Get subscription details
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (!subscription) {
      return { invoiceId: null, error: new Error('Subscription not found') };
    }

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        subscription_id: subscriptionId,
        user_id: userId,
        invoice_type: 'subscription',
        subtotal: amount,
        tax_amount: 0.00, // No tax for now, can be configured later
        total_amount: amount,
        currency: currency,
        payment_status: amount === 0 ? 'paid' : 'pending',
        billing_period_start: subscription.current_period_start,
        billing_period_end: subscription.current_period_end,
        due_date: subscription.current_period_end,
      })
      .select()
      .single();

    if (invoiceError) {
      return { invoiceId: null, error: invoiceError };
    }

    // If amount is 0, mark invoice as paid
    if (amount === 0) {
      await supabase
        .from('invoices')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', invoice.id);
    }

    return { invoiceId: invoice.id, error: null };
  } catch (error) {
    console.error('Error generating invoice:', error);
    return { 
      invoiceId: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
};

// Cancel subscription
export const cancelSubscription = async (
  subscriptionId: string,
  cancelImmediately: boolean = false
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: new Error('User not authenticated') };
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', session.user.id)
      .single();

    if (!subscription) {
      return { success: false, error: new Error('Subscription not found') };
    }

    if (subscription.stripe_subscription_id && subscription.payment_provider === 'stripe') {
      // Cancel Stripe subscription via backend API
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/cancel-subscription`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subscription_id: subscription.stripe_subscription_id,
          cancel_immediately: cancelImmediately,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel Stripe subscription');
      }
    }

    // Update subscription in database
    const updateData: any = {
      cancel_at_period_end: !cancelImmediately,
      updated_at: new Date().toISOString(),
    };

    if (cancelImmediately) {
      updateData.status = 'canceled';
      updateData.canceled_at = new Date().toISOString();
      updateData.current_period_end = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', subscriptionId);

    if (updateError) {
      return { success: false, error: updateError };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
};

// Get user's active subscription
export const getUserSubscription = async (userId?: string): Promise<{
  subscription: any | null;
  error: Error | null;
}> => {
  try {
    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { subscription: null, error: new Error('User not authenticated') };
      }
      userId = session.user.id;
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        pricing_plan:pricing_plans(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // ✅ Changed from .single() to .maybeSingle()

    // maybeSingle() returns null data when no rows found (no error)
    if (error) {
      console.error('Error fetching subscription:', error);
      return { subscription: null, error };
    }

    return { subscription: subscription || null, error: null };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return { 
      subscription: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
};

// Verify checkout session and create subscription
export const verifyCheckoutSession = async (
  sessionId: string
): Promise<{ subscription: any | null; error: Error | null }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { subscription: null, error: new Error('User not authenticated') };
    }

    // Call edge function to verify session and create subscription
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return { 
        subscription: null, 
        error: new Error('Missing Supabase configuration') 
      };
    }

    const functionUrl = `${supabaseUrl}/functions/v1/verify-checkout-session`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        session_id: sessionId,
        user_id: session.user.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        subscription: null, 
        error: new Error(errorData.error || 'Failed to verify checkout session') 
      };
    }

    const data = await response.json();
    
    if (data.error) {
      return { subscription: null, error: new Error(data.error) };
    }

    // Get the created subscription
    const { subscription: sub, error: subError } = await getUserSubscription(session.user.id);
    
    if (subError && !sub) {
      return { subscription: null, error: subError };
    }

    return { subscription: sub, error: null };
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    return { 
      subscription: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
};

// Get pricing plan for user
export const getUserPricingPlan = async (
  userType: string,
  country?: string | null
): Promise<{
  pricingPlan: any | null;
  error: Error | null;
}> => {
  try {
    // Try to get country-specific plan first
    let query = supabase
      .from('pricing_plans')
      .select('*')
      .eq('plan_type', 'subscription')
      .eq('user_type', userType)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    const { data: plans, error } = await query;

    if (error) {
      return { pricingPlan: null, error };
    }

    if (!plans || plans.length === 0) {
      return { pricingPlan: null, error: new Error('No pricing plan found') };
    }

    // Prefer country-specific plan, fallback to country-agnostic plan
    const countryPlan = country 
      ? plans.find(p => p.country === country)
      : null;
    const defaultPlan = plans.find(p => p.country === null) || plans[0];

    const pricingPlan = countryPlan || defaultPlan;

    // ✅ FIX: Ensure monthly_price is a number
    if (pricingPlan && pricingPlan.monthly_price !== undefined && pricingPlan.monthly_price !== null) {
      pricingPlan.monthly_price = typeof pricingPlan.monthly_price === 'string'
        ? parseFloat(pricingPlan.monthly_price)
        : Number(pricingPlan.monthly_price);
      
      // Validate it's a valid number
      if (isNaN(pricingPlan.monthly_price)) {
        console.error('Invalid monthly_price in database:', pricingPlan.monthly_price);
        pricingPlan.monthly_price = 0;
      }
    }

    return { pricingPlan, error: null };
  } catch (error) {
    console.error('Error getting user pricing plan:', error);
    return { 
      pricingPlan: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
};

import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create Supabase client - use service role key if available, otherwise anon key
    // Service role key bypasses RLS, which is needed for creating subscriptions
    const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.warn("WARNING: Using ANON_KEY instead of SERVICE_ROLE_KEY. RLS policies may block subscription creation.");
    }
    const supabase = createClient(SUPABASE_URL, supabaseKey);

    // Parse body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { session_id, user_id } = body || {};
    
    console.log("=== Verify Checkout Session Started ===");
    console.log("Request body received:", { session_id, user_id });

    // Validate inputs
    if (!session_id || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: session_id and user_id" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Retrieve the checkout session from Stripe
    console.log("Retrieving checkout session from Stripe:", session_id);
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer'],
    });
    
    console.log("Checkout session retrieved:", {
      id: checkoutSession.id,
      payment_status: checkoutSession.payment_status,
      mode: checkoutSession.mode,
      subscription: checkoutSession.subscription,
    });

    // Verify the session is completed
    if (checkoutSession.payment_status !== 'paid') {
      console.error("Payment not completed:", checkoutSession.payment_status);
      return new Response(
        JSON.stringify({ error: "Payment not completed", payment_status: checkoutSession.payment_status }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get metadata from checkout session
    const metadata = checkoutSession.metadata || {};
    const pricingPlanId = metadata.pricing_plan_id;
    const sessionUserId = metadata.user_id;
    
    console.log("Session metadata:", { pricingPlanId, sessionUserId, metadata });

    // Verify user_id matches
    if (sessionUserId !== user_id) {
      console.error("User ID mismatch:", { sessionUserId, user_id });
      return new Response(
        JSON.stringify({ error: "User ID mismatch" }),
        { status: 403, headers: corsHeaders }
      );
    }

    if (!pricingPlanId) {
      console.error("Pricing plan ID not found in metadata");
      return new Response(
        JSON.stringify({ error: "Pricing plan ID not found in session metadata" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get pricing plan
    const { data: pricingPlan, error: planError } = await supabase
      .from("pricing_plans")
      .select("id, monthly_price, currency, plan_name")
      .eq("id", pricingPlanId)
      .single();

    if (planError || !pricingPlan) {
      return new Response(
        JSON.stringify({ error: "Pricing plan not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Get subscription ID from checkout session
    const stripeSubscriptionId = typeof checkoutSession.subscription === 'string' 
      ? checkoutSession.subscription 
      : checkoutSession.subscription?.id || null;

    // Check if subscription already exists (by user_id and stripe_subscription_id)
    if (stripeSubscriptionId) {
      console.log("Checking for existing subscription:", { user_id, stripeSubscriptionId });
      const { data: existingSub, error: checkError } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user_id)
        .eq("stripe_subscription_id", stripeSubscriptionId)
        .maybeSingle();

      if (checkError) {
        console.warn("Error checking existing subscription:", checkError);
      }

      if (existingSub) {
        console.log("Subscription already exists:", existingSub.id);
        return new Response(
          JSON.stringify({ success: true, message: "Subscription already exists" }),
          { status: 200, headers: corsHeaders }
        );
      }
    }

    // Get subscription details from Stripe if available
    const stripeSubscription = checkoutSession.subscription as Stripe.Subscription | string | null;
    let subscriptionData: any = {
      user_id: user_id,
      pricing_plan_id: pricingPlanId,
      status: 'active',
      monthly_price: pricingPlan.monthly_price,
      currency: pricingPlan.currency,
      payment_provider: 'stripe',
      stripe_customer_id: typeof checkoutSession.customer === 'string' 
        ? checkoutSession.customer 
        : checkoutSession.customer?.id || null,
      stripe_subscription_id: stripeSubscriptionId,
    };

    // If we have the full subscription object, get period dates
    if (stripeSubscription && typeof stripeSubscription === 'object') {
      subscriptionData.current_period_start = new Date(stripeSubscription.current_period_start * 1000).toISOString();
      subscriptionData.current_period_end = new Date(stripeSubscription.current_period_end * 1000).toISOString();
      console.log("Using Stripe subscription period dates:", {
        start: subscriptionData.current_period_start,
        end: subscriptionData.current_period_end,
      });
    } else {
      // Fallback: calculate period dates (1 month from now)
      const now = new Date();
      subscriptionData.current_period_start = now.toISOString();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      subscriptionData.current_period_end = periodEnd.toISOString();
      console.log("Using calculated period dates:", {
        start: subscriptionData.current_period_start,
        end: subscriptionData.current_period_end,
      });
    }

    // Create subscription in database
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .insert(subscriptionData)
      .select()
      .single();

    if (subError) {
      console.error("Error creating subscription:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to create subscription", details: subError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Set profile_status to 'pending' after payment - requires admin approval
    const { error: profileStatusError } = await supabase
      .from("users")
      .update({ profile_status: 'pending' })
      .eq("id", user_id);

    if (profileStatusError) {
      console.warn("Failed to set profile_status to pending:", profileStatusError);
      // Don't fail the whole operation if this fails, but log it
    } else {
      console.log("Profile status set to 'pending' for user:", user_id);
    }

    // Generate invoice
    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          subscription_id: subscription.id,
          user_id: user_id,
          invoice_type: 'subscription',
          subtotal: pricingPlan.monthly_price,
          tax_amount: 0.00,
          total_amount: pricingPlan.monthly_price,
          currency: pricingPlan.currency,
          payment_status: 'paid',
          billing_period_start: subscriptionData.current_period_start,
          billing_period_end: subscriptionData.current_period_end,
          due_date: subscriptionData.current_period_end,
          paid_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (invoiceError) {
        console.warn("Failed to create invoice:", invoiceError);
        // Don't fail the whole operation if invoice creation fails
      }
    } catch (invoiceErr) {
      console.warn("Error generating invoice:", invoiceErr);
      // Continue anyway
    }

    return new Response(
      JSON.stringify({ success: true, subscription }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

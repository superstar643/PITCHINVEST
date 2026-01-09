import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
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
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

    const { pricing_plan_id, user_id, success_url, cancel_url } = body || {};

    // Validate inputs
    if (!pricing_plan_id || !user_id || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get pricing plan
    const { data: pricingPlan, error: planError } = await supabase
      .from("pricing_plans")
      .select("id, monthly_price, currency, plan_name, description")
      .eq("id", pricing_plan_id)
      .single();

    if (planError || !pricingPlan) {
      return new Response(
        JSON.stringify({ error: "Pricing plan not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Handle free plans
    const monthlyPrice = Number(pricingPlan.monthly_price) || 0;
    if (monthlyPrice <= 0) {
      return new Response(
        JSON.stringify({ sessionId: "free_subscription" }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Get user email
    const { data: userData } = await supabase
      .from("users")
      .select("personal_email")
      .eq("id", user_id)
      .maybeSingle();

    // Check for existing Stripe customer
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user_id)
      .eq("payment_provider", "stripe")
      .not("stripe_customer_id", "is", null)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id;

    // Create customer if needed, or update existing customer email if missing
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData?.personal_email || undefined,
        metadata: { user_id, supabase_user_id: user_id },
      });
      customerId = customer.id;
    } else if (userData?.personal_email) {
      // Ensure existing customer has email set for prefilling
      try {
        const existingCustomer = await stripe.customers.retrieve(customerId);
        if (existingCustomer && !existingCustomer.deleted && !existingCustomer.email) {
          await stripe.customers.update(customerId, {
            email: userData.personal_email,
          });
        }
      } catch (updateError) {
        console.warn("Could not update customer email:", updateError);
        // Continue anyway - customer exists and checkout will work
      }
    }

    // Create checkout session
    // Using 'customer' will automatically prefill the email if the customer has one
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{
        price_data: {
          currency: String(pricingPlan.currency || "usd").toLowerCase(),
          product_data: {
            name: pricingPlan.plan_name || "Subscription",
            description: pricingPlan.description || "",
          },
          recurring: { interval: "month" },
          unit_amount: Math.round(monthlyPrice * 100),
        },
        quantity: 1,
      }],
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,
      metadata: {
        user_id,
        pricing_plan_id,
      },
    });

    // Log session details for debugging
    console.log("Stripe checkout session created:", {
      id: session.id,
      url: session.url,
      hasUrl: !!session.url,
      mode: session.mode,
      status: session.status,
    });

    // Always retrieve the session to ensure we get the complete URL
    // The create response might not always include the full URL
    let checkoutUrl = session.url;
    let finalSession = session;

    // Always retrieve to ensure we have the latest session data with URL
    try {
      finalSession = await stripe.checkout.sessions.retrieve(session.id);
      checkoutUrl = finalSession.url || checkoutUrl; // Use retrieved URL if available, fallback to create response URL
      
      console.log("Retrieved session:", {
        id: finalSession.id,
        url: finalSession.url,
        hasUrl: !!finalSession.url,
        createResponseUrl: session.url,
      });
    } catch (retrieveError) {
      console.error("Error retrieving session, using create response:", retrieveError);
      // If retrieval fails, use the URL from create response if available
      checkoutUrl = session.url;
    }

    // If URL is still not available, this is an error condition
    if (!checkoutUrl) {
      console.error("Checkout session URL not available after retrieval:", {
        sessionId: finalSession.id,
        sessionMode: finalSession.mode,
        sessionStatus: finalSession.status,
        createResponseUrl: session.url,
        retrievedUrl: finalSession.url,
        sessionKeys: Object.keys(finalSession),
      });
      
      return new Response(
        JSON.stringify({ 
          error: "Checkout session URL not available from Stripe", 
          sessionId: finalSession.id,
          details: "The Stripe checkout session was created but the URL is not available. This may indicate a Stripe API issue."
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log("Returning checkout session:", {
      sessionId: finalSession.id,
      url: checkoutUrl,
      urlLength: checkoutUrl?.length,
    });

    return new Response(
      JSON.stringify({ sessionId: finalSession.id, url: checkoutUrl }),
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

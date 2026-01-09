# Supabase Edge Functions Setup Guide

## Overview

The payment system uses Supabase Edge Functions to handle Stripe integration securely on the backend. This guide shows you how to deploy and configure these functions.

## Prerequisites

1. **Supabase CLI** installed
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link your project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

## Edge Functions Created

### 1. `create-checkout-session`
Creates a Stripe checkout session for subscription payments.

### 2. `cancel-subscription`
Cancels a Stripe subscription (immediately or at period end).

## Deployment Steps

### Step 1: Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### Step 2: Initialize Supabase (if not already done)

```bash
supabase init
```

### Step 3: Set Environment Variables

Set the following secrets in your Supabase project:

```bash
# Get your Stripe secret key from: https://dashboard.stripe.com/apikeys
supabase secrets set STRIPE_SECRET_KEY=sk_test_...

# These are automatically available, but verify:
# SUPABASE_URL (auto-set)
# SUPABASE_ANON_KEY (auto-set)
```

**Via Supabase Dashboard:**
1. Go to Project Settings → Edge Functions
2. Add secrets:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (starts with `sk_test_` or `sk_live_`)

### Step 4: Deploy Functions

Deploy each function:

```bash
# Deploy create-checkout-session
supabase functions deploy create-checkout-session

# Deploy cancel-subscription
supabase functions deploy cancel-subscription
```

### Step 5: Verify Deployment

Check that functions are deployed:

```bash
supabase functions list
```

## Testing Edge Functions

### Test create-checkout-session

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-checkout-session' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "pricing_plan_id": "plan-id",
    "user_id": "user-id",
    "success_url": "https://yourdomain.com/subscription/success",
    "cancel_url": "https://yourdomain.com/subscription/cancel"
  }'
```

### Test cancel-subscription

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cancel-subscription' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "subscription_id": "subscription-id",
    "cancel_immediately": false
  }'
```

## Stripe Webhook Setup (Required)

### Step 1: Create Webhook Endpoint

You'll need to create another Edge Function for webhooks:

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-12-18.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      // Create subscription in database
      // Update user subscription status
      break;
    }
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      // Update invoice status in database
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      // Cancel subscription in database
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      // Update subscription status in database
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
```

### Step 2: Deploy Webhook Function

```bash
supabase functions deploy stripe-webhook
```

### Step 3: Configure Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Copy the webhook signing secret
6. Set it as a secret: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

## Environment Variables Summary

Required secrets in Supabase:
- `STRIPE_SECRET_KEY`: Your Stripe secret API key
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret (for webhook function)

Auto-available (no need to set):
- `SUPABASE_URL`: Automatically available
- `SUPABASE_ANON_KEY`: Automatically available
- `SUPABASE_SERVICE_ROLE_KEY`: Use for webhooks (admin operations)

## Troubleshooting

**Function not found error:**
- Make sure functions are deployed: `supabase functions list`
- Check function name matches exactly

**Authentication error:**
- Verify `Authorization` header includes valid JWT token
- Check `apikey` header is set to `VITE_SUPABASE_ANON_KEY`

**Stripe API error:**
- Verify `STRIPE_SECRET_KEY` secret is set correctly
- Check Stripe key has correct permissions

**CORS errors:**
- Edge Functions handle CORS automatically
- Check function headers include CORS headers

## Local Development

To test functions locally:

```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve create-checkout-session
supabase functions serve cancel-subscription
```

Local endpoint: `http://localhost:54321/functions/v1/function-name`

## Production Deployment

Before deploying to production:

1. ✅ Switch to Stripe live keys
2. ✅ Update webhook URL to production domain
3. ✅ Test all payment flows
4. ✅ Monitor Stripe dashboard for webhook events
5. ✅ Set up error monitoring/alerting

For more info, see: https://supabase.com/docs/guides/functions

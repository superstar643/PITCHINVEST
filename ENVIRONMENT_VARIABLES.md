# Environment Variables Required

## Payment System Setup

Add the following environment variable to your `.env` file:

```bash
# Stripe Publishable Key (get from Stripe Dashboard)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Getting Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** > **API keys**
3. Copy your **Publishable key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)
4. Add it to your `.env` file

**Note:** For production, use live mode keys (`pk_live_...`). For development/testing, use test mode keys (`pk_test_...`).

## Backend API Endpoints Required

The payment system requires backend API endpoints (Supabase Edge Functions or separate backend) for:

1. **`/api/create-checkout-session`**
   - Creates Stripe checkout session
   - Returns session ID for redirect

2. **`/api/cancel-subscription`**
   - Cancels Stripe subscription
   - Updates database subscription status

3. **Stripe Webhook Handler**
   - Processes Stripe events
   - Updates subscription status in database
   - Generates invoices automatically

## Example .env file

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...
```

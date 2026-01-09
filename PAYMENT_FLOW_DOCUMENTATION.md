# Payment System Flow Documentation

## Overview

The payment system processes **monthly recurring subscriptions** using Stripe. Here's how it works:

## Payment Flow

### 1. User Registration → Subscription Page
- User completes registration
- Automatically redirected to `/subscription`
- System fetches pricing plan based on user type and country
- Default price: **$1.00/month** (admin can change via `/admin/pricing`)

### 2. Subscription Purchase
- User clicks "Subscribe" button
- Frontend calls Supabase Edge Function: `create-checkout-session`
- Edge Function creates Stripe Checkout Session
- User redirected to Stripe Checkout page
- User enters payment details and pays

### 3. Payment Processing (Stripe)
- **Stripe handles the payment** securely
- **Stripe creates a subscription** with recurring billing
- **Stripe automatically charges monthly** on the same date each month
- No manual intervention needed for recurring payments

### 4. Webhook Processing (Automatic)
After payment, Stripe sends webhook events to our system:

#### `checkout.session.completed`
- **When**: Immediately after successful payment
- **Action**: 
  - Creates subscription record in database
  - Links Stripe subscription ID
  - Generates first invoice
  - Sets billing period dates

#### `invoice.paid` (Monthly Recurring)
- **When**: Every month when Stripe charges the customer
- **Action**:
  - Updates subscription billing period
  - Creates new invoice in database
  - Marks invoice as paid
  - Extends subscription period

#### `customer.subscription.updated`
- **When**: Subscription status changes (renewal, cancellation, etc.)
- **Action**: Updates subscription status in database

#### `customer.subscription.deleted`
- **When**: Subscription is canceled
- **Action**: Marks subscription as canceled in database

#### `invoice.payment_failed`
- **When**: Payment fails (insufficient funds, expired card, etc.)
- **Action**: 
  - Marks subscription as `past_due`
  - Updates invoice status to `failed`
  - User can update payment method

## Monthly Payment Processing

### How It Works:
1. **Stripe automatically charges** the customer's card each month
2. **Stripe sends `invoice.paid` webhook** to our system
3. **Webhook handler**:
   - Creates new invoice record
   - Updates subscription billing period
   - Extends `current_period_end` date
   - Marks subscription as active

### No Manual Processing Required:
- ✅ Stripe handles all payment processing
- ✅ Stripe handles retries for failed payments
- ✅ Stripe sends email receipts automatically
- ✅ Our system just receives webhooks and updates database

## Database Tables

### `subscriptions`
- Stores subscription details
- Links to Stripe subscription ID
- Tracks billing periods
- Status: `active`, `past_due`, `canceled`, `unpaid`

### `invoices`
- One invoice per billing period
- Auto-generated when payment is received
- Links to subscription
- Tracks payment status

### `pricing_plans`
- Admin-managed pricing
- Can set different prices per country
- Default: $1.00/month

## Admin Functions

### Set Pricing (`/admin/pricing`)
- Create/edit pricing plans
- Set country-specific pricing
- All changes take effect for new subscriptions

### View Subscriptions (Settings → Subscription)
- Users can view their subscription
- See billing history
- Cancel subscription

## Setup Checklist

- [x] Database schema created
- [x] Frontend components complete
- [x] Stripe integration code ready
- [ ] **Deploy Supabase Edge Functions**:
  - `create-checkout-session`
  - `cancel-subscription`
  - `stripe-webhook`
- [ ] **Configure Stripe**:
  - Add webhook endpoint in Stripe Dashboard
  - Set webhook secret in Supabase
  - Test webhook events
- [ ] **Set Environment Variables**:
  - `VITE_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY` (Supabase secret)
  - `STRIPE_WEBHOOK_SECRET` (Supabase secret)

## Testing

### Test Payment Flow:
1. Register new user
2. Go to subscription page
3. Click "Subscribe"
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete payment
6. Verify subscription created in database
7. Verify invoice created

### Test Recurring Payment:
1. Wait for next billing cycle (or use Stripe test mode to trigger)
2. Verify `invoice.paid` webhook received
3. Verify new invoice created in database
4. Verify subscription period extended

## Important Notes

⚠️ **Stripe handles all recurring payments automatically** - no cron jobs or scheduled tasks needed

⚠️ **Webhooks are critical** - they keep database in sync with Stripe

⚠️ **Test mode vs Live mode** - Use test keys for development, live keys for production

⚠️ **Webhook security** - Always verify webhook signatures to prevent fraud

## Support

If payments fail:
- User receives email from Stripe
- Subscription status changes to `past_due`
- User can update payment method in Settings
- Stripe automatically retries failed payments

# Payment System Setup Instructions

## Quick Start Guide

Follow these steps to set up the payment system for PITCHINVEST:

### 1. Database Setup

Run the SQL script in Supabase SQL Editor:

```sql
-- Execute: supabase/10_payment_system_schema.sql
```

This creates:
- `pricing_plans` table (with default 0.00 prices)
- `subscriptions` table
- `invoices` table  
- `payment_methods` table
- RLS policies for security
- Helper functions

### 2. Install Dependencies

Already installed! ✅
- `@stripe/stripe-js`
- `@stripe/react-stripe-js`

### 3. Environment Variables

Add to your `.env` file:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...
```

Get your Stripe key from: https://dashboard.stripe.com/apikeys

### 4. Set Up Admin Pricing (Important!)

1. Navigate to `/admin/pricing` in your app
2. For each user type, set the monthly subscription price:
   - Inventor
   - StartUp
   - Company
   - Investor
3. You can set country-specific pricing or global pricing
4. All prices start at $0.00 - you must set them via admin panel

### 5. Backend API Endpoints (Required)

You need to create backend endpoints or Supabase Edge Functions:

#### `/api/create-checkout-session` (POST)
```javascript
// Request body:
{
  pricing_plan_id: string,
  user_id: string,
  success_url: string,
  cancel_url: string
}

// Response:
{
  sessionId: string
}
```

#### `/api/cancel-subscription` (POST)
```javascript
// Request body:
{
  subscription_id: string,
  cancel_immediately: boolean
}

// Response:
{
  success: boolean
}
```

#### Stripe Webhook Handler (`/api/stripe-webhook`)
Handle these events:
- `checkout.session.completed` - Create subscription after payment
- `invoice.paid` - Update invoice status
- `customer.subscription.deleted` - Cancel subscription
- `customer.subscription.updated` - Update subscription status

### 6. Test the Flow

1. **Register a new user** → Redirects to `/subscription`
2. **Select subscription plan** → Shows pricing (defaults to $0.00)
3. **For free subscriptions ($0.00)**: Click "Activate Free Subscription"
4. **For paid subscriptions**: Stripe Checkout will open
5. **After payment**: Redirects to `/subscription/success`
6. **View subscription**: Go to Settings → Subscription tab

## Key Features

✅ **Zero-Default Pricing**: All plans start at $0.00  
✅ **Free Subscriptions**: Automatically activated when price is 0  
✅ **Auto Invoice Generation**: Invoices created with every subscription  
✅ **Admin Panel**: Manage all pricing via `/admin/pricing`  
✅ **Subscription Management**: View and cancel subscriptions in Settings  
✅ **Invoice History**: View all invoices in Settings → Subscription  

## Important Notes

⚠️ **Project Sales/Auctions**: Payment system is ONLY for monthly subscriptions. Project sales are handled privately between users (0% commission).

⚠️ **Backend Required**: The frontend is complete, but you need backend API endpoints for Stripe integration to work fully.

⚠️ **Test Mode**: Use Stripe test keys (`pk_test_...`) for development. Switch to live keys (`pk_live_...`) for production.

## Troubleshooting

**"Pricing plan not found" error:**
- Make sure you've created pricing plans in the database
- Run `supabase/10_payment_system_schema.sql` to create default plans
- Set prices via `/admin/pricing`

**"Stripe publishable key not found" error:**
- Add `VITE_STRIPE_PUBLISHABLE_KEY` to your `.env` file
- Restart your dev server after adding the variable

**Subscription not showing:**
- Check that subscription was created in `subscriptions` table
- Verify RLS policies allow user to read their own subscription
- Check browser console for errors

## Next Steps

1. ✅ Database schema created
2. ✅ Frontend components complete
3. ⏳ Create backend API endpoints
4. ⏳ Set up Stripe webhooks
5. ⏳ Configure admin pricing
6. ⏳ Test end-to-end flow
7. ⏳ Set up invoice PDF generation (optional)

For detailed implementation info, see `PAYMENT_SYSTEM_IMPLEMENTATION.md`

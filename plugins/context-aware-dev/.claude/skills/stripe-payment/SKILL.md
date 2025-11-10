---
name: stripe-payment
description: Implement Stripe payment processing including checkout sessions, webhooks, subscriptions, and payment intents. Use when the user mentions Stripe, payments, checkout, webhooks, subscriptions, billing, or payment processing.
---

# Stripe Payment Implementation Pattern

## When to Use This Skill

Use this skill when implementing:
- Payment checkout flows
- Stripe webhook handling
- Subscription management
- Payment intent processing
- Secure payment integrations

## Implementation Steps

### 1. Install Dependencies

```bash
npm install stripe
npm install --save-dev @types/stripe
```

### 2. Set Up Stripe Configuration

Create a configuration file for Stripe initialization:

```typescript
// config/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
```

### 3. Create Checkout Session

```typescript
// services/checkout.ts
import { stripe } from '../config/stripe';

export async function createCheckoutSession(
  priceId: string,
  customerId?: string
) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer: customerId,
    success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/cancel`,
  });

  return session;
}
```

### 4. Handle Webhooks Securely

See `webhook-handler.ts` for complete webhook implementation.

**Key Points:**
- Always verify webhook signatures
- Handle events idempotently
- Log all webhook events for debugging
- Return 200 status quickly to prevent retries

### 5. Manage Subscriptions

```typescript
// services/subscription.ts
import { stripe } from '../config/stripe';

export async function createSubscription(
  customerId: string,
  priceId: string
) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}
```

## Best Practices

1. **Environment Variables**: Store API keys securely, never commit them
2. **Webhook Verification**: Always verify `stripe-signature` header
3. **Idempotency**: Use idempotency keys for critical operations
4. **Error Handling**: Catch and log Stripe errors appropriately
5. **Testing**: Use Stripe test mode and test webhooks locally with Stripe CLI
6. **Amounts**: Stripe uses smallest currency unit (cents for USD)
7. **Customer Management**: Create customers before charging for better tracking

## Common Patterns

### Payment Intent for Custom Flows

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000, // $20.00
  currency: 'usd',
  customer: customerId,
  automatic_payment_methods: {
    enabled: true,
  },
});
```

### Retrieve Customer Payment Methods

```typescript
const paymentMethods = await stripe.customers.listPaymentMethods(
  customerId,
  { type: 'card' }
);
```

## Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

Test webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

## Reference Files

- `webhook-handler.ts` - Complete webhook handling implementation
- `examples.md` - Additional code examples and use cases

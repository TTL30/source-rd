import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../config/stripe';

/**
 * Stripe Webhook Handler
 *
 * This handler processes Stripe webhook events securely.
 * Always verify the webhook signature before processing events.
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    console.error('Missing stripe-signature header');
    return res.status(400).send('Missing signature');
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Log the event for debugging
  console.log(`Webhook received: ${event.type}`, {
    id: event.id,
    created: event.created,
  });

  // Handle different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    res.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    // Still return 200 to prevent Stripe from retrying
    // Log error for manual investigation
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);

  // TODO: Fulfill order, update database
  // - Create order record
  // - Send confirmation email
  // - Update inventory

  const customerId = session.customer as string;
  const paymentStatus = session.payment_status;

  if (paymentStatus === 'paid') {
    console.log(`Payment successful for customer ${customerId}`);
    // Grant access to product/service
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  // TODO: Update payment status in database
  const amount = paymentIntent.amount / 100; // Convert from cents
  const customerId = paymentIntent.customer as string;

  console.log(`Received $${amount} from customer ${customerId}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error('Payment failed:', paymentIntent.id);

  // TODO: Notify customer, log failure
  const customerId = paymentIntent.customer as string;
  const error = paymentIntent.last_payment_error?.message;

  console.error(`Payment failed for customer ${customerId}: ${error}`);
  // Send failure notification email
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);

  // TODO: Grant subscription access
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  console.log(`Subscription ${priceId} created for customer ${customerId}`);
  // Update user's subscription status in database
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  // TODO: Update subscription details in database
  const status = subscription.status;

  if (status === 'canceled' || status === 'unpaid') {
    // Revoke access
    console.log(`Subscription ${subscription.id} is now ${status}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  // TODO: Revoke access, clean up
  const customerId = subscription.customer as string;
  console.log(`Subscription canceled for customer ${customerId}`);
  // Remove subscription benefits
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id);

  // TODO: Record payment, send receipt
  const subscriptionId = invoice.subscription as string;
  console.log(`Invoice paid for subscription ${subscriptionId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.error('Invoice payment failed:', invoice.id);

  // TODO: Notify customer, attempt retry
  const customerId = invoice.customer as string;
  console.error(`Payment failed for customer ${customerId}`);
  // Send payment failure notification
}

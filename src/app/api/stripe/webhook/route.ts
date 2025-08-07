import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-07-30.basil',
});

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const buf = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook Error: ${errorMessage}`);
    return NextResponse.json({ message: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const userId = checkoutSession.metadata?.userId;
      const customerId = checkoutSession.customer as string;
      const subscriptionId = checkoutSession.subscription as string;

      if (userId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
        
        // Save stripeCustomerId and stripePriceId to user
        await prisma.user.update({
            where: { id: userId },
            data: {
                stripeCustomerId: customerId,
                stripePriceId: subscription.items.data[0].price.id,
            }
        });

        // Create a new subscription record
        await prisma.subscription.create({
          data: {
            user: { connect: { id: userId } },
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: typeof subscription.current_period_end === 'number' ? new Date(subscription.current_period_end * 1000) : null,
          },
        });
      }
      break;
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionIdFromInvoice = invoice.subscription as string;

      if (subscriptionIdFromInvoice) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionIdFromInvoice) as Stripe.Subscription;
        const user = await prisma.user.findFirst({
            where: { subscriptions: { some: { stripeSubscriptionId: subscription.id } } },
        });

        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    stripePriceId: subscription.items.data[0].price.id,
                }
            });
        }

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: typeof subscription.current_period_end === 'number' ? new Date(subscription.current_period_end * 1000) : null,
          },
        });
      }
      break;
    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object as Stripe.Subscription;
      const user = await prisma.user.findFirst({
        where: { subscriptions: { some: { stripeSubscriptionId: subscriptionDeleted.id } } },
      });

      if (user) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                stripePriceId: null,
            }
        });
      }

      await prisma.subscription.delete({
        where: { stripeSubscriptionId: subscriptionDeleted.id },
      });
      break;
    // Handle other event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

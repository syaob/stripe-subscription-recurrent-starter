import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-07-30.basil',
});

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json({ message: 'Subscription ID is required' }, { status: 400 });
    }

    // Cancel the subscription in Stripe
    const canceledSubscription = await stripe.subscriptions.cancel(
      subscriptionId
    );

    // Update the user's stripePriceId in the database to null
    const user = await prisma.user.findFirst({
      where: { subscriptions: { some: { stripeSubscriptionId: subscriptionId } } },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripePriceId: null,
        },
      });
    }

    return NextResponse.json({ message: 'Subscription canceled successfully', canceledSubscription });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json({ message: error.message || 'Error canceling subscription' }, { status: 500 });
  }
}

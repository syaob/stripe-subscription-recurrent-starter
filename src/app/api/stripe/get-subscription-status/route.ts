import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-07-30.basil',
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.stripeSubscriptionId) {
    return NextResponse.json({ message: 'Not authenticated or no subscription ID' }, { status: 401 });
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(session.user.stripeSubscriptionId);
    return NextResponse.json({ status: subscription.status });
  } catch (error: any) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json({ message: error.message || 'Error fetching subscription status' }, { status: 500 });
  }
}

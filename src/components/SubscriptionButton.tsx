'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

interface SubscriptionButtonProps {
  priceId: string;
}

export default function SubscriptionButton({ priceId }: SubscriptionButtonProps) {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (status === 'unauthenticated') {
      alert('Veuillez vous connecter pour vous abonner.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      console.log('API Response Status:', response.status);
      console.log('API Response OK:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        alert(errorData.message || 'Échec de la création de la session de paiement (erreur API).');
        return;
      }

      const data = await response.json();
      console.log('API Response Data:', data);

      if (data.sessionId) {
        const stripe = await stripePromise;
        if (stripe) {
          stripe.redirectToCheckout({ sessionId: data.sessionId });
        }
      } else {
        console.error('Failed to create checkout session:', data.message);
        alert(data.message || 'Échec de la création de la session de paiement.');
      }
    } catch (error: unknown) {
      console.error('Error during subscription:', error.message || error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading || status === 'loading'}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      {loading ? 'Traitement...' : "S'abonner"}
    </button>
  );
}

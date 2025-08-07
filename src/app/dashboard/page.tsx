'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { plans } from '@/lib/stripe/plans';

export default function DashboardPage() {
  const { data: session, status, update } = useSession();
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState("Loading...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }

    const fetchSubscriptionStatus = async () => {
      if (session?.user?.stripePriceId && session?.user?.stripeSubscriptionId) {
        const userPlan = plans.find(
          (plan) => plan.priceId === session.user.stripePriceId
        );
        setCurrentPlan(userPlan);

        try {
          const response = await fetch('/api/stripe/get-subscription-status');
          if (response.ok) {
            const data = await response.json();
            setSubscriptionStatus(data.status);
          } else {
            console.error('Failed to fetch subscription status');
            setSubscriptionStatus("Error fetching status");
          }
        } catch (error) {
          console.error('Error fetching subscription status:', error);
          setSubscriptionStatus("Error fetching status");
        }
      } else {
        setCurrentPlan(null);
        setSubscriptionStatus("No active subscription");
      }
    };

    if (status === 'authenticated') {
      fetchSubscriptionStatus();
    }
  }, [session, status]);

  const handleCancelSubscription = async (subscriptionId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (response.ok) {
        alert('Abonnement annulé avec succès!');
        update(); // Refresh the session
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erreur lors de l\'annulation de l\'abonnement.');
      }
    } catch (error: any) {
      alert(error.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
        Espace Client
      </h1>

      <div className="bg-white rounded-lg shadow-lg p-8 w-full md:w-2/3 lg:w-1/2">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Mon Abonnement
        </h2>
        {currentPlan ? (
          <div>
            <p className="text-lg text-gray-700 mb-2">
              Plan actuel: <span className="font-semibold">{currentPlan.name}</span>
            </p>
            <p className="text-lg text-gray-700 mb-2">
              Prix: <span className="font-semibold">{currentPlan.price}€/mois</span>
            </p>
            <p className="text-lg text-gray-700 mb-4">
              Statut: <span className="font-semibold capitalize">{subscriptionStatus}</span>
            </p>
            {subscriptionStatus === "active" && (
              <button
                onClick={() => handleCancelSubscription(session?.user?.stripeSubscriptionId as string)}
                disabled={loading}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {loading ? 'Annulation...' : 'Annuler l\'abonnement'}
              </button>
            )}
          </div>
        ) : (
          <p className="text-lg text-gray-700">
            Vous n'avez pas d'abonnement actif.
          </p>
        )}
      </div>
    </div>
  );
}

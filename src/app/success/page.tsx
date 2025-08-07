'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SuccessPage() {
  const { update } = useSession();

  useEffect(() => {
    // Force a session update to refresh user data
    update();
  }, [update]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Abonnement Réussi !</h2>
        <p className="mt-2 text-sm text-gray-600">
          Votre abonnement a été traité avec succès. Merci pour votre achat !
        </p>
        <div className="mt-5">
          <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">Aller au tableau de bord</Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 items-center text-center">
        <h1 className="text-4xl font-bold">
          Bienvenue sur notre service d&apos;abonnement
        </h1>
        <p className="text-lg text-gray-600">
          Accédez à du contenu exclusif en vous abonnant à l&apos;un de nos
          plans.
        </p>

        {session ? (
          <div className="flex flex-col gap-4 items-center">
            <p>Bienvenue, {session.user?.name} !</p>
            <Link
              href="/subscribe"
              className="rounded-full bg-foreground text-background px-5 py-3 font-medium hover:bg-gray-800"
            >
              Voir les plans d&apos;abonnement
            </Link>
          </div>
        ) : (
          <>
            <div className="flex gap-4 items-center">
              <Link
                href="/auth/signin"
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] px-5 py-3 font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Se connecter
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-foreground text-background px-5 py-3 font-medium hover:bg-gray-800"
              >
                S&apos;inscrire
              </Link>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {/* Plan 1 */}
              <div className="border border-gray-200 rounded-lg p-6 text-left">
                <h2 className="text-2xl font-bold mb-4">Plan Basique</h2>
                <p className="text-gray-700 mb-4">
                  Accès aux fonctionnalités essentielles.
                </p>
                <p className="text-3xl font-bold mb-4">10€ / mois</p>
                <Link
                  href="/auth/signup"
                  className="block w-full text-center rounded-full bg-blue-600 text-white px-5 py-3 font-medium hover:bg-blue-700"
                >
                  Choisir le Plan Basique
                </Link>
              </div>

              {/* Plan 2 */}
              <div className="border border-gray-200 rounded-lg p-6 text-left">
                <h2 className="text-2xl font-bold mb-4">Plan Premium</h2>
                <p className="text-gray-700 mb-4">
                  Débloquez toutes les fonctionnalités avancées.
                </p>
                <p className="text-3xl font-bold mb-4">25€ / mois</p>
                <Link
                  href="/auth/signup"
                  className="block w-full text-center rounded-full bg-green-600 text-white px-5 py-3 font-medium hover:bg-green-700"
                >
                  Choisir le Plan Premium
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="text-center text-sm text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} Notre Société. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}

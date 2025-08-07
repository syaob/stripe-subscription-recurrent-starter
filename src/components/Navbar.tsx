'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold cursor-pointer">Mon App</Link>
        <div className="space-x-4">
          <Link href="/subscribe" className="hover:text-gray-300 cursor-pointer">S&apos;abonner</Link>
          {session ? (
            <>
              <span className="text-gray-300">Bienvenue, {session.user?.email}</span>
              <button
                onClick={() => signOut()}
                className="hover:text-gray-300 cursor-pointer"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="hover:text-gray-300 cursor-pointer">Se connecter</Link>
              <Link href="/auth/signup" className="hover:text-gray-300 cursor-pointer">S&apos;inscrire</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

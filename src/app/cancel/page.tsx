import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Paiement Annulé</h2>
        <p className="mt-2 text-sm text-gray-600">
          Votre paiement a été annulé. Vous pouvez réessayer ou contacter le support si vous rencontrez des problèmes.
        </p>
        <div className="mt-5">
          <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">Retour à l&apos;accueil</Link>
        </div>
      </div>
    </div>
  );
}

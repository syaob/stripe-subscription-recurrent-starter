import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { plans } from "@/lib/stripe/plans";
import SubscriptionButton from "@/components/SubscriptionButton";

export default async function SubscribePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect("/auth/signin");
  }

  const userStripePriceId = session.user?.stripePriceId;
  const userPlan = userStripePriceId
    ? plans.find((plan) => plan.priceId === userStripePriceId)
    : null;

  const availablePlans = userPlan
    ? plans.filter((plan) => plan.level > userPlan.level)
    : plans;

  if (userPlan && availablePlans.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
          Vous avez déjà le meilleur plan !
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Merci de votre confiance. Vous pouvez gérer votre abonnement depuis
          <a href="/dashboard" className="text-blue-600 hover:underline ml-1">votre espace client</a>.
        </p>
        <a href="/" className="text-blue-600 hover:underline">
          Retour à l'accueil
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {userPlan && (
        <>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Votre plan actuel</h1>
          <div className="bg-blue-100 border-2 border-blue-500 rounded-lg shadow-lg p-8 w-full md:w-96 mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              {userPlan.name}
            </h2>
            <ul className="text-gray-700 mb-6">
              {userPlan.features.map((feature, i) => (
                <li key={i} className="flex items-center mb-2">
                  <svg
                    className="w-4 h-4 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <p className="text-4xl font-extrabold text-blue-800 mb-6">
              {userPlan.price}€
              <span className="text-xl font-medium text-blue-600">/mois</span>
            </p>
            <p className="text-blue-700 font-bold">Vous avez déjà ce plan.</p>
          </div>
        </>
      )}

      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 mt-8">
        {userPlan ? "Plans supérieurs disponibles" : "Choisissez votre plan"}
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        {availablePlans.map((plan) => (
          <div
            key={plan.priceId}
            className="bg-white rounded-lg shadow-lg p-8 w-full md:w-96"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {plan.name}
            </h2>
            <ul className="text-gray-600 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center mb-2">
                  <svg
                    className="w-4 h-4 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <p className="text-4xl font-extrabold text-gray-900 mb-6">
              {plan.price}€
              <span className="text-xl font-medium text-gray-500">/mois</span>
            </p>
            <SubscriptionButton priceId={plan.priceId} />
          </div>
        ))}
      </div>
    </div>
  );
}

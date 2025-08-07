import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      stripePriceId?: string | null;
      stripeSubscriptionId?: string | null;
    };
  }

  interface User {
    id: string;
    stripePriceId?: string | null;
    stripeSubscriptionId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    stripePriceId?: string | null;
    stripeSubscriptionId?: string | null;
  }
}

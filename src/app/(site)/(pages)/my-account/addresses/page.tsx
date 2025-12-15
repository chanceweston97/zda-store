'use client';

import { useSession } from 'next-auth/react';
import { BillingAddress } from './_components/billing-address';
import { ShippingAddress } from './_components/shipping-address';

export default function Page() {
  const { data: session } = useSession();

  return (
    <main className="grid sm:grid-cols-2 gap-7.5 w-full">
      <ShippingAddress userId={session?.user.id} />

      <BillingAddress userId={session?.user.id} />
    </main>
  );
}

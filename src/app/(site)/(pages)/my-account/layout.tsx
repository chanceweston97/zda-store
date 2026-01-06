import Breadcrumb from '@/components/Common/Breadcrumb';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import Sidebar from './_component/sidebar';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'My Account | ZDA Communications',
  description: 'This is My Account page for ZDAComm Template',
  // other metadata
};

export default async function Layout({ children }: PropsWithChildren) {
  const session = await getServerSession(authOptions);

  // Redirect to signin if user is not authenticated
  if (!session) {
    redirect('/signin');
  }

  return (
    <>
      <Breadcrumb title={'My Account'} pages={['my account']} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            <Sidebar />
            {children}
          </div>
        </div>
      </section>
    </>
  );
}

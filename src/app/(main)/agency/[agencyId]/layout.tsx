import Sidebar from '@/components/sidebar';
import Unauthorized from '@/components/unauthorized';
import {
  getNotificationAndUser,
  verifyAndAcceptInvitation,
} from '@/lib/queries';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

type Props = {
  children: React.ReactNode;
  params: { agencyId: string };
};

const layout = async ({ children, params }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();
  const user = await currentUser();

  if (!user) {
    return redirect('/');
  }

  if (!agencyId) {
    return redirect('/agency');
  }

  if (
    user.privateMetadata.role !== 'AGENCY_OWNER' &&
    user.privateMetadata.role !== 'AGENCY_ADMIN'
  )
    return <Unauthorized />;

  let allNoti: any = [];

  const notificaitons = await getNotificationAndUser(agencyId);

  if (notificaitons) allNoti = notificaitons;

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={params.agencyId} type="agency" />
      <div className="md:pl-[300px]">{children}</div>
    </div>
  );
};

export default layout;
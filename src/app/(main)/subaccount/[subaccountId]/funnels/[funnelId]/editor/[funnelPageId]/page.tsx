import { db } from '@/lib/db';
import EditorProvider from '@/provider/editor/editor-provider';
import { redirect } from 'next/navigation';
import React from 'react';

type Props = {
  params: {
    subaccountId: string;
    funnelId: string;
    funnelPageId: string;
  };
};

const EditorFunnelPage = async ({ params }: Props) => {
  const funnelpageDetails = await db.funnelPage.findFirst({
    where: {
      id: params.funnelPageId,
    },
  });

  if (!funnelpageDetails)
    return redirect(
      `/subaccount/${params.subaccountId}/funnels/${params.funnelId}`
    );

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-[20] bg-background overflow-hidden">
      <EditorProvider
        funnelId={params.funnelId}
        subaccountId={params.subaccountId}
        pageDetails={funnelpageDetails}
      >
        <div></div>
      </EditorProvider>
    </div>
  );
};

export default EditorFunnelPage;

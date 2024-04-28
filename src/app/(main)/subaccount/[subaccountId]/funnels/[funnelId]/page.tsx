import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFunnel } from '@/lib/queries';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';
import FunnelForm from '@/components/forms/funnel-form';
import FunnelSteps from './_components/funnel-steps';

type Props = {
  params: {
    funnelId: string;
    subaccountId: string;
  };
};

const FunnelPage = async ({ params }: Props) => {
  const funnelPages = await getFunnel(params.funnelId);
  if (!funnelPages)
    return redirect(`/subaccount/${params.subaccountId}/funnels`);

  return (
    <div>
      <Link
        href={`/subaccount/${params.subaccountId}/funnels`}
        className="flex items-center gap-2 mb-4 text-muted-foreground"
      >
        <ChevronLeft size={15} /> Back
      </Link>
      <h1 className="text-3xl mb-8">{funnelPages.name}</h1>
      <Tabs defaultValue="steps" className="w-full">
        <TabsList className="grid  grid-cols-2 w-[50%] bg-transparent ">
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="steps">
          <FunnelSteps
            funnel={funnelPages}
            subaccountId={params.subaccountId}
            pages={funnelPages.FunnelPages}
            funnelId={params.funnelId}
          />
        </TabsContent>
        <TabsContent value="settings">
          <div className="flex gap-4 flex-col xl:!flex-row">
            <FunnelForm
              subAccountId={params.subaccountId}
              defaultData={funnelPages}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FunnelPage;

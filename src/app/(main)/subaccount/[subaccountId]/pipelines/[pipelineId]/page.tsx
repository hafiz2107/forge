import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/db';
import {
  getLanesWithTicketAndTags,
  getPipelineDetails,
  updateLanesOrder,
  updateTicketOrder,
} from '@/lib/queries';
import { LaneDetail } from '@/lib/types';
import { redirect } from 'next/navigation';
import React from 'react';
import PipelineInfoBar from '../_components/pipeline-infobar';
import PipelineSettings from '../_components/pipeline-settings';
import PipelineView from '../_components/pipeline-view';

type Props = {
  params: { pipelineId: string; subaccountId: string };
};

const Pipeline = async ({ params }: Props) => {
  const pipelineDetails = await getPipelineDetails(params.pipelineId);
  if (!pipelineDetails)
    return redirect(`/subaccount/${params.subaccountId}/pipelines`);

  const pipelines = await db.pipeline.findMany({
    where: {
      subAccountId: params.subaccountId,
    },
  });

  const lanes = (await getLanesWithTicketAndTags(
    params.pipelineId
  )) as LaneDetail[];

  return (
    <Tabs defaultValue="view" className="w-full">
      <TabsList className="bg-transparent border-b-2 h-16 w-full justify-between mb-4">
        <PipelineInfoBar
          pipelineId={params.pipelineId}
          subAccountId={params.subaccountId}
          pipelines={pipelines}
        />
        <div className="rounded-md bg-black dark:bg-white">
          <TabsTrigger value="view">Pipeline view</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="view">
        <PipelineView
          lanes={lanes}
          pipelineDetails={pipelineDetails}
          pipelineId={params.pipelineId}
          subaccountId={params.subaccountId}
          updateLanesOrder={updateLanesOrder}
          updateTicketOrder={updateTicketOrder}
        />
      </TabsContent>
      <TabsContent value="settings">
        <PipelineSettings
          pipelineId={params.pipelineId}
          pipelines={pipelines}
          subaccountId={params.subaccountId}
        />
      </TabsContent>
    </Tabs>
  );
};

export default Pipeline;

import SomethingWrong from '@/components/error/something-wrong';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import React from 'react';

type Props = {
  params: {
    subaccountId: string;
  };
};

const Pipeline = async ({ params }: Props) => {
  const pipelineExist = await db.pipeline.findFirst({
    where: {
      subAccountId: params.subaccountId,
    },
  });

  if (pipelineExist)
    return redirect(
      `/subaccount/${params.subaccountId}/pipelines/${pipelineExist.id}`
    );

  try {
    const response = await db.pipeline.create({
      data: {
        name: 'First pipeline',
        subAccountId: params.subaccountId,
      },
    });
    return redirect(
      `/subaccount/${params.subaccountId}/pipelines/${response.id}`
    );
  } catch (err) {
    return <SomethingWrong />;
  }
};

export default Pipeline;

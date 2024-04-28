'use client';
import React, { useState } from 'react';
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Funnel } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface FunnelProductsTableProps {
  defaultData: Funnel;
  products: any[];
}

const FunnelProductsTable: React.FC<FunnelProductsTableProps> = ({
  products,
  defaultData,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [liveProducts, setLiveProducts] = useState<
    { productId: string; recurring: boolean }[] | []
  >(JSON.parse(defaultData.liveProducts || '[]'));

  const handleSaveProducts = async () => {
    console.log('Not implemented');
  };

  const handleAddProduct = async () => {
    console.log('Not implemented');
  };
  return (
    <>
      <Table className="bg-card border-[1px] border-border rounded-md">
        <TableHeader className="rounded-md">
          <TableRow>
            <TableHead>Live</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Interval</TableHead>
            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <Button
        disabled={isLoading}
        onClick={handleSaveProducts}
        className="mt-4"
      >
        Save Products
      </Button>
    </>
  );
};

export default FunnelProductsTable;

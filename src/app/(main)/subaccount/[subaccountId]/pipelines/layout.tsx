import BlurPage from '@/components/global/blur-page';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const Layouot = ({ children }: Props) => {
  return <BlurPage>{children}</BlurPage>;
};

export default Layouot;

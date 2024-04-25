import ClerkClientProvider from '@/provider/clerk-provider';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <ClerkClientProvider>{children}</ClerkClientProvider>;
};

export default Layout;

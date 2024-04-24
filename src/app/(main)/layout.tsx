import ClerkClientProvider from '@/provider/ClerkProvider';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <ClerkClientProvider>{children}</ClerkClientProvider>;
};

export default Layout;

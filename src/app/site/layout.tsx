import Navigation from '@/components/site/navigation';
import ClerkClientProvider from '@/provider/clerk-provider';

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkClientProvider>
      <main className="h-full">
        <Navigation />
        {children}
      </main>
    </ClerkClientProvider>
  );
};

export default layout;

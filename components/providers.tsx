'use client';

import { AutumnProvider } from 'autumn-js/react';
import { QueryProvider } from '@/lib/providers/query-provider';
import { AutumnCustomerProvider } from '@/hooks/useAutumnCustomer';
import { useSession } from '@/lib/auth-client';
import { ThemeProvider } from '@/context/theme-provider';

function AuthAwareAutumnProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  
  // Only render AutumnProvider when logged in
  if (!session) {
    return <>{children}</>;
  }
  
  return (
    <AutumnProvider
      backendUrl="/api/auth/autumn"
      betterAuthUrl={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
      allowAnonymous={false}
      skipInitialFetch={false}
    >
      <AutumnCustomerProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </AutumnCustomerProvider>
    </AutumnProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthAwareAutumnProvider>
        {children}
      </AuthAwareAutumnProvider>
    </QueryProvider>
  );
}
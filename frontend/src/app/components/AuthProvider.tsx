"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider
      // Disable refetch on window focus to prevent unnecessary API calls
      refetchOnWindowFocus={false}
      // Set a reasonable refetch interval
      refetchInterval={5 * 60} // 5 minutes
    >
      {children}
    </SessionProvider>
  );
}

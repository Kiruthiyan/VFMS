"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

import { getAppQueryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/auth-store";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => getAppQueryClient());
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (hydrated && !accessToken) {
      queryClient.clear();
    }
  }, [accessToken, hydrated, queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

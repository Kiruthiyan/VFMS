import { QueryClient } from "@tanstack/react-query";

let appQueryClient: QueryClient | null = null;

export function getAppQueryClient() {
  if (!appQueryClient) {
    appQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 2 * 60 * 1000,
          gcTime: 10 * 60 * 1000,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });
  }

  return appQueryClient;
}

export function invalidateQueriesForMutation(url?: string) {
  if (!url || !appQueryClient) return;

  const path = url.startsWith("http") ? new URL(url).pathname : url.split("?")[0];
  const normalizedPath = path.startsWith("/api") ? path : `/api${path.startsWith("/") ? "" : "/"}${path}`;

  if (normalizedPath.includes("/vehicles")) {
    void appQueryClient.invalidateQueries({ queryKey: ["vehicles"] });
    void appQueryClient.invalidateQueries({ queryKey: ["vehicle"] });
    void appQueryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  }

  if (normalizedPath.includes("/rentals")) {
    void appQueryClient.invalidateQueries({ queryKey: ["rentals"] });
    void appQueryClient.invalidateQueries({ queryKey: ["rental"] });
    void appQueryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  }

  if (normalizedPath.includes("/maintenance")) {
    void appQueryClient.invalidateQueries({ queryKey: ["maintenance"] });
    void appQueryClient.invalidateQueries({ queryKey: ["maintenance-request"] });
    void appQueryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  }

  if (normalizedPath.includes("/vendors")) {
    void appQueryClient.invalidateQueries({ queryKey: ["vendors"] });
    void appQueryClient.invalidateQueries({ queryKey: ["vendor"] });
  }

  if (normalizedPath.includes("/admin/users")) {
    void appQueryClient.invalidateQueries({ queryKey: ["admin-users"] });
    void appQueryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  }

  if (normalizedPath.includes("/admin/employee-registry")) {
    void appQueryClient.invalidateQueries({ queryKey: ["employee-registry"] });
    void appQueryClient.invalidateQueries({ queryKey: ["admin-users"] });
  }

  if (normalizedPath.includes("/drivers") || normalizedPath.includes("/driver/")) {
    void appQueryClient.invalidateQueries({ queryKey: ["drivers"] });
    void appQueryClient.invalidateQueries({ queryKey: ["driver"] });
    void appQueryClient.invalidateQueries({ queryKey: ["driver-profile"] });
    void appQueryClient.invalidateQueries({ queryKey: ["driver-certifications"] });
    void appQueryClient.invalidateQueries({ queryKey: ["driver-documents"] });
    void appQueryClient.invalidateQueries({ queryKey: ["driver-licenses"] });
    void appQueryClient.invalidateQueries({ queryKey: ["driver-leaves"] });
    void appQueryClient.invalidateQueries({ queryKey: ["driver-infractions"] });
  }

  if (normalizedPath.includes("/trips")) {
    void appQueryClient.invalidateQueries({ queryKey: ["trips"] });
    void appQueryClient.invalidateQueries({ queryKey: ["trip"] });
    void appQueryClient.invalidateQueries({ queryKey: ["trip-calendar"] });
    void appQueryClient.invalidateQueries({ queryKey: ["vehicles"] });
    void appQueryClient.invalidateQueries({ queryKey: ["rentals"] });
    void appQueryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  }

  if (normalizedPath.includes("/fuel")) {
    void appQueryClient.invalidateQueries({ queryKey: ["fuel-records"] });
    void appQueryClient.invalidateQueries({ queryKey: ["fuel-record"] });
    void appQueryClient.invalidateQueries({ queryKey: ["fuel-metadata"] });
  }
}

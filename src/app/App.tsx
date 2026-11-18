import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { HealthStatus } from "./HealthStatus";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <h1>AtomicTasks</h1>
        <HealthStatus />
      </main>
    </QueryClientProvider>
  );
}

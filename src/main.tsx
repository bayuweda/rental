import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./features/auth/AuthProvider";
import { ToastProvider } from "./components/ui/toast";
import { ConfigGuard } from "./components/layout/ConfigGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfigGuard>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ConfigGuard>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
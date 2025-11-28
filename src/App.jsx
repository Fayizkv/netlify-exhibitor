import "./App.css";
import PageRouter from "./components/router";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Toast, { ToastProvider } from "./components/core/toast";
import { UserProvider } from "./contexts/UserContext.jsx";
import { MessageProvider } from "./components/core/message/useMessage.jsx";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Global defaults for all queries
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Don't refetch on mount if data exists
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
    },
  });

  const isValidGoogleClientId = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const pattern = /^\d{12}-[a-z0-9]{32}\.apps\.googleusercontent\.com$/;
    return clientId && pattern.test(clientId);
  };

  const content = (
    <UserProvider>
      <PageRouter />
    </UserProvider>
  );

  return (
    <ToastProvider>
      <MessageProvider>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            {isValidGoogleClientId ? <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>{content}</GoogleOAuthProvider> : content}
          </QueryClientProvider>
          <Toast />
        </I18nextProvider>
      </MessageProvider>
    </ToastProvider>
  );
}
export default App;

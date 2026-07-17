import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './routes/AppRouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          success: {
            style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
          },
          error: {
            style: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' },
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
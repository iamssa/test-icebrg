import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './AuthProvider';
import { LoginForm } from './components/LoginForm.tsx';
import { Autocomplete } from "./components/Autocomplete.tsx";

const queryClient = new QueryClient();

const SearchPage = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="container h-screen p-4 flex flex-col items-center justify-center">
            {isAuthenticated ? (
                <div className="w-5/12 mx-auto">
                    <h1 className="text-2xl font-bold mb-4">Search</h1>
                    <Autocomplete placeholder="Start typing to search..." />
                </div>
            ) : (
                <LoginForm />
            )}
        </div>
    );
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <div className="min-h-screen bg-gray-50 place-items-center">
                    <SearchPage />
                </div>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;

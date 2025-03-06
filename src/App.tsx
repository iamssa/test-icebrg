import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './AuthProvider';
import { LoginForm } from './LoginForm';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <div className="min-h-screen bg-gray-50 place-items-center">
                    <div className="container h-screen p-4 flex flex-col items-center justify-center">
                        <LoginForm/>
                    </div>
                </div>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useLogin, useRefreshToken } from './services/apiService.ts';
import { isTokenExpired, shouldRefreshToken } from './services/tokenService.ts';

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshToken: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [error, setError] = useState<string | null>(null);
    const loginMutation = useLogin();
    const refreshTokenMutation = useRefreshToken();

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            const data = await loginMutation.mutateAsync({ email, password });

            setToken(data.access_token || null);

            data.access_token && localStorage.setItem('token', data.access_token);
            data.refresh_token && localStorage.setItem('refreshToken', data.refresh_token);
        } catch (err) {
            setError('Authentication failed. Please check your credentials.');
            throw err;
        }
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    };

    const refreshToken = async () => {
        try {
            const data = await refreshTokenMutation.mutateAsync();

            setToken(data.access_token || null);

            data.access_token && localStorage.setItem('token', data.access_token);
            data.refresh_token && localStorage.setItem('refreshToken', data.refresh_token);
        } catch (err) {
            setError('Failed to refresh token. Please login again.');
            logout();
            throw err;
        }
    };

    useEffect(() => {
        const checkAndRefreshToken = async () => {
            if (!token) {
                return;
            }

            if (isTokenExpired(token)) {
                logout();
                setError('Your session has expired. Please login again.');
                return;
            }

            if (shouldRefreshToken(token)) {
                try {
                    await refreshToken();
                } catch (err) {
                    console.error('Failed to auto-refresh token:', err);
                }
            }
        };

        checkAndRefreshToken();

        const intervalId = setInterval(checkAndRefreshToken, 60000);

        return () => {
            clearInterval(intervalId);
        };
    }, [token]);

    return (
        <AuthContext.Provider
            value={{
                token,
                isAuthenticated: !!token,
                login,
                logout,
                refreshToken,
                error
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

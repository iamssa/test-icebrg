import {useMutation, useQuery} from '@tanstack/react-query';

const API_BASE_URL = 'https://icebrg.mehanik.me/api';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
};

export const useLogin = () => {
    return useMutation({
        mutationFn: async (credentials: { email: string; password: string }) => {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            return response.json();
        }
    });
};

export const useRefreshToken = () => {
    return useMutation({
        mutationFn: async () => {
            const response = await fetchWithAuth('/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({refresh_token: localStorage.getItem('refreshToken')}),
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            return response.json();
        }
    });
};

// Хук для получения подсказок автозаполнения через POST запрос
export const useSearchSuggestions = () => {
    return useMutation({
        mutationFn: async (query: string) => {
            if (!query || query.trim().length < 2) return [];

            return fetchWithAuth('/search', {
                method: 'POST',
                body: JSON.stringify({ query: query.trim() })
            });
        }
    });
};

// Альтернативный хук с useQuery для кеширования по queryKey
export const useCachedSearchSuggestions = (query: string, enabled: boolean = false) => {
    const searchMutation = useSearchSuggestions();

    return useQuery({
        queryKey: ['search', query],
        queryFn: () => searchMutation.mutateAsync(query),
        enabled: enabled && query.trim().length >= 2,
        staleTime: 30000, // 30 секунд
    });
};

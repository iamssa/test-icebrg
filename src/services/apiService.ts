import {useMutation, useQuery} from '@tanstack/react-query';
import {Api, SearchResponse} from "../types/apiTypes.ts";

interface SecurityData {
    access_token: string;
}

const BASE_URL = 'https://icebrg.mehanik.me/';
const token = localStorage.getItem('token');
const client = new Api<SecurityData>({
    baseUrl: BASE_URL,
    securityWorker: (data) =>
        data ? { headers: { Authorization: `Bearer ${data.access_token}` } } : {},
});

if (token) {
    client.setSecurityData({access_token: token})
}

export const useLogin = () => {
    return useMutation({
        mutationFn: async (credentials: { email: string; password: string }) => {
            const response = await client.api.postLogin(credentials)

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            if (response.data && response.data.access_token) {
                client.setSecurityData({
                    access_token: response.data.access_token,
                });
            }

            return response.data;
        }
    });
};

export const useRefreshToken = () => {
    return useMutation({
        mutationFn: async () => {
            const refreshToken = localStorage.getItem('refreshToken') || '';
            const response = await client.api.postRefresh({refresh_token: refreshToken})

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            return response.data;
        }
    });
};

export const useSearchSuggestions = (query: string, enabled: boolean = false) => {
    return useQuery<SearchResponse>({
        queryKey: ['search', query],
        queryFn: async () => {
            if (!query || query.trim().length < 2) {
                return {};
            }

            const response = await client.api.postSearch({ query: query.trim() });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            return response.data;
        },
        enabled: enabled && query.trim().length >= 2,
        staleTime: 30000,
    });
};

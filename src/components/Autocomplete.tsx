import React, {useState, useEffect, useRef, useMemo} from 'react';
import { useSearchSuggestions } from '../services/apiService.ts';
import { useAuth } from '../AuthProvider.tsx';
import { useDebounce } from '../hooks/useDebounce.ts';

interface AutocompleteProps {
    placeholder?: string;
}

export const Autocomplete = ({ placeholder = 'Search...'}: AutocompleteProps) => {
    const { isAuthenticated } = useAuth();
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionRef = useRef<HTMLDivElement>(null);

    const debouncedInputValue = useDebounce(inputValue, 300);

    const { data: suggestionsData, isLoading } = useSearchSuggestions(
        debouncedInputValue,
        isAuthenticated && showSuggestions
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value === inputValue) {
            return;
        }

        setInputValue(value);

        if (value.trim().length >= 2) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion?: string) => {
        if (!suggestion) {
            return;
        }

        setInputValue(suggestion);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const suggestionList = useMemo(() => {
        if (!suggestionsData) {
            return [];
        }

        return Object.values(suggestionsData).flat().filter((item) => !!item);
    }, [suggestionsData]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isClickOutside = suggestionRef.current &&
                !suggestionRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)

            if (isClickOutside) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="relative w-full">
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {showSuggestions && (
                <div
                    ref={suggestionRef}
                    className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
                >
                    {isLoading ? (
                        <div className="p-3 text-gray-500">Loading...</div>
                    ) : suggestionList.length > 0 ? (
                        suggestionList.map((suggestion, index) => (
                            <div
                                key={index}
                                className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => handleSuggestionClick(suggestion.name)}
                            >
                                {suggestion.name}
                            </div>
                        ))
                    ) : (
                        <div className="p-3 text-gray-500">No suggestions found</div>
                    )}
                </div>
            )}
        </div>
    );
};

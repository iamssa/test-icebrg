import React, { useState, useEffect, useRef } from 'react';
import { useSearchSuggestions } from './api/apiService.ts';
import { useAuth } from './AuthProvider';
import { useDebounce } from './useDebounce';
import {ContinentModel, CountryModel, LanguageModel} from "./api/apiTypes.ts";

interface AutocompleteProps {
    placeholder?: string;
}

export const Autocomplete = ({ placeholder = 'Search...'}: AutocompleteProps) => {
    const { isAuthenticated } = useAuth();
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionList, setSuggestionList] = useState<ContinentModel[] | CountryModel[] | LanguageModel[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionRef = useRef<HTMLDivElement>(null);

    const debouncedInputValue = useDebounce(inputValue, 300);

    const { data: suggestionsData, isLoading } = useSearchSuggestions(
        debouncedInputValue,
        isAuthenticated && showSuggestions
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        if (value.trim().length >= 2) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
            setSuggestionList([]);
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionRef.current &&
                !suggestionRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!suggestionsData) {
            return;
        }

        const suggestionsFlatArr = Object.values(suggestionsData).flat().filter((item) => !!item);

        setSuggestionList(suggestionsFlatArr);
    }, [suggestionsData]);

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
                onFocus={() => inputValue.trim().length >= 2 && setShowSuggestions(true)}
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

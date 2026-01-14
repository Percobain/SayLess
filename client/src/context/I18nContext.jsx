import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, defaultLanguage, getNestedValue } from '../lib/i18n';

const I18nContext = createContext(null);

const LANGUAGE_STORAGE_KEY = 'sayless_language';
const FIRST_VISIT_KEY = 'sayless_first_visit';

export function I18nProvider({ children }) {
    const [language, setLanguageState] = useState(defaultLanguage);
    const [isFirstVisit, setIsFirstVisit] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize language from localStorage
    useEffect(() => {
        const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);

        if (storedLanguage && translations[storedLanguage]) {
            setLanguageState(storedLanguage);
            setIsFirstVisit(false);
        } else if (!hasVisited) {
            // First visit - show language selection modal
            setIsFirstVisit(true);
        }

        setIsLoading(false);
    }, []);

    // Set language and persist to localStorage
    const setLanguage = useCallback((lang) => {
        if (translations[lang]) {
            setLanguageState(lang);
            localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
            localStorage.setItem(FIRST_VISIT_KEY, 'true');
            setIsFirstVisit(false);
        }
    }, []);

    // Translation function
    const t = useCallback((key, replacements = {}) => {
        const translation = getNestedValue(translations[language], key);

        if (!translation) {
            // Fallback to English if translation not found
            const fallback = getNestedValue(translations[defaultLanguage], key);
            if (!fallback) {
                console.warn(`Translation not found for key: ${key}`);
                return key;
            }
            return processReplacements(fallback, replacements);
        }

        return processReplacements(translation, replacements);
    }, [language]);

    // Process string replacements like {category}
    const processReplacements = (str, replacements) => {
        if (typeof str !== 'string') return str;

        return Object.entries(replacements).reduce((acc, [key, value]) => {
            return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        }, str);
    };

    // Close the first visit modal without selecting language (use default)
    const dismissFirstVisit = useCallback(() => {
        localStorage.setItem(FIRST_VISIT_KEY, 'true');
        setIsFirstVisit(false);
    }, []);

    const value = {
        language,
        setLanguage,
        t,
        isFirstVisit,
        dismissFirstVisit,
        isLoading,
    };

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}

export default I18nContext;

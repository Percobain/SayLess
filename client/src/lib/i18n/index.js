import en from './translations/en';
import hi from './translations/hi';

export const translations = {
    en,
    hi,
};

export const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: 'A' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: 'अ' },
];

export const defaultLanguage = 'en';

// Helper function to get nested translation value
export const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

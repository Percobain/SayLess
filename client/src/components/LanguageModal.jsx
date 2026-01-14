import { Globe } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { languages } from '../lib/i18n';
import NeoCard from './NeoCard';
import NeoButton from './NeoButton';

export default function LanguageModal() {
    const { isFirstVisit, setLanguage, language, t } = useI18n();

    if (!isFirstVisit) return null;

    const handleSelectLanguage = (langCode) => {
        setLanguage(langCode);
    };

    return (
        <div className="fixed inset-0 bg-neo-navy/95 flex items-center justify-center p-4 z-[100]">
            <NeoCard className="max-w-md w-full p-8 animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-neo-orange border-[4px] border-neo-navy flex items-center justify-center mx-auto mb-6">
                        <Globe className="w-10 h-10 text-neo-navy" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-neo-navy mb-2">
                        Choose Your Language
                    </h2>
                    <p className="text-2xl font-heading font-bold text-neo-teal mb-2">
                        अपनी भाषा चुनें
                    </p>
                    <p className="text-neo-navy/60 text-sm">
                        Select your preferred language for the application
                    </p>
                </div>

                {/* Language Options */}
                <div className="space-y-4 mb-8">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelectLanguage(lang.code)}
                            className={`
                w-full p-5 border-[4px] border-neo-navy flex items-center gap-4
                transition-all duration-200 shadow-neo
                hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none
                ${language === lang.code
                                    ? 'bg-neo-orange'
                                    : 'bg-neo-cream hover:bg-neo-teal hover:text-neo-cream'
                                }
              `}
                        >
                            <span className="text-4xl">{lang.flag}</span>
                            <div className="text-left flex-1">
                                <p className="font-heading font-bold text-xl">{lang.nativeName}</p>
                                <p className="text-sm opacity-70">{lang.name}</p>
                            </div>
                            {language === lang.code && (
                                <div className="w-8 h-8 bg-neo-navy flex items-center justify-center">
                                    <svg className="w-5 h-5 text-neo-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Continue Button */}
                <NeoButton
                    variant="orange"
                    size="lg"
                    className="w-full"
                    onClick={() => setLanguage(language)}
                >
                    {language === 'hi' ? 'जारी रखें' : 'Continue'} →
                </NeoButton>

                <p className="text-center text-xs text-neo-navy/50 mt-4">
                    {language === 'hi'
                        ? 'आप बाद में सेटिंग्स में भाषा बदल सकते हैं'
                        : 'You can change language later in settings'
                    }
                </p>
            </NeoCard>
        </div>
    );
}

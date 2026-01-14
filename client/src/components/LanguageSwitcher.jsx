import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { languages } from '../lib/i18n';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useI18n();
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = languages.find(l => l.code === language) || languages[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 border-[2px] border-neo-navy bg-neo-cream
                   font-bold text-sm uppercase tracking-wide transition-all duration-150
                   hover:bg-neo-orange hover:translate-x-[1px] hover:translate-y-[1px]"
            >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{currentLang.flag}</span>
                <span className="hidden md:inline">{currentLang.code.toUpperCase()}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop to close dropdown */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 z-50 border-[3px] border-neo-navy bg-neo-cream shadow-neo">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={`
                  w-full px-4 py-3 flex items-center gap-3 text-left transition-colors
                  hover:bg-neo-orange border-b-[2px] border-neo-navy last:border-b-0
                  ${language === lang.code ? 'bg-neo-teal text-neo-cream' : ''}
                `}
                            >
                                <span className="text-xl">{lang.flag}</span>
                                <div>
                                    <p className="font-bold text-sm">{lang.nativeName}</p>
                                    <p className="text-xs opacity-70">{lang.name}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

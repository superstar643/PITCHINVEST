import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
  countryCode: string;
}

const languages: Language[] = [
  { code: 'pt-BR', name: 'Brazilian Portuguese', nativeName: 'Português (Brasil)', flag: '/assets/flags/BR.png', countryCode: 'BR' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '/assets/flags/ES.png', countryCode: 'ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '/assets/flags/FR.png', countryCode: 'FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '/assets/flags/DE.png', countryCode: 'DE' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '/assets/flags/US.png', countryCode: 'US' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '/assets/flags/CN.png', countryCode: 'CN' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '/assets/flags/JP.png', countryCode: 'JP' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '/assets/flags/RU.png', countryCode: 'RU' },
];

const LanguageSelector: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    // You can add logic here to change the app language
    // For example: i18n.changeLanguage(value);
    console.log('Language changed to:', value);
  };

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage);

  return (
    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[200px] border-gray-300">
        <SelectValue>
          <div className="flex items-center gap-2">
            <img src={currentLanguage?.flag} height={16} width={24} />
            <span className="text-sm text-gray-700">{currentLanguage?.name}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">
              <img src={lang.flag} height={16} width={24} />
              <div>
                <div className="text-sm font-medium">{lang.name}</div>
                <div className="text-xs text-gray-500">{lang.nativeName}</div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;

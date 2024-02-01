import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const [language, setLanguage] = useState('en');
  const { i18n } = useTranslation();

  const handleLanguageChange = () => {
    const updateLan = language === 'en' ? 'se' : 'en';
    setLanguage(updateLan);
    i18n.changeLanguage(updateLan);
  };

  return (
    <button className="text-white" onClick={handleLanguageChange}>
      {language === 'en' ? 'Svenska' : 'English'}
    </button>
  );
}

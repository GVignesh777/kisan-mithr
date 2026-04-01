import useLanguageStore from "../store/useLanguageStore";
import translations from "../utils/translations";

const useTranslation = () => {
  const { language } = useLanguageStore();

  const t = (key) => {
    // Allows nested keys like "dropdownContact.contactHeading"
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value === undefined || value === null) break;
      value = value[k];
    }

    // Default to english fallback or just the key string if not found
    if (value === undefined || value === null) {
        let fallbackValue = translations['en'];
        for (const k of keys) {
            if (fallbackValue === undefined || fallbackValue === null) break;
            fallbackValue = fallbackValue[k];
        }
        return fallbackValue !== undefined && fallbackValue !== null ? fallbackValue : key;
    }
    
    return value;
  };

  return { t, language };
};

export default useTranslation;
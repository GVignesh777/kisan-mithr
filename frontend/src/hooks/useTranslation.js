import useLanguageStore from "../store/useLanguageStore";
import translations from "../utils/translations";

const useTranslation = () => {
  const { language } = useLanguageStore();

  const t = (key) => {
    return translations[language][key] || key;
  };

  return { t };
};

export default useTranslation;
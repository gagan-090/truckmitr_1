import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import hi from './locales/hi.json';
import hn from './locales/hn.json';
import pa from './locales/pa.json';
import ur from './locales/ur.json';

const LANGUAGE_KEY = '@app_language';

const languageDetector = {
    type: 'languageDetector',
    async: true,
    detect: async (callback: (lng: string) => void) => {
        try {
            const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
            callback(savedLanguage || 'hi');
        } catch (error) {
            console.error('Failed to detect language', error);
            callback('hi');
        }
    },
    init: () => { },
    cacheUserLanguage: async (lng: string) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, lng);
        } catch (error) {
            console.error('Failed to cache language', error);
        }
    }
};

i18n
    .use(languageDetector as any)
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v3',
        fallbackLng: 'en',
        resources: {
            en: { translation: en },
            hi: { translation: hi },
            hn: { translation: hn },
            pa: { translation: pa },
            ur: { translation: ur },
        },
        interpolation: {
            escapeValue: false,
        },
    } as any);

export default i18n;

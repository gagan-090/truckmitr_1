import { Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useColor, useResponsiveScale } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Space } from '@truckmitr/src/app/components';
import { FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { AnimatedFAB } from 'react-native-paper';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function Language() {
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const { i18n } = useTranslation(); // Use translation hook from i18next

    const LANGUAGES = [
        { name: 'हिन्दी', title: i18n.t(`hindi`), code: 'hi', },        // Hindi
        { name: 'English', title: i18n.t(`english`), code: 'en' },      // English
        // { name: 'Hinglish', title: i18n.t(`hinglish`), code: 'hn' },     // Hinglish (custom/mixed language – no native script)
        // { name: 'ਪੰਜਾਬੀ', title: i18n.t(`punjabi`), code: 'pa' },       // Punjabi
        // { name: 'اردو', title: i18n.t(`urdu`), code: 'ur' },         // Urdu
    ];

    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

    useEffect(() => {
        const currentLang = i18n.language;
        const selected = LANGUAGES.find(l => l.code === currentLang);
        if (selected) {
            setSelectedLanguage(selected.name);
        }
    }, []);

    const _selectLanguage = (item: any) => () => {
        setSelectedLanguage(item.name);
        i18n.changeLanguage(item.code);
    }

    const _navigateNextScreen = () => {
        navigation.navigate(STACKS.WELCOME)
    }
    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <Space height={safeAreaInsets.top} />

            <View style={{ flex: 1, paddingHorizontal: responsiveWidth(6), alignItems: 'center', paddingTop: responsiveHeight(5) }}>
                {/* Header Section */}
                <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(3.2), fontWeight: '700', marginBottom: responsiveHeight(1) }}>
                    {i18n.t('welcomeToTruckMitr')}
                </Text>
                <Text style={{ width: responsiveWidth(80), color: colors.blackOpacity(0.6), textAlign: 'center', fontSize: responsiveFontSize(1.8), lineHeight: responsiveFontSize(2.4) }}>
                    {i18n.t('language_description')}
                </Text>

                <Space height={responsiveHeight(4)} />

                {/* Language Selection Grid */}
                <View
                    style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: responsiveWidth(4),
                        flexWrap: 'wrap'
                    }}
                >
                    {LANGUAGES.map(item => {
                        const isSelected = selectedLanguage === item.name;

                        return (
                            <TouchableOpacity
                                key={item.code}
                                onPress={_selectLanguage(item)}
                                activeOpacity={0.8}
                                style={{
                                    width: '45%',
                                    paddingVertical: responsiveHeight(2.5),
                                    paddingHorizontal: responsiveWidth(2),
                                    borderRadius: 16,
                                    backgroundColor: isSelected
                                        ? colors.royalBlue
                                        : colors.white,
                                    borderWidth: 1.5,
                                    borderColor: isSelected
                                        ? colors.royalBlue
                                        : colors.blackOpacity(0.1),
                                    alignItems: 'center',
                                    shadowColor: colors.black,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: isSelected ? 0.3 : 0.05,
                                    shadowRadius: 4,
                                    elevation: isSelected ? 6 : 2,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: responsiveFontSize(2.4),
                                        fontWeight: '700',
                                        color: isSelected ? colors.white : colors.blackOpacity(0.8),
                                        marginBottom: responsiveHeight(0.5)
                                    }}
                                >
                                    {item.name}
                                </Text>

                                <Text
                                    style={{
                                        fontSize: responsiveFontSize(1.6),
                                        color: isSelected
                                            ? colors.whiteOpacity(0.9)
                                            : colors.blackOpacity(0.5),
                                        textAlign: 'center',
                                        fontWeight: '500'
                                    }}
                                >
                                    {item.title}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Space style={{ flex: 1 }} />

                {/* Continue Button */}
                <TouchableOpacity
                    onPress={_navigateNextScreen}
                    activeOpacity={0.8}
                    style={{
                        width: '100%',
                        height: responsiveHeight(6.5),
                        backgroundColor: colors.royalBlue,
                        borderRadius: 100,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: responsiveHeight(3),
                        elevation: 4,
                        shadowColor: colors.royalBlue,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 5
                    }}
                >
                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '600' }}>
                        {i18n.t('next')}
                    </Text>
                </TouchableOpacity>

            </View>

            {/* Footer */}
            <View style={{ backgroundColor: colors.royalBlue }}>
                <Text style={{ color: colors.whiteOpacity(0.8), fontSize: responsiveFontSize(1.4), textAlign: 'center', paddingVertical: responsiveHeight(2) }}>
                    {`© 2026 TruckMitr Corporate Services Private Limited.\nAll Rights Reserved.`}
                </Text>
                <Space height={safeAreaInsets.bottom} />
            </View>

        </View>
    )
}

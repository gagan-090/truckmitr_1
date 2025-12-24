import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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
import { hitSlop } from '@truckmitr/src/app/functions';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;


export default function LanguageMain() {
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const { i18n } = useTranslation(); // Use translation hook from i18next

    const LANGUAGES = [
        { name: 'हिन्दी', title: i18n.t(`hindi`), code: 'hi', },        // Hindi
        { name: 'English', title: i18n.t(`english`), code: 'en' },      // English
        { name: 'Hinglish', title: i18n.t(`hinglish`), code: 'hn' },     // Hinglish (custom/mixed language – no native script)
        { name: 'ਪੰਜਾਬੀ', title: i18n.t(`punjabi`), code: 'pa' },       // Punjabi
        { name: 'اردو', title: i18n.t(`urdu`), code: 'ur' },         // Urdu
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

    const _goback = () => {
        navigation.goBack()
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{i18n.t('language')}</Text>
            </View>
            <Space height={responsiveHeight(2)} />
            <View style={{ width: '100%', padding: responsiveWidth(5), alignItems: 'center' }}>
                <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2.6), fontWeight: '600' }}>
                    {i18n.t('select_language')}
                </Text>
                <Text style={{ width: responsiveWidth(80), color: colors.blackOpacity(.7), textAlign: 'center', marginTop: responsiveFontSize(.5) }}>
                    {i18n.t('language_description')}
                </Text>
                <Space height={responsiveHeight(4)} />
                <FlatList
                    data={LANGUAGES}
                    renderItem={({ item, index }) => {
                        const isSelected = selectedLanguage === item.name;
                        return (
                            <TouchableOpacity
                                onPress={_selectLanguage(item)}
                                style={{
                                    width: '100%',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: isSelected ? colors.royalBlue : colors.royalBlueOpacity(.05),
                                    padding: responsiveFontSize(2),
                                    borderRadius: 10,
                                    marginBottom: responsiveFontSize(2)
                                }}>
                                <Ionicons
                                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                                    size={20}
                                    color={isSelected ? colors.white : colors.royalBlue}
                                />
                                <View>
                                    <Text style={{ marginLeft: 10, fontSize: responsiveFontSize(2), color: isSelected ? colors.white : colors.royalBlue, fontWeight: '500' }}>{item.name}</Text>
                                    <Text style={{ marginLeft: 10, fontSize: responsiveFontSize(1.6), color: isSelected ? colors.whiteOpacity(.9) : colors.royalBlueOpacity(.9), fontWeight: '500' }}>{`${item.title}`}{isSelected ? <Text style={{ fontWeight: '400' }}>{` (device's language)`}</Text> : ``}</Text>
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                    style={{ width: '100%' }}
                    keyExtractor={(item, index) => index.toString()}
                />
                <Space height={responsiveHeight(1)} />
                <Text style={{ width: responsiveWidth(80), color: colors.blackOpacity(.7), fontSize: responsiveFontSize(1.8), fontWeight: '500', textAlign: 'center', marginTop: responsiveFontSize(.5) , textDecorationLine:'underline'}}>
                    {i18n.t('moreLanguagesComingSoon')}
                </Text>
            </View>
            <Space style={{ flex: 1 }} />
            <View style={{ backgroundColor: colors.royalBlue }}>
                <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.6), textAlign: 'center', margin: responsiveFontSize(1.5) }}>
                    {`© 2025 TruckMitr Corporate Services Private Limited. \nAll Rights Reserved.`}
                </Text>
                <Space height={safeAreaInsets.bottom} />
            </View>

        </View>
    )
}

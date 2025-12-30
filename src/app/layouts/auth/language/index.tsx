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
            <Space height={responsiveHeight(7)} />
            <View style={{ width: '100%', padding: responsiveWidth(5), alignItems: 'center' }}>
                <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2.8), fontWeight: '600' }}>
                    {i18n.t('welcomeToTruckMitr')}
                </Text>
                <Text style={{ width: responsiveWidth(80), color: colors.blackOpacity(.7), textAlign: 'center', marginTop: responsiveFontSize(.5) }}>
                    {i18n.t('language_description')}
                </Text>
                <Space height={responsiveHeight(4)} />
                {/* <FlatList
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
                /> */}

                <View
                    style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: responsiveHeight(2),
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
                                    width: '47%',
                                    paddingVertical: responsiveHeight(2.2),
                                    paddingHorizontal: responsiveWidth(3),
                                    borderRadius: 12,
                                    backgroundColor: isSelected
                                        ? colors.royalBlue
                                        : colors.royalBlueOpacity(0.06),
                                    borderWidth: 1,
                                    borderColor: isSelected
                                        ? colors.royalBlue
                                        : colors.royalBlueOpacity(0.3),
                                    alignItems: 'center',
                                }}
                            >
                                {/* Radio Icon */}
                                {/* <Ionicons
                                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                                    size={22}
                                    color={isSelected ? colors.white : colors.royalBlue}
                                    style={{ marginBottom: responsiveHeight(1) }}
                                /> */}

                                {/* Language Name */}
                                <Text
                                    style={{
                                        fontSize: responsiveFontSize(2.2),
                                        fontWeight: '600',
                                        color: isSelected ? colors.white : colors.royalBlue,
                                    }}
                                >
                                    {item.name}
                                </Text>

                                {/* Subtitle */}
                                <Text
                                    style={{
                                        fontSize: responsiveFontSize(1.6),
                                        marginTop: responsiveHeight(0.4),
                                        color: isSelected
                                            ? colors.whiteOpacity(0.9)
                                            : colors.royalBlueOpacity(0.8),
                                        textAlign: 'center',
                                    }}
                                >
                                    {item.title}
                                    {isSelected ? ' (device)' : ''}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

            </View>
            <Space height={responsiveHeight(1)} />
            {/* <Text style={{ width: responsiveWidth(80), color: colors.blackOpacity(.7), fontSize: responsiveFontSize(1.8), fontWeight: '500', textAlign: 'center', marginTop: responsiveFontSize(.5), textDecorationLine: 'underline', alignSelf: 'center' }}>
                {i18n.t('moreLanguagesComingSoon')}
            </Text> */}
            <Space style={{ flex: 1 }} />
            <View style={{ backgroundColor: colors.royalBlue }}>
                <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.6), textAlign: 'center', margin: responsiveFontSize(1.5) }}>
                    {`© 2025 TruckMitr Corporate Services Private Limited. \nAll Rights Reserved.`}
                </Text>
                <Space height={safeAreaInsets.bottom} />
            </View>

            <AnimatedFAB
                icon="chevron-right"
                label=""
                color={colors.white}
                extended={false}
                visible={true}
                onPress={_navigateNextScreen}
                iconMode="static"
                style={{
                    position: 'absolute',
                    bottom: responsiveHeight(12),
                    right: responsiveWidth(5),
                    backgroundColor: colors.royalBlue,
                    elevation: 20
                }}
            />

        </View>
    )
}

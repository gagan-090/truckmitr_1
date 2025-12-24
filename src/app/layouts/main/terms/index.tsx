import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RenderHTML from 'react-native-render-html'
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function Privacy() {
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();

    const [loading, setLoading] = useState(true);
    const [policyContent, setPolicyContent] = useState('');

    useEffect(() => {
        const _fetchPolicy = async () => {
            try {
                setLoading(true);
                const response: any = await axiosInstance.get(END_POINTS?.TERMS_AND_CONDITIONS);
                if (response?.data?.status) {
                    setPolicyContent(response?.data?.data);
                }
            } catch (error) {
                console.error("Error fetching policy:", error);
                // Optionally show error to user
            } finally {
                setLoading(false);
            }
        };

        _fetchPolicy();
    }, []);



    const _goback = () => {
        navigation.goBack();
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{`Term Of Use`}</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Image style={{ height: responsiveHeight(15), width: responsiveWidth(80), tintColor: colors.blackOpacity(.1) }} source={{ uri: 'https://truckmitr.com/public/images/preview.png' }} />
                    <ActivityIndicator size="small" color={colors.royalBlue} />
                    <Space height={responsiveHeight(16)} />
                </View>
            ) :
                <ScrollView contentContainerStyle={{ backgroundColor: colors.white, paddingHorizontal: responsiveWidth(5) }}>
                    <RenderHTML
                        contentWidth={responsiveWidth(100)}
                        source={{ html: policyContent }}
                        baseStyle={{
                            fontSize: responsiveFontSize(1.8),
                            color: colors.black,
                            lineHeight: responsiveFontSize(3),
                            fontFamily: 'System', // or a custom font
                        }}
                        tagsStyles={{
                            p: {
                                marginBottom: responsiveHeight(1.5),
                                fontSize: responsiveFontSize(1.8),
                                color: colors.black,
                            },
                            a: {
                                color: colors.black,
                                textDecorationLine: 'underline',
                                fontWeight: '500',
                            },
                            h1: {
                                fontSize: responsiveFontSize(2.4),
                                fontWeight: 'bold',
                                color: colors.royalBlue,
                                marginTop: responsiveHeight(2),
                                marginBottom: responsiveHeight(1),
                            },
                            h2: {
                                fontSize: responsiveFontSize(2.2),
                                fontWeight: 'bold',
                                color: colors.black,
                                marginTop: responsiveHeight(1.5),
                                marginBottom: responsiveHeight(1),
                            },
                            li: {
                                marginBottom: responsiveHeight(1),
                                fontSize: responsiveFontSize(1.8),
                            },
                            ul: {
                                paddingLeft: responsiveWidth(5),
                                marginBottom: responsiveHeight(2),
                            },
                            strong: {
                                fontWeight: 'bold',
                                color: colors.blackOpacity(.9) || colors.black,
                            },
                            em: {
                                fontStyle: 'italic',
                            },
                        }}
                        enableExperimentalMarginCollapsing={true}
                    />

                </ScrollView>
            }


            <Space height={safeAreaInsets.bottom} />
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
});

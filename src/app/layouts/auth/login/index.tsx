import {
    Text,
    TouchableOpacity,
    View,
    Keyboard,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useColor, useResponsiveScale } from '@truckmitr/src/app/hooks';
import { Space } from '@truckmitr/src/app/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { hitSlop } from '@truckmitr/src/app/functions';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function Login() {
    const { t } = useTranslation();
    const colors = useColor();
    const navigation = useNavigation<NavigatorProp>();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveFontSize, responsiveWidth, responsiveHeight } = useResponsiveScale();
    const [mobile, setMobile] = useState<string>('');
    const [error, seterror] = useState<any>()
    const [loading, setLoading] = useState<boolean>(false);
    const [noBackButton, setnoBackButton] = useState(false)

    const _goback = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    useEffect(() => {
        if (navigation.canGoBack()) {
            setnoBackButton(false)
        } else {
            setnoBackButton(true)
        }
    }, [])

    const imageColorGradient = ['#3D5EE1', '#18A9B3'];

    // Validate mobile number before API call
    const validateMobile = useCallback((): boolean => {
        if (!mobile) {
            seterror(t(`pleaseEnterYourMobileNumber`));
            return false;
        }
        if (!/^[6-9]\d{9}$/.test(mobile)) {
            seterror(t(`mobileNumber_10_digits`));
            return false;
        }
        return true;
    }, [mobile]);

    const _navigateOtp = useCallback(async () => {
        if (!validateMobile()) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('mobile', mobile);
        try {
            const response: any = await axiosInstance.post(END_POINTS.LOGIN, formData);
            if (response?.data?.success) {
                showToast(t(`otpSentSuccessfully`));
                navigation.navigate(STACKS.OTP as any, { formData: { mobile }, flow: 'login' });
            } else {
                seterror(response?.data?.message);
            }
        } catch (error: any) {
            console.log('Login API error:', error);
            showToast(error);
        } finally {
            setLoading(false);
        }
    }, [mobile, navigation, validateMobile]);


    const _navigateSignup = useCallback(() => {
        navigation.navigate(STACKS.SIGNUP);
    }, [navigation]);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.white }}>
                <Space height={safeAreaInsets.top} />
                <View style={{ width: '100%', padding: responsiveWidth(3) }}>
                    <TouchableOpacity
                        disabled={noBackButton}
                        hitSlop={hitSlop(10)}
                        onPress={_goback}
                        style={{
                            height: responsiveFontSize(4),
                            width: responsiveFontSize(4),
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colors.white,
                            borderRadius: 100,
                        }}>
                        {!noBackButton && <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />}
                    </TouchableOpacity>
                </View>
                <Space height={responsiveHeight(12)} />
                <View style={{ width: responsiveWidth(90), alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: colors.black, fontSize: responsiveFontSize(3.2), fontWeight: '600' }}>{t(`welcomeToTruckMitr`)}</Text>
                    </View>
                    <Text
                        style={{
                            width: responsiveWidth(70),
                            color: colors.blackOpacity(0.6),
                            fontSize: responsiveFontSize(1.8),
                            textAlign: 'center',
                        }}>
                        {t(`enterYourMobileNumberTitle`)}
                    </Text>
                </View>
                <Space height={responsiveHeight(3)} />
                <View style={{ width: '100%', paddingHorizontal: responsiveWidth(5), paddingVertical: responsiveWidth(2.5) }}>
                    <PaperTextInput
                        value={mobile}
                        onChangeText={(text) => {
                            setMobile(text)
                            seterror(null)
                        }}
                        left={<PaperTextInput.Affix text="+91" textStyle={{color: colors.black}} />}
                        mode="outlined"
                        label={<Text>{t(`mobile`)} <Text style={{ color: 'red' }}>*</Text></Text>}
                        keyboardType="phone-pad"
                        maxLength={10}
                        theme={{ colors: { primary: colors.royalBlue, background: colors.white, onSurface: colors.black } }}
                        style={{ backgroundColor: colors.transparent }}
                        outlineStyle={{ borderRadius: 10 }}
                    />
                    {error && <View style={{ flexDirection: 'row', marginTop: responsiveHeight(1) }}>
                        <MaterialIcons name="error" size={14} color={colors.error} style={{ marginTop: responsiveFontSize(.3) }} />
                        <Text style={{ color: colors.error, fontSize: responsiveFontSize(1.7), marginLeft: responsiveFontSize(0.5) }}>
                            {error}
                        </Text>
                    </View>}
                </View>
                <Space height={responsiveHeight(4)} />
                <TouchableOpacity
                    onPress={_navigateOtp}
                    activeOpacity={0.7}
                    disabled={loading}
                    style={{
                        height: responsiveHeight(6),
                        width: responsiveWidth(90),
                        borderRadius: 100,
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        opacity: loading ? 0.6 : 1,
                    }}>
                    <LinearGradient
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={{ height: '100%', width: '100%', position: 'absolute' }}
                        colors={imageColorGradient}
                    />
                    {loading ? (
                        <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                        <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t(`sendOtp`)}</Text>
                    )}
                </TouchableOpacity>
                <Space height={responsiveHeight(2)} />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: colors.blackOpacity(0.6), fontSize: responsiveFontSize(1.9), fontWeight: '400' }}>{t(`needAnAccount`)} </Text>
                    <TouchableOpacity onPress={_navigateSignup}>
                        <Text style={{ color: colors.azureBlue, fontSize: responsiveFontSize(2), fontWeight: '600' }}>{t(`registerNow`)}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

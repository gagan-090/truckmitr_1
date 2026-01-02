import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ActivityIndicator, TextInput as PaperTextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dropdown } from 'react-native-element-dropdown';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { Space } from '@truckmitr/src/app/components';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { hitSlop } from '@truckmitr/src/app/functions';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function Signup() {
    const { t } = useTranslation();
    const colors = useColor();
    const { shadow } = useShadow();
    const navigation = useNavigation<NavigatorProp>();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveFontSize, responsiveWidth, responsiveHeight } = useResponsiveScale();

    // Local states for form fields
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [mobile, setMobile] = useState<string>('');
    const [role, setRole] = useState<string>('driver'); // Default to driver
    const [state, setState] = useState<string>(''); // Selected state
    const [code, setCode] = useState<string>(''); // Selected state
    const [checkBoxSelect, setCheckBoxSelect] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState<any[]>([]); // Fetched locations
    const { i18n } = useTranslation(); // Use translation hook from i18next

    // State for error messages
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        mobile?: string;
        role?: string;
        state?: string;
        checkBox?: string
    }>({});

    const _goback = () => {
        navigation.goBack();
    };

    const imageColorGradient = ['#3D5EE1', '#18A9B3'];

    const _onpressCheckBox = () => {
        setCheckBoxSelect(!checkBoxSelect);
        setErrors((prevData) => ({
            ...prevData,
            checkBox: undefined,
        }));
    };

    const _navigateLogin = () => {
        navigation.navigate(STACKS.LOGIN);
    };

    const getLocation = async () => {
        try {
            const response = await axiosInstance.get(END_POINTS.GETSTATES);
            if (response?.data?.status) {
                setLocations(response?.data?.data);
            }
            console.log('Fetched locations:', JSON.stringify(response));
        } catch (error: any) {
            console.log('Error fetching locations:', error);
            showToast(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getLocation();
    }, []);

    const validate = (): boolean => {
        let valid = true;
        const newErrors: { [key: string]: string } = {};
        if (!name) {
            newErrors.name = t(`nameRequired`);
            valid = false;
        }
        if (!mobile) {
            newErrors.mobile = t('mobileNumberRequired');
            valid = false;
        } else if (mobile.length < 10) {
            newErrors.mobile = t('mobileNumber_10_digits');
            valid = false;
        }
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                newErrors.email = t('invalidEmailFormat');
                valid = false;
            }
        }
        if (!role) {
            newErrors.role = t('roleRequired');
            valid = false;
        }
        if (!state) {
            newErrors.state = t('stateRequired');
            valid = false;
        }
        if (!checkBoxSelect) {
            newErrors.checkBox = t(`youNeedToAcceptTruckMitr`);
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const onSignUpPress = async () => {
        if (!validate()) return;
        setLoading(true);
        const currentLang = i18n.language;
        const formData = new FormData();
        formData.append('name', name);
        formData.append('mobile', mobile);
        formData.append('email', email);
        formData.append('role', role);
        formData.append('states', state);
        formData.append('user_lang', currentLang)
        formData.append('code', code)
        try {
            const response = await axiosInstance.post(END_POINTS.SIGNUP, formData);
            if (response?.data?.success) {
                showToast(t(`otpSentSuccessfully`));
                const formPayload = { name, mobile, email, role, states: state };
                // ✅ Store incomplete signup info
                await AsyncStorage.setItem('signup_incomplete', JSON.stringify({
                    ...formPayload,
                    timestamp: Date.now(),
                }));
                navigation.navigate('otp' as any, { formData: formPayload });
            } else {
                showToast(response?.data?.message)
            }
        } catch (error: any) {
            console.log('Signup error:', error);
            showToast(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.white }}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            showsVerticalScrollIndicator={false}
            extraScrollHeight={10}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.white }}>
                    <Space height={safeAreaInsets.top} />

                    {/* Header */}
                    <View style={{ width: '100%', paddingHorizontal: responsiveWidth(4), paddingVertical: responsiveHeight(1) }}>
                        <TouchableOpacity
                            hitSlop={hitSlop(10)}
                            onPress={_goback}
                            style={{
                                height: 44,
                                width: 44,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: colors.blackOpacity(0.05),
                                borderRadius: 12,
                            }}>
                            <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />
                        </TouchableOpacity>
                    </View>

                    <Space height={responsiveHeight(2)} />

                    {/* Title Section */}
                    <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: responsiveWidth(5) }}>
                        <Text style={{
                            color: colors.black,
                            fontSize: responsiveFontSize(3.5),
                            fontWeight: '700',
                            textAlign: 'center',
                            letterSpacing: -0.5
                        }}>
                            {t(`welcomeToTruckMitr`)}
                        </Text>
                        <Space height={responsiveHeight(1)} />
                        <Text
                            style={{
                                width: responsiveWidth(80),
                                color: colors.blackOpacity(0.5),
                                fontSize: responsiveFontSize(1.8),
                                textAlign: 'center',
                                lineHeight: responsiveFontSize(2.4)
                            }}>
                            {t(`enterTheDetailsToCreateAnAccount`)}
                        </Text>
                    </View>

                    <Space height={responsiveHeight(4)} />

                    {/* Form Container */}
                    <View style={{ width: '100%', paddingHorizontal: responsiveWidth(6) }}>

                        {/* Role Selection Toggle */}
                        <View style={{ marginBottom: responsiveHeight(2.5) }}>
                            <Text style={{
                                fontSize: responsiveFontSize(1.8),
                                color: colors.black,
                                fontWeight: '600',
                                marginLeft: responsiveFontSize(0.5),
                                marginBottom: responsiveHeight(1)
                            }}>
                                {t(`iAmA`)}
                            </Text>
                            <View style={{
                                flexDirection: 'row',
                                backgroundColor: colors.blackOpacity(0.04), // Subtle gray
                                borderRadius: 14,
                                padding: 4,
                                height: responsiveHeight(6.5)
                            }}>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setRole('driver')}
                                    style={{
                                        flex: 1,
                                        backgroundColor: role === 'driver' ? colors.white : 'transparent',
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        ...(role === 'driver' ? shadow : {}),
                                        borderWidth: role === 'driver' ? 0.5 : 0,
                                        borderColor: colors.blackOpacity(0.05)
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <MaterialCommunityIcons
                                            name="steering"
                                            size={20}
                                            color={role === 'driver' ? colors.royalBlue : colors.blackOpacity(0.5)}
                                        />
                                        <Text style={{
                                            color: role === 'driver' ? colors.royalBlue : colors.blackOpacity(0.5),
                                            fontWeight: '600',
                                            fontSize: responsiveFontSize(1.9)
                                        }}>
                                            {t('driver')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => setRole('transporter')}
                                    style={{
                                        flex: 1,
                                        backgroundColor: role === 'transporter' ? colors.white : 'transparent',
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        ...(role === 'transporter' ? shadow : {}),
                                        borderWidth: role === 'transporter' ? 0.5 : 0,
                                        borderColor: colors.blackOpacity(0.05)
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <MaterialCommunityIcons
                                            name="truck-fast"
                                            size={20}
                                            color={role === 'transporter' ? colors.royalBlue : colors.blackOpacity(0.5)}
                                        />
                                        <Text style={{
                                            color: role === 'transporter' ? colors.royalBlue : colors.blackOpacity(0.5),
                                            fontWeight: '600',
                                            fontSize: responsiveFontSize(1.9)
                                        }}>
                                            {t('transporter')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            {errors.role && (
                                <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: 4, marginLeft: 4 }}>{errors.role}</Text>
                            )}
                        </View>

                        {/* Name Input */}
                        <View style={{ marginBottom: responsiveHeight(2) }}>
                            <PaperTextInput
                                mode="outlined"
                                label={<Text>{t(`name`)} <Text style={{ color: colors.error }}>*</Text></Text>}
                                value={name}
                                onChangeText={(text) => {
                                    setName(text)
                                    setErrors((prevData) => ({ ...prevData, name: undefined }));
                                }}
                                keyboardType="default"
                                theme={{ colors: { primary: colors.royalBlue, background: colors.white, onSurface: colors.black } }}
                                style={{ backgroundColor: colors.white }}
                                outlineStyle={{ borderRadius: 12, borderColor: errors.name ? colors.error : colors.blackOpacity(0.2) }}
                            />
                            {errors.name && (
                                <Text style={{ color: colors.error, fontSize: responsiveFontSize(1.6), marginTop: 4, marginLeft: 4 }}>{errors.name}</Text>
                            )}
                        </View>

                        {/* Mobile Input */}
                        <View style={{ marginBottom: responsiveHeight(2) }}>
                            <PaperTextInput
                                left={<PaperTextInput.Affix text="+91" textStyle={{ color: colors.black }} />}
                                mode="outlined"
                                label={<Text>{t(`mobile`)} <Text style={{ color: colors.error }}>*</Text></Text>}
                                value={mobile}
                                onChangeText={(text) => {
                                    setMobile(text)
                                    setErrors((prevData) => ({ ...prevData, mobile: undefined }));
                                }}
                                maxLength={10}
                                keyboardType="phone-pad"
                                theme={{ colors: { primary: colors.royalBlue, background: colors.white, onSurface: colors.black } }}
                                style={{ backgroundColor: colors.white }}
                                outlineStyle={{ borderRadius: 12, borderColor: errors.mobile ? colors.error : colors.blackOpacity(0.2) }}
                            />
                            {errors.mobile && (
                                <Text style={{ color: colors.error, fontSize: responsiveFontSize(1.6), marginTop: 4, marginLeft: 4 }}>{errors.mobile}</Text>
                            )}
                        </View>

                        {/* E-mail Input */}
                        <View style={{ marginBottom: responsiveHeight(2) }}>
                            <PaperTextInput
                                mode="outlined"
                                label={t(`e-mail`)}
                                value={email}
                                onChangeText={(text) => {
                                    const lower = text.toLowerCase();
                                    setEmail(lower)
                                    setErrors((prevData) => ({ ...prevData, email: undefined }));
                                }}
                                keyboardType="email-address"
                                theme={{ colors: { primary: colors.royalBlue, background: colors.white, onSurface: colors.black } }}
                                style={{ backgroundColor: colors.white }}
                                outlineStyle={{ borderRadius: 12, borderColor: errors.email ? colors.error : colors.blackOpacity(0.2) }}
                            />
                            {errors.email && (
                                <Text style={{ color: colors.error, fontSize: responsiveFontSize(1.6), marginTop: 4, marginLeft: 4 }}>{errors.email}</Text>
                            )}
                        </View>

                        {/* Referral Code (Driver only) */}
                        {role == 'driver' && (
                            <View style={{ marginBottom: responsiveHeight(2) }}>
                                <PaperTextInput
                                    mode="outlined"
                                    label={t(`referralCode`)}
                                    value={code}
                                    onChangeText={(text) => setCode(text)}
                                    theme={{ colors: { primary: colors.royalBlue, background: colors.white, onSurface: colors.black } }}
                                    style={{ backgroundColor: colors.white }}
                                    outlineStyle={{ borderRadius: 12, borderColor: colors.blackOpacity(0.2) }}
                                />
                            </View>
                        )}

                        {/* State Dropdown */}
                        <View style={{ marginBottom: responsiveHeight(2.5) }}>
                            <Text style={{
                                fontSize: responsiveFontSize(1.6),
                                color: colors.blackOpacity(0.6),
                                fontWeight: '500',
                                marginLeft: responsiveFontSize(0.5),
                                marginBottom: 6
                            }}>
                                {t(`state`)} <Text style={{ color: colors.error }}>*</Text>
                            </Text>
                            <Dropdown
                                style={{
                                    height: 56,
                                    paddingHorizontal: 16,
                                    borderRadius: 12,
                                    borderColor: errors.state ? colors.error : colors.blackOpacity(0.2),
                                    borderWidth: 1,
                                    backgroundColor: colors.white,
                                }}
                                containerStyle={{ borderRadius: 12, backgroundColor: colors.white, ...shadow, marginTop: 4 }}
                                itemTextStyle={{ color: colors.black }}
                                placeholderStyle={{
                                    fontSize: responsiveFontSize(1.9),
                                    color: colors.blackOpacity(0.5),
                                }}
                                selectedTextStyle={{
                                    color: colors.black,
                                    fontSize: responsiveFontSize(2),
                                }}
                                iconStyle={{ height: 24, width: 24, tintColor: colors.blackOpacity(0.5) }}
                                data={locations.length ? locations.map(item => ({ label: item.name, value: item.id.toString() })) : []}
                                dropdownPosition="auto"
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={t("selectState")}
                                searchPlaceholder="Search..."
                                value={state}
                                onChange={item => {
                                    setState(item.value);
                                    setErrors((prevData) => ({ ...prevData, state: undefined }));
                                }}
                            />
                            {errors.state && (
                                <Text style={{ color: colors.error, fontSize: responsiveFontSize(1.6), marginTop: 4, marginLeft: 4 }}>{errors.state}</Text>
                            )}
                        </View>

                        {/* Checkbox */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                            <TouchableOpacity activeOpacity={0.7} onPress={_onpressCheckBox} style={{ marginTop: -2.4 }}>
                                <MaterialCommunityIcons
                                    name={checkBoxSelect ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                    size={24}
                                    color={checkBoxSelect ? colors.royalBlue : colors.blackOpacity(0.4)}
                                />
                            </TouchableOpacity>
                            <Text style={{ color: colors.blackOpacity(0.7), marginStart: responsiveFontSize(1.5), fontSize: responsiveFontSize(1.7), lineHeight: 22, flex: 1 }}>
                                {t(`iAgreeToTruckMitr`)}
                                <Text onPress={() => navigation.navigate(STACKS?.TERMS)} style={{ color: colors.royalBlue, fontWeight: '600' }}> {t(`termsOfUse`)}</Text> {'\n'}
                                <Text onPress={() => navigation.navigate(STACKS?.PRIVACY)} style={{ color: colors.royalBlue, fontWeight: '600' }}></Text>.
                            </Text>
                        </View>
                        {errors.checkBox && (
                            <View style={{ flexDirection: 'row', marginTop: responsiveHeight(1), marginLeft: 4 }}>
                                <MaterialIcons name="error" size={14} color={colors.error} style={{ marginTop: 2 }} />
                                <Text style={{ color: colors.error, fontSize: responsiveFontSize(1.6), marginLeft: 4 }}>
                                    {errors.checkBox}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Space height={responsiveHeight(4)} />

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={onSignUpPress}
                        activeOpacity={0.8}
                        style={{
                            height: 56,
                            width: responsiveWidth(88),
                            borderRadius: 16,
                            overflow: 'hidden',
                            ...shadow
                        }}>
                        <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                            colors={imageColorGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} size="small" />
                            ) : (
                                <Text style={{ color: colors.white, fontSize: responsiveFontSize(2.1), fontWeight: '600', letterSpacing: 0.5 }}>
                                    {t(`registerNow`)}
                                </Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <Space height={responsiveHeight(3)} />

                    {/* Login Link */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: responsiveHeight(5) }}>
                        <Text style={{ color: colors.blackOpacity(0.6), fontSize: responsiveFontSize(1.9), fontWeight: '400' }}>
                            {t(`alreadyRegistered`)}{' '}
                        </Text>
                        <TouchableOpacity onPress={_navigateLogin}>
                            <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2), fontWeight: '700' }}>{t(`login`)}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAwareScrollView>
    );
}

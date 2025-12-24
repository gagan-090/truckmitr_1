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

const roleData = [
    { label: 'Driver', value: 'driver' },
    { label: 'Transporter', value: 'transporter' },
];

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
    const [role, setRole] = useState<string>('');
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
            extraScrollHeight={10}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.white }}>
                    <Space height={safeAreaInsets.top} />
                    <View style={{ width: '100%', padding: responsiveWidth(3) }}>
                        <TouchableOpacity
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
                            <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />
                        </TouchableOpacity>
                    </View>
                    <Space height={responsiveHeight(3)} />
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
                            }}>{t(`enterTheDetailsToCreateAnAccount`)}</Text>
                    </View>
                    <Space height={responsiveHeight(2)} />
                    <View style={{ width: '100%', paddingHorizontal: responsiveWidth(5), paddingVertical: responsiveWidth(2.5) }}>
                        {/* Role Dropdown */}
                        <View>
                            <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.black, fontWeight: '500', marginLeft: responsiveFontSize(0.5) }}>{t(`role`)} <Text style={{ color: 'red' }}>*</Text></Text>
                            <Dropdown
                                style={{
                                    height: responsiveHeight(6.7),
                                    paddingHorizontal: responsiveFontSize(1.5),
                                    borderRadius: 10,
                                    borderColor: colors.blackOpacity(0.5),
                                    borderWidth: 1,
                                    marginTop: responsiveFontSize(0.5),
                                }}
                                containerStyle={{ borderRadius: 10, backgroundColor: colors.white, ...shadow }}
                                itemTextStyle={{ color: colors.blackOpacity(0.8) }}
                                placeholderStyle={{
                                    fontSize: responsiveFontSize(1.9),
                                    color: colors.blackOpacity(0.7),
                                    fontWeight: '400',
                                }}
                                selectedTextStyle={{
                                    color: colors.blackOpacity(1),
                                    fontSize: responsiveFontSize(2),
                                    fontWeight: '400',
                                }}
                                iconStyle={{ height: responsiveFontSize(2.8), width: responsiveFontSize(2.8) }}
                                data={roleData}
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={t("selectRole")}
                                value={role}
                                onChange={item => {
                                    setRole(item.value);
                                    setErrors((prevData) => ({
                                        ...prevData,
                                        role: undefined,
                                    }));
                                }}
                            />
                            {errors.role && (
                                <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: 4 }}>{errors.role}</Text>
                            )}
                        </View>
                        <Space height={responsiveHeight(1.5)} />

                        {/* Name Input */}
                        <PaperTextInput
                            mode="outlined"
                            label={<Text>{t(`name`)} <Text style={{ color: 'red' }}>*</Text></Text>}
                            value={name}
                            onChangeText={(text) => {
                                setName(text)
                                setErrors((prevData) => ({
                                    ...prevData,
                                    name: undefined,
                                }));
                            }}
                            keyboardType="default"
                            theme={{ colors: { primary: colors.royalBlue, background: colors.white, onSurface: colors.black  } }}
                            style={{ backgroundColor: colors.transparent }}
                            outlineStyle={{ borderRadius: 10 }}
                        />
                        {errors.name && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: 4 }}>{errors.name}</Text>
                        )}
                        <Space height={responsiveHeight(1.5)} />

                        {/* E-mail Input */}
                        <PaperTextInput
                            mode="outlined"
                            label={t(`e-mail`)}
                            value={email}
                            onChangeText={(text) => {
                                const lower = text.toLowerCase();
                                setEmail(lower)
                                setErrors((prevData) => ({
                                    ...prevData,
                                    email: undefined,
                                }));
                            }}
                            keyboardType="email-address"
                            theme={{ colors: { primary: colors.royalBlue, background: colors.white, onSurface: colors.black  } }}
                            style={{ backgroundColor: colors.transparent }}
                            outlineStyle={{ borderRadius: 10 }}
                        />
                        {errors.email && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: 4 }}>{errors.email}</Text>
                        )}
                        <Space height={responsiveHeight(1.5)} />

                        {/* Mobile Input */}
                        <PaperTextInput
                            left={<PaperTextInput.Affix text="+91" textStyle={{color: colors.black}} />}
                            mode="outlined"
                            label={<Text>{t(`mobile`)} <Text style={{ color: 'red' }}>*</Text></Text>}
                            value={mobile}
                            onChangeText={(text) => {
                                setMobile(text)
                                setErrors((prevData) => ({
                                    ...prevData,
                                    mobile: undefined,
                                }));
                            }}
                            maxLength={10}
                            keyboardType="phone-pad"
                            theme={{ colors: { primary: colors.royalBlue, background: colors.white, onSurface: colors.black  } }}
                            style={{ backgroundColor: colors.transparent }}
                            outlineStyle={{ borderRadius: 10 }}
                        />
                        {errors.mobile && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: 4 }}>{errors.mobile}</Text>
                        )}
                        {role == 'driver' && <>
                        <Space height={responsiveHeight(1.5)} />
                        <PaperTextInput
                            mode="outlined"
                            label={t(`referralCode`)}
                            value={code}
                            onChangeText={(text) => {
                                setCode(text)
                            }}
                            theme={{ colors: { primary: colors.royalBlue } }}
                            style={{ backgroundColor: colors.transparent }}
                            outlineStyle={{ borderRadius: 10 }}
                        /> </>}
                        <Space height={responsiveHeight(1.5)} />
                        {/* State Dropdown using fetched locations */}
                        <View>
                            <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.black, fontWeight: '500', marginLeft: responsiveFontSize(0.5) }}>{t(`state`)} <Text style={{ color: 'red' }}>*</Text></Text>
                            <Dropdown
                                style={{
                                    height: responsiveHeight(6.7),
                                    paddingHorizontal: responsiveFontSize(1.5),
                                    borderRadius: 10,
                                    borderColor: colors.blackOpacity(0.5),
                                    borderWidth: 1,
                                    marginTop: responsiveFontSize(0.5),
                                }}
                                containerStyle={{ borderRadius: 10, backgroundColor: colors.white, ...shadow }}
                                itemTextStyle={{ color: colors.blackOpacity(0.8) }}
                                placeholderStyle={{
                                    fontSize: responsiveFontSize(1.9),
                                    color: colors.blackOpacity(0.7),
                                    fontWeight: '400',
                                }}
                                selectedTextStyle={{
                                    color: colors.blackOpacity(1),
                                    fontSize: responsiveFontSize(2),
                                    fontWeight: '400',
                                }}
                                iconStyle={{ height: responsiveFontSize(2.8), width: responsiveFontSize(2.8) }}
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
                                    setErrors((prevData) => ({
                                        ...prevData,
                                        state: undefined,
                                    }));
                                }}
                            />
                            {errors.state && (
                                <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: 4 }}>{errors.state}</Text>
                            )}
                        </View>
                        <Space height={responsiveHeight(2)} />
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity activeOpacity={1} onPress={_onpressCheckBox}>
                                <MaterialCommunityIcons
                                    name={checkBoxSelect ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                    size={24}
                                    color={colors.royalBlue}
                                />
                            </TouchableOpacity>
                            <Text style={{ color: colors.blackOpacity(0.7), marginStart: responsiveFontSize(1) }}>
                                {t(`iAgreeToTruckMitr`)}
                                <Text onPress={() => navigation.navigate(STACKS?.TERMS)} style={{ color: colors.royalBlue, fontWeight: '500' }}> {t(`termsOfUse`)}</Text> {t('and')}{'\n'}
                                <Text onPress={() => navigation.navigate(STACKS?.PRIVACY)} style={{ color: colors.royalBlue, fontWeight: '500' }}>{t(`privacyPolicy`)}</Text>.
                            </Text>
                        </View>
                        {errors.checkBox && (<View style={{ flexDirection: 'row', marginTop: responsiveHeight(1) }}>
                            <MaterialIcons name="error" size={14} color={colors.error} style={{ marginTop: responsiveFontSize(.3) }} />
                            <Text style={{ color: colors.error, fontSize: responsiveFontSize(1.7), marginLeft: responsiveFontSize(0.5) }}>
                                {errors.checkBox}
                            </Text>
                        </View>)}
                    </View>
                    <Space height={responsiveHeight(4)} />
                    <TouchableOpacity
                        onPress={onSignUpPress}
                        activeOpacity={0.7}
                        style={{
                            height: responsiveHeight(6),
                            width: responsiveWidth(90),
                            borderRadius: 100,
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                        }}>
                        <LinearGradient start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }} style={StyleSheet.absoluteFill} colors={imageColorGradient} />
                        {loading ? (
                            <ActivityIndicator color={colors.white} size="small" />
                        ) : (
                            <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t(`registerNow`)}</Text>
                        )}
                    </TouchableOpacity>
                    <Space height={responsiveHeight(2)} />
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: colors.blackOpacity(0.6), fontSize: responsiveFontSize(1.9), fontWeight: '400' }}>
                            {t(`alreadyRegistered`)}{' '}
                        </Text>
                        <TouchableOpacity onPress={_navigateLogin}>
                            <Text style={{ color: colors.azureBlue, fontSize: responsiveFontSize(2), fontWeight: '600' }}>{t(`login`)}</Text>
                        </TouchableOpacity>
                    </View>
                    <Space height={responsiveHeight(10)} />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAwareScrollView>
    );
}

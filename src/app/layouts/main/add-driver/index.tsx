import { ActivityIndicator, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigatorParams, STACKS } from '@truckmitr/src/stacks/stacks';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { hitSlop } from '@truckmitr/src/app/functions';
import { Space } from '@truckmitr/src/app/components';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Dropdown } from 'react-native-element-dropdown';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { AnimatedFAB } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useDispatch, useSelector } from 'react-redux';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function AddDriver() {
    const { t } = useTranslation();
    const dispatch = useDispatch()
    useStatusBarStyle('dark-content')
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { shadow } = useShadow()
    const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const [fullName, setfullName] = useState<string>('');
    const [email, setemail] = useState<string>('');
    const [mobile, setmobile] = useState<string>('');
    const [state, setstate] = useState()
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Inside your component
    const [isExtended, setIsExtended] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setIsExtended(false); // Optional: shrink FAB
            setIsVisible(false);  // Hide FAB
        });

        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setIsExtended(true);
            setIsVisible(true);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    useEffect(() => {
        setTimeout(() => {
            setIsExtended(true)
        }, 500);
    }, [])


    const [errors, setErrors] = useState<{
        fullName?: string;
        email?: string;
        mobile?: string;
        state?: string;
    }>({});

    const validate = (): boolean => {
        let valid = true;
        const newErrors: { [key: string]: string } = {};
        if (!fullName) {
            newErrors.fullName = t(`nameRequired`);
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
        if (!state) {
            newErrors.state = t('stateRequired');
            valid = false;
        }
        setErrors(newErrors);
        return valid;
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

    const _onPressAddDriver = async () => {
        if (!validate()) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('name', fullName);
        formData.append('mobile', mobile);
        formData.append('email', email);
        formData.append('states', state);
        try {
            const response = await axiosInstance.post(END_POINTS.TRANSPORTER_DRIVER_CREATE, formData);
            if (response?.data?.success) {
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [
                            {
                                name: STACKS.BOTTOM_TAB,
                                state: {
                                    index: 0,
                                    routes: [
                                        {
                                            name: STACKS.DRIVER_LIST,
                                        },

                                    ],
                                },
                            },
                        ],
                    })
                );

            } else {
                showToast(response?.data?.message)
            }
        } catch (error: any) {
            console.log('Signup error:', error);
            showToast(error);
        } finally {
            navigation.goBack()
            setLoading(false);
        }
    };

    const _goback = () => {
        navigation.goBack()
    }
    return (
        <View style={{ flex: 1, backgroundColor: colors.white, alignItems: 'center' }}>
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{t(`addDriver`)}</Text>
            </View>
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.white, alignItems: 'center' }}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                extraScrollHeight={responsiveHeight(30)}>
                <View style={{ flex: 1, width: responsiveWidth(100), paddingHorizontal: responsiveWidth(5) }}>
                    <Space height={responsiveFontSize(4)} />
                    <View>
                        {/*  */}
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('fullName')} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        <TextInput
                            value={fullName}
                            onChangeText={(text) => {
                                setfullName(text)
                                setErrors((prevData) => ({
                                    ...prevData,
                                    fullName: undefined,
                                }));
                            }}
                            placeholder={t('enterFullName')}
                            style={{
                                color: colors.black,
                                fontSize: responsiveFontSize(2),
                                fontWeight: '500',
                                height: responsiveHeight(5.5),
                                borderColor: colors.blackOpacity(0.2),
                                borderWidth: 1,
                                borderRadius: 10,
                                marginTop: responsiveFontSize(0.5),
                                paddingHorizontal: responsiveFontSize(2),
                            }}
                        />
                        {errors?.fullName && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.fullName}</Text>
                        )}
                    </View>
                    <Space height={responsiveFontSize(2.5)} />

                    {/* E-mail */}
                    <View>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('e-mail')}</Text>
                        <TextInput
                            value={email}
                            onChangeText={(text) => {
                                const lower = text.toLowerCase(); // lowercase all
                                setemail(lower)
                                setErrors((prevData) => ({
                                    ...prevData,
                                    email: undefined,
                                }));
                            }}
                            placeholder={t('enterE-mail')}
                            keyboardType={'email-address'}
                            style={{
                                color: colors.black,
                                fontSize: responsiveFontSize(2),
                                fontWeight: '500',
                                height: responsiveHeight(5.5),
                                borderColor: colors.blackOpacity(0.2),
                                borderWidth: 1,
                                borderRadius: 10,
                                marginTop: responsiveFontSize(0.5),
                                paddingHorizontal: responsiveFontSize(2),
                            }}
                        />
                        {errors?.email && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.email}</Text>
                        )}
                    </View>
                    <Space height={responsiveFontSize(2.5)} />

                    {/* Mobile */}
                    <View>
                        <Text style={{ color: colors.blackOpacity(0.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t(`mobile`)} <Text style={{ color: colors.roseRed, fontWeight: 'bold' }}>*</Text>
                        </Text>
                        <TextInput
                            value={mobile}
                            placeholder={t('enterMobile')}
                            keyboardType='number-pad'
                            onChangeText={(text) => {
                                setmobile(text)
                                setErrors((prevData) => ({
                                    ...prevData,
                                    mobile: undefined,
                                }));
                            }}
                            style={{
                                color: colors.black,
                                fontSize: responsiveFontSize(2),
                                fontWeight: '500',
                                height: responsiveHeight(5.5),
                                borderColor: colors.blackOpacity(0.2),
                                borderWidth: 1,
                                borderRadius: 10,
                                marginTop: responsiveFontSize(0.5),
                                paddingHorizontal: responsiveFontSize(2),
                            }}
                        />
                        {errors?.mobile && (
                            <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5), }}>{errors?.mobile}</Text>
                        )}
                    </View>
                    <Space height={responsiveFontSize(2.5)} />
                    {/*  */}
                    <View>
                        <Text style={{ fontSize: responsiveFontSize(1.8), color: colors.black, fontWeight: '500', marginLeft: responsiveFontSize(0.5) }}>{t(`state`)} <Text style={{ color: 'red' }}>*</Text></Text>
                        <Dropdown
                            style={{
                                height: responsiveHeight(6),
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
                                setstate(item.value);
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
                    {/*  */}
                    <Space height={responsiveFontSize(6)} />
                    <TouchableOpacity
                        onPress={_onPressAddDriver}
                        activeOpacity={0.7}
                        style={{
                            height: responsiveHeight(5.8),
                            width: responsiveWidth(90),
                            backgroundColor: colors.royalBlue,
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            borderRadius: 8,
                        }}>
                        {loading ? (
                            <ActivityIndicator color={colors.white} size="small" />
                        ) : (
                            <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t(`addDriver`)}</Text>
                        )}
                    </TouchableOpacity>
                    <Space height={responsiveFontSize(10)} />
                    <AnimatedFAB
                        icon={({ size, color }) => (
                            <MaterialCommunityIcons name="microsoft-excel" size={size} color={color} />
                        )}
                        extended={isExtended}
                        label={t('uploadExcel')}
                        color={colors.white}
                        onPress={() => navigation.navigate(STACKS.EXCEL_IMPORT)}
                        visible={isVisible}
                        iconMode={'dynamic'}
                        style={{
                            position: 'absolute',
                            bottom: responsiveHeight(10),
                            right: responsiveWidth(5),
                            backgroundColor: colors.royalBlue
                        }}
                    />
                </View>
            </KeyboardAwareScrollView>
        </View>
    )
}

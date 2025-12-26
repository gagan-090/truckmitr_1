import { ActivityIndicator, Animated, BackHandler, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, AppState, Platform, Clipboard, PermissionsAndroid } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/hooks/index';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Space } from '@truckmitr/components/index';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { hitSlop } from '@truckmitr/src/app/functions';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { saveUserData } from '@truckmitr/src/utils/config/token';
import { userAction, userAuthenticatedAction } from '@truckmitr/src/redux/actions/user.action';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setupFirebaseNotifications } from '@truckmitr/src/utils/notification';
import analytics from '@react-native-firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import messaging from '@react-native-firebase/messaging';
import RNOtpVerify from 'react-native-otp-verify';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

type OtpRouteParams = {
    formData: {
        name: string;
        mobile: string;
        email: string;
        role: string;
        states: string;
    };
    flow: string
};

const Otp = () => {
    const { t } = useTranslation();
    useStatusBarStyle('dark-content');
    const dispatch = useDispatch()
    const route = useRoute();
    const { formData, flow } = route?.params as OtpRouteParams;

    const navigation = useNavigation<NavigatorProp>();
    const safeAreaInsets = useSafeAreaInsets();
    const colors = useColor();
    const { shadow } = useShadow();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, seterror] = useState<string | null>(null);
    const otpInputs = useRef<Array<TextInput | null>>([]);
    const [focusedField, setFocusedField] = useState<number | null>(null);
    const [opacity] = useState(new Animated.Value(1));
    const [timer, setTimer] = useState(20);
    const [loading, setloading] = useState(false);
    const [autoVerificationAttempted, setAutoVerificationAttempted] = useState(false);
    let timeoutId = useRef<any>(null);
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);
        return () => backHandler.remove();
    }, []);


    /**
     * SMS Auto fill
     */

    useEffect(() => {
        const setupOtpListener = async () => {
            // Request SMS permissions on Android
            // SMS Permission request removed for Google Play Policy compliance.
            // SMS Retriever API does not require runtime permissions.

            getHash();
            startListeningForOtp();
        };

        setupOtpListener();

        // Cleanup listener on unmount
        return () => {
            RNOtpVerify.removeListener();
        };
    }, [])

    const getHash = () =>
        RNOtpVerify.getHash()
            .then((hash) => {
                console.log('========================================');
                console.log('📱 APP HASH FOR SMS RETRIEVER API');
                console.log('========================================');
                console.log('Hash Array:', hash);
                if (hash && hash.length > 0) {
                    console.log('✅ Your App Hash:', hash[0]);
                    console.log('');
                    console.log('📧 SMS Format Required:');
                    console.log(`<#> Your OTP for TruckMitr login is 123456. Valid for 10 minutes. Do not share this code. TruckMitr ${hash[0]}`);
                    console.log('');
                    console.log('⚠️  Backend team must use this hash in SMS!');
                }
                console.log('========================================');
            })
            .catch((error) => {
                console.log('❌ Error getting hash:', error);
            });

    const startListeningForOtp = () =>
        RNOtpVerify.getOtp()
            .then((p) => {
                console.log('OTP listener started:', p);
                RNOtpVerify.addListener(otpHandler);
            })
            .catch((error) => {
                console.log('Error starting OTP listener:', error);
            });

    const otpHandler = (message: string) => {
        console.log('SMS received:', message);
        if (!message) {
            console.log('No message content');
            return;
        }
        const match = /(\d{6})/.exec(message);
        if (match && match[1]) {
            const extractedOtp = match[1];
            console.log('OTP extracted:', extractedOtp);
            setOtp(extractedOtp.split(""));
            RNOtpVerify.removeListener();
            Keyboard.dismiss();
        } else {
            console.log('No 6-digit OTP found in message');
        }
    };

    useEffect(() => {
        // Set up app state listener for iOS clipboard check
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // App has come to the foreground, check clipboard for OTP
                checkClipboardForOtp();
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // Check if OTP is complete and valid, then auto-verify
    useEffect(() => {
        const fullOtp = otp.join('');
        if (fullOtp.length === otp.length && /^\d+$/.test(fullOtp) && !autoVerificationAttempted) {
            setloading(true)
            // Auto-verify after a short delay to allow user to see the entered OTP
            const autoVerifyTimeout = setTimeout(() => {
                setAutoVerificationAttempted(true);
                verifyOtp();
            }, 800);

            return () => clearTimeout(autoVerifyTimeout);
        }
    }, [otp]);

    const checkClipboardForOtp = async () => {
        try {
            // For iOS, check the clipboard for OTP
            const clipboardContent = await Clipboard.getString();
            const otpMatch = clipboardContent.match(/\b\d{6}\b/);
            if (otpMatch) {
                const extractedOtp = otpMatch[0];
                if (extractedOtp.length === otp.length) {
                    const otpArray = extractedOtp.split('');
                    setOtp(otpArray);
                    Keyboard.dismiss();

                    // Show toast notification
                    showToast(t('otpAutoDetected'));
                }
            }
        } catch (error) {
            console.log('Clipboard check error:', error);
        }
    };

    const startFadeOutAnimation = () => {
        opacity.setValue(1);
        Animated.timing(opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    };

    useEffect(() => {
        timeoutId.current = setTimeout(() => {
            startFadeOutAnimation();
        }, 7000);
        return () => clearTimeout(timeoutId.current);
    }, []);

    const handleOtpChange = (index: number, text: string) => {
        if (/^[0-9]*$/.test(text)) {
            seterror(null);
            setOtp(prevState => {
                const updatedOtp = [...prevState];
                updatedOtp[index] = text;
                if (text && index < otp.length - 1) {
                    otpInputs.current[index + 1]?.focus();
                } else if (text && index === otp.length - 1) {
                    Keyboard.dismiss();
                }
                return updatedOtp;
            });
        }
    };

    const handleKeyPress = (index: number, key: string) => {
        if (key === 'Backspace') {
            if (otp[index] !== '') {
                handleOtpChange(index, '');
            }
            if (index > 0) {
                otpInputs.current[index - 1]?.focus();
            }
        } else {
            if (/^[0-9]$/.test(key) && index < otp.length - 1) {
                handleOtpChange(index, key);
            }
        }
    };

    const handleInputFocus = (index: number) => () => {
        setFocusedField(index);
    };

    const verifyOtp = async () => {
        const fullOtp = otp.join('');
        if (fullOtp.length < otp.length) {
            seterror(t("pleaseEnterCompleteOtp"));
            return;
        }

        // Prevent multiple calls
        if (loading) return;

        seterror(null);
        try {
            const fcmToken = await messaging().getToken();
            const data = new FormData();
            if (flow === 'login') {
                data.append('mobile', formData?.mobile);
                data.append('otp', fullOtp);
                data.append('fcm_token', fcmToken)
            } else {
                data.append('name', formData?.name);
                data.append('email', formData?.email);
                data.append('mobile', formData?.mobile);
                data.append('states', formData?.states);
                data.append('role', formData?.role);
                data.append('otp', fullOtp);
                data.append('fcm_token', fcmToken)
            }
            const endpoint = flow === 'login' ? END_POINTS?.LOGIN_OTP_VERIFY : END_POINTS?.OTP_VERIFY;
            const response: any = await axiosInstance.post(endpoint, data);
            console.log("Verify OTP response:", response);
            if (response?.data?.success) {
                showToast(t('otpVerifiedSuccessfully'))
                if (response?.data?.token) {
                    let token = response?.data?.token;
                    console.log("🔹 Raw Token received:", token);

                    // Remove 'Bearer ' if present to avoid double prefix in interceptor
                    if (token.startsWith('Bearer ')) {
                        token = token.replace('Bearer ', '');
                        console.log("🔹 Token cleaned (Bearer removed):", token);
                    }

                    await AsyncStorage.removeItem('signup_incomplete');
                    const userinfo = {
                        id: response?.data?.user?.id ?? '',
                        unique_id: response?.data?.user?.unique_id ?? '',
                        name: response?.data?.user?.name ?? '',
                        mobile: response?.data?.user?.mobile ?? '',
                        email: response?.data?.user?.email ?? '',
                        role: response?.data?.user?.role ?? '',
                    };

                    const eventParams = {
                        method: 'mobile_otp',
                        user_id: String(userinfo.id),
                        user_unique_id: userinfo.unique_id || '',
                        user_name: userinfo.name || '',
                        user_email: userinfo.email || '',
                        user_role: userinfo.role || '',
                    };

                    if (flow === 'login') {
                        await analytics().logEvent('login', eventParams);
                        AppEventsLogger.logEvent('fb_mobile_login', eventParams)
                    } else {
                        // Reserved Firebase event
                        await analytics().logEvent('sign_up', { method: 'mobile_otp' });

                        // Your custom extended event
                        await analytics().logEvent('user_signup', eventParams);

                        AppEventsLogger.logEvent('fb_mobile_complete_registration', { method: 'mobile_otp' });
                        AppEventsLogger.logEvent('user_signup', eventParams);
                    }

                    // 🧠 Set userId and properties
                    await analytics().setUserId(userinfo.unique_id || '');
                    await analytics().setUserProperties({
                        user_id: String(userinfo.id),
                        user_unique_id: userinfo.unique_id || '',
                        user_name: userinfo.name || '',
                        user_email: userinfo.email || '',
                        user_role: userinfo.role || '',
                        login_method: 'mobile_otp',
                    });

                    console.log("🔹 Saving token to storage...");
                    await saveUserData(token);
                    console.log("🔹 Token saved. Marking session as active...");

                    // Mark session as active immediately to prevent re-initialization
                    await AsyncStorage.setItem('app_session_active', 'true');

                    console.log("🔹 Fetching profile...");

                    try {
                        // Add a small delay to ensure backend has processed the token
                        await new Promise<void>(resolve => setTimeout(() => resolve(), 300));

                        // Explicitly pass token to avoid race condition with AsyncStorage
                        // Also skip global logout to prevent crash if 401
                        const profile: any = await axiosInstance.get(END_POINTS?.GET_PROFILE, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'X-Skip-Global-Logout': 'true'
                            }
                        });
                        console.log("🔹 Profile fetch status:", profile?.status, profile?.data?.status);

                        if (profile?.data?.status) {
                            console.log("🔹 Profile fetched successfully. Dispatching actions...");
                            dispatch(userAction(profile?.data))

                            // For new signups, navigate to profile completion screen
                            if (flow !== 'login') {
                                console.log("🔹 New signup - navigating to Profile Completion...");
                                navigation.navigate(STACKS.PROFILE_COMPLETION as any);
                            } else {
                                // Dispatch authentication immediately for login
                                console.log("🔹 Login - Dispatching userAuthenticatedAction(true)");
                                dispatch(userAuthenticatedAction(true))
                            }

                            // Setup notifications after successful login
                            setupFirebaseNotifications();
                        } else {
                            console.error("❌ Profile fetch failed (status false):", profile?.data);
                            // If 401, we might want to show a specific error
                            if (profile?.status === 401 || profile?.status === 403) {
                                showToast("Session invalid. Please try logging in again.");
                                // Clean up
                                await AsyncStorage.removeItem('app_session_active');
                                await saveUserData(''); // Clear token
                            } else {
                                showToast("Failed to fetch profile details.");
                            }
                        }
                    } catch (profileError: any) {
                        console.error("❌ Error fetching profile in OTP:", profileError);
                        if (profileError?.response?.status === 401 || profileError?.response?.status === 403) {
                            console.log("⚠️ 401/403 caught in OTP. Token might be invalid or not yet active.");
                            showToast("Authentication failed. Please retry.");
                            // Clean up
                            await AsyncStorage.removeItem('app_session_active');
                            await saveUserData(''); // Clear token
                        } else {
                            showToast("Error fetching profile: " + (profileError?.message || "Unknown error"));
                        }
                    }
                } else {
                    navigation.navigate(STACKS.APPROVAL as any, { response: response?.data });
                }
            } else {
                seterror(response?.data?.message);
                setAutoVerificationAttempted(false); // Reset to allow retry
            }
        } catch (error: any) {
            console.log("Verify OTP error:", error);
            showToast(error?.message || "Verification failed")
            seterror(error?.message || "Verification failed");
            setAutoVerificationAttempted(false); // Reset to allow retry
        } finally {
            setloading(false);
        }
    };

    const _pressResendOtp = async () => {
        if (timer === 0) {
            // Add resend OTP functionality if needed
            setloading(true);
            try {
                if (flow === 'login') {
                    const response: any = await axiosInstance.post(END_POINTS.LOGIN, formData);
                    if (response?.data?.success) {
                        showToast(t(`otpSentSuccessfully`));
                        navigation.navigate(STACKS.OTP as any, { formData: { mobile: formData?.mobile }, flow: 'login' });
                        setTimer(20); // Reset timer after resending OTP
                        setAutoVerificationAttempted(false); // Reset auto verification
                    } else {
                        seterror(response?.data?.message);
                    }
                } else {
                    const response = await axiosInstance.post(END_POINTS.SIGNUP, formData);
                    if (response?.data?.success) {
                        showToast(t(`otpSentSuccessfully`));
                        const formPayload = { name: formData?.name, mobile: formData?.mobile, email: formData?.email, role: formData?.role, states: formData?.states };
                        navigation.navigate('otp' as any, { formData: formPayload });
                        setTimer(20); // Reset timer after resending OTP
                        setAutoVerificationAttempted(false); // Reset auto verification
                    } else {
                        seterror(response?.data?.message);
                    }
                }
            } catch (error: any) {
                console.log('Login API error:', error);
                showToast(error);
            } finally {
                setloading(false);
            }
        }
    };

    const _goback = () => {
        navigation.goBack();
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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
                        <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                    </TouchableOpacity>
                </View>
                <Space height={responsiveHeight(6)} />
                <View style={{ width: '100%', alignItems: 'center', padding: responsiveFontSize(2) }}>
                    <Text style={{ color: colors.blackOpacity(1), fontSize: responsiveFontSize(2.8), fontWeight: '600' }}>{t(`OtpVerification`)}</Text>
                    <Space height={responsiveHeight(1)} />
                    <Text style={{ color: colors.blackOpacity(0.6), fontSize: responsiveFontSize(1.8), textAlign: 'center' }}>
                        {t(`weHaveSentVerificationCode`)}{'\n'}
                        <Text style={{ color: colors.black, fontWeight: '600' }}>{`+91-${formData?.mobile}`}</Text>
                    </Text>
                </View>
                <Space height={responsiveHeight(5)} />
                {/* OTP Input Fields */}
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: responsiveWidth(90) }}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el: any) => (otpInputs.current[index] = el)}
                                style={[
                                    {
                                        height: responsiveHeight(7),
                                        width: responsiveHeight(6),
                                        backgroundColor: colors.white,
                                        color: error ? colors.error : colors.blackOpacity(1),
                                        fontSize: responsiveFontSize(3.2),
                                        fontWeight: '600',
                                        borderRadius: 6,
                                        borderColor: error ? colors.error : colors.blackOpacity(0.2),
                                        borderWidth: 1,
                                        textAlign: 'center',
                                    },
                                    shadow,
                                ]}
                                keyboardType="number-pad"
                                textContentType="oneTimeCode"
                                autoComplete="sms-otp"
                                selectionColor={colors.royalBlue}
                                maxLength={1}
                                value={digit}
                                onChangeText={text => handleOtpChange(index, text)}
                                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                                onFocus={handleInputFocus(index)}
                            />
                        ))}
                    </View>
                    {error ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1) }}>
                            <MaterialIcons name="error" size={14} color={colors.error} />
                            <Text style={{ color: colors.error, fontSize: responsiveFontSize(1.7), marginLeft: responsiveFontSize(0.5) }}>
                                {error}
                            </Text>
                        </View>
                    ) : null}
                </View>
                <Space height={responsiveHeight(6)} />
                <TouchableOpacity
                    onPress={verifyOtp}
                    disabled={loading}
                    activeOpacity={0.7}
                    style={{
                        height: responsiveHeight(6),
                        width: responsiveWidth(90),
                        borderRadius: 100,
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        opacity: loading ? 0.6 : 1,
                    }}>
                    <LinearGradient start={{ x: 1, y: 0 }} end={{ x: 0, y: 0 }} style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' }} colors={['#3D5EE1', '#18A9B3']}>
                        {loading ? (
                            <ActivityIndicator color={colors.white} size="small" />
                        ) : (
                            <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t(`verify`)}</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
                <Space height={responsiveHeight(5)} />
                <Animated.Text style={{ color: '#0073e6', fontSize: responsiveFontSize(1.6), opacity }}>{t(`checkTextMessagesYourOtp`)}</Animated.Text>
                <Space height={responsiveHeight(1)} />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.8), fontWeight: '600' }}>
                        {t(`didntGetTheOtp`)}{' '}
                        <Text style={{ color: timer ? colors.blackOpacity(0.4) : colors.royalBlue, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>
                            {timer ? `${t(`resendSmsIn`)} ${timer}s` : ''}
                        </Text>
                    </Text>
                    {!timer ? (
                        <TouchableOpacity onPress={_pressResendOtp} activeOpacity={0.7}>
                            <Text style={{ color: timer ? colors.blackOpacity(0.4) : colors.royalBlue, fontSize: responsiveFontSize(1.9), fontWeight: '600' }}>{t(`resendSms`)}</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
                <Space height={responsiveHeight(2)} />
            </View>
        </TouchableWithoutFeedback>
    );
};

export default Otp;
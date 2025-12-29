import { Modal, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, ActivityIndicator, BackHandler } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useColor, useResponsiveScale, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigatorParams } from '@truckmitr/src/stacks/stacks';
import LottieView from 'lottie-react-native';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop } from '@truckmitr/src/app/functions';
type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import { useDispatch, useSelector } from 'react-redux';
import { subscriptionDetailsAction } from '@truckmitr/src/redux/actions/user.action';
import moment from 'moment';
import { shadow } from 'react-native-paper';
import { showToast } from '@truckmitr/src/app/hooks/toast';

export default function PaymentSuccess() {
    const route: any = useRoute();
    const { t } = useTranslation();
    useStatusBarStyle('light-content')
    const dispatch = useDispatch()
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const [emailPopupVisible, setEmailPopupVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { user, isDriver, subscriptionDetails } = useSelector((state: any) => { return state?.user })
    const [email, setEmail] = useState(user?.email || '');

    const _goback = () => {
        navigation.goBack();
    };

    const _handleEmailSubmit = async () => {
        if (email && !/\S+@\S+\.\S+/.test(email)) {
            showToast(t('pleaseEnterValidEmail'));
            return;
        }
        if (email && email !== user?.email) {
            try {
                let emailFormData = new FormData();
                emailFormData.append('email', email);
                setEmailPopupVisible(false);
                const response = await axiosInstance.post(END_POINTS.PAYMENT_SEND_INVOICE_EMAIL, emailFormData);
            } catch (error) {
                console.log('Email update error:', error);
            }
        } else {
            setEmailPopupVisible(false);
        }
        setEmailPopupVisible(false);
    };

    useEffect(() => {
        const backAction = () => {
            if (isLoading) {
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [isLoading]);

    const _handleSkipEmail = async () => {
        setEmailPopupVisible(false);
    };

    const _syncSubscriptionStatus = async () => {
        setIsLoading(true);
        try {
            // Get subscription details from backend
            // The webhook will have already processed the payment
            const response = await axiosInstance.get(END_POINTS.PAYMENT_SUBSCRIPTION_DETAILS);

            if (response?.data?.status) {
                dispatch(subscriptionDetailsAction(response?.data?.data));

                // Check if email is required
                if (response?.data?.email_required) {
                    setEmailPopupVisible(true);
                }
            }

            // Also try to sync the payment (fallback if webhook hasn't processed yet)
            const subscriptionId = route?.params?.data?.razorpay_subscription_id;
            const paymentId = route?.params?.data?.razorpay_payment_id;

            if (subscriptionId && paymentId) {
                try {
                    let syncFormData = new FormData();
                    syncFormData.append('subscription_id', subscriptionId);
                    syncFormData.append('payment_id', paymentId);
                    syncFormData.append('payment_type', 'subscription');

                    const syncResponse = await axiosInstance.post(END_POINTS.PAYMENT_SUBSCRIPTION_CAPTURE, syncFormData);

                    if (syncResponse?.data?.email_required) {
                        setEmailPopupVisible(true);
                    }

                    // Refresh subscription details after sync
                    if (syncResponse?.data?.status) {
                        const updatedDetails = await axiosInstance.get(END_POINTS.PAYMENT_SUBSCRIPTION_DETAILS);
                        if (updatedDetails?.data?.status) {
                            dispatch(subscriptionDetailsAction(updatedDetails?.data?.data));
                        }
                    }
                } catch (syncError) {
                    // Sync might fail if already processed by webhook - that's okay
                    console.log('Payment sync note:', syncError);
                }
            }
        } catch (error: any) {
            console.error('Subscription status error:', error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        _syncSubscriptionStatus();
    }, []);


    return (
        <View style={{ flex: 1, backgroundColor: colors.royalBlue, alignItems: 'center' }}>
            {isLoading && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <ActivityIndicator size="large" color={colors.white} />
                </View>
            )}
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.royalBlue, borderRadius: 100, zIndex: 100 }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.white, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{t(`checkout`)}</Text>
            </View>
            <Space height={responsiveHeight(4)} />
            <Text style={{ color: colors.white, fontSize: responsiveFontSize(3), fontWeight: '600' }}>{t(`thankYou`)}</Text>
            <Text style={{ color: colors.whiteOpacity(.7), fontSize: responsiveFontSize(1.8), fontWeight: '400' }}>{t(`paymentSuccessful`)}</Text>
            <Space height={responsiveHeight(1)} />
            {isDriver ? <Text style={{ color: colors.white, fontSize: responsiveFontSize(4), fontWeight: '600' }}>{(`₹199`)}</Text> :
                <Text style={{ color: colors.white, fontSize: responsiveFontSize(4), fontWeight: '600' }}>{(`₹499`)}</Text>}
            <View style={{ height: responsiveHeight(75), width: responsiveWidth(100), backgroundColor: colors.white, alignItems: 'center', position: 'absolute', bottom: 0, borderTopStartRadius: 30, borderTopEndRadius: 30 }}>
                <LottieView style={{ height: responsiveHeight(10), width: responsiveHeight(10), marginVertical: responsiveFontSize(5) }} source={require('@truckmitr/res/lotties/complete.json')} autoPlay loop />
                <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.6), fontWeight: 'bold', letterSpacing: -.2 }}>{t(`thanksForJoiningTruckMitr`)}</Text>
                <Space height={responsiveHeight(.5)} />
                <Text style={{ width: responsiveWidth(70), color: colors.blackOpacity(.7), fontSize: responsiveFontSize(1.8), fontWeight: '400', textAlign: 'center' }}>{t(`yourMembershipIsLive`)}</Text>
                <Space height={responsiveHeight(5)} />
                <View style={{
                    width: responsiveWidth(90), backgroundColor: colors.greenOpacitiy(.05), paddingVertical: responsiveFontSize(2), paddingHorizontal: responsiveFontSize(2),
                    borderRadius: 10,
                    borderColor: colors.green,
                    borderWidth: 1,
                    borderStyle: 'dashed'
                }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.5), fontWeight: 'bold', }}>{t(`yearly`)}</Text>
                                <LinearGradient colors={['#FFD700', '#FFCC00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ alignSelf: 'center', paddingVertical: responsiveFontSize(.2), paddingHorizontal: responsiveFontSize(1), borderRadius: 100, marginStart: responsiveFontSize(1) }}>
                                    <Text style={{ color: colors.black, fontSize: responsiveFontSize(1.6), fontWeight: '600' }}> {t('subscribed')}</Text>
                                </LinearGradient>
                            </View>
                            <Space height={responsiveHeight(.5)} />
                            <Text style={{ color: colors.blackOpacity(.7), fontSize: responsiveFontSize(1.6), fontWeight: '500' }}>{`${t(`save`)} ${isDriver ? `60%` : `50%`}`}</Text>
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            {isDriver ? <Text style={{ color: colors.black, fontSize: responsiveFontSize(3.5), fontWeight: 'bold' }}>{`₹199/`}<Text style={{ color: colors.blackOpacity(.5), fontSize: responsiveFontSize(2), textDecorationLine: 'line-through', fontWeight: '400' }}>{`₹499`}</Text></Text> :
                                <Text style={{ color: colors.black, fontSize: responsiveFontSize(3.5), fontWeight: 'bold' }}>{`₹499/`}<Text style={{ color: colors.blackOpacity(.5), fontSize: responsiveFontSize(2), textDecorationLine: 'line-through', fontWeight: '400' }}>{`₹999`}</Text></Text>}
                            {isDriver ?
                                < Text style={{ color: colors.blackOpacity(.7), fontSize: responsiveFontSize(1.4), fontWeight: '500', textAlign: 'center' }}>{t(`billedAnnual`)}</Text> : // add quater string here
                                <Text style={{ color: colors.blackOpacity(.7), fontSize: responsiveFontSize(1.4), fontWeight: '500', textAlign: 'center' }}>{t(`billedQuarter`)}</Text>}
                        </View>
                    </View>
                    {subscriptionDetails?.end_at && moment.unix(subscriptionDetails.end_at).isValid() && (
                        <Text
                            style={{
                                alignSelf: 'flex-end',
                                color: colors.black,
                                fontSize: responsiveFontSize(1.6),
                                fontWeight: 'bold',
                                marginTop: responsiveHeight(0.5)
                            }}>
                            {t('expired')}:
                            <Text style={{
                                color: colors.blackOpacity(1),
                                fontSize: responsiveFontSize(1.4),
                                fontWeight: '500'
                            }}>
                                {moment
                                    .unix(subscriptionDetails.end_at)
                                    .subtract(1, 'day')
                                    .format('DD/MM/YYYY')}
                            </Text>
                        </Text>
                    )}
                </View>
                <Space style={{ flex: 1 }} />
                <TouchableOpacity
                    onPress={_goback}
                    activeOpacity={0.7}
                    style={{
                        height: responsiveHeight(6.2),
                        width: responsiveWidth(90),
                        backgroundColor: colors.royalBlue,
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                        borderRadius: 100,
                    }}>
                    <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t('backToHome')}</Text>
                </TouchableOpacity>
                <Space height={responsiveHeight(8)} />
                <Space height={safeAreaInsets.bottom} />
            </View>
            {/* Email Input Popup Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={emailPopupVisible}
                onRequestClose={() => setEmailPopupVisible(false)}>
                <View style={{
                    flex: 1,
                    backgroundColor: colors.blackOpacity(0.5),
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <TouchableWithoutFeedback>
                        <View style={{
                            width: responsiveWidth(90),
                            backgroundColor: colors.white,
                            borderRadius: 16,
                            padding: responsiveWidth(5),
                            ...shadow
                        }}>
                            <View style={{ alignItems: 'center', marginBottom: responsiveHeight(2) }}>
                                <Text style={{
                                    fontSize: responsiveFontSize(2.2),
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                }}>
                                    {t('emailReceipt')}
                                </Text>
                            </View>
                            <Text style={{
                                fontSize: responsiveFontSize(1.7),
                                color: colors.blackOpacity(0.7),
                                textAlign: 'center',
                                marginBottom: responsiveHeight(2.5),
                                lineHeight: responsiveFontSize(2.2)
                            }}>
                                {t('weNeedYourEmail')}
                            </Text>
                            <TextInput
                                style={{
                                    borderWidth: 1,
                                    borderColor: colors.blackOpacity(0.2),
                                    borderRadius: 8,
                                    padding: responsiveWidth(3),
                                    marginBottom: responsiveHeight(2),
                                    fontSize: responsiveFontSize(1.8),
                                }}
                                placeholder={t('Email Address')}
                                placeholderTextColor={colors.blackOpacity(0.4)}
                                value={email}
                                onChangeText={(text) => {
                                    setEmail(text);
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                                <TouchableOpacity
                                    onPress={_handleSkipEmail}
                                    style={{
                                        padding: responsiveWidth(3),
                                        marginRight: 2,
                                        borderRadius: 8,
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderColor: colors.blackOpacity(0.2),
                                        paddingHorizontal: responsiveWidth(5),
                                    }}>
                                    <Text style={{ color: colors.blackOpacity(0.7), fontWeight: '500' }}>{t('skip')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={_handleEmailSubmit}
                                    style={{
                                        backgroundColor: colors.royalBlue,
                                        padding: responsiveWidth(3),
                                        borderRadius: 8,
                                        alignItems: 'center',
                                        paddingHorizontal: responsiveWidth(5),
                                    }}>
                                    <Text style={{ color: colors.white, fontWeight: '500' }}>{t('submit')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </Modal>
        </View >
    )
}

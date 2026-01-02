import { StyleSheet, Text, TouchableOpacity, View, Modal, Linking, ActivityIndicator } from 'react-native'
import React, {useState, useEffect} from 'react'
import { useColor, useResponsiveScale, useShadow } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop, isIOS } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Clipboard from '@react-native-clipboard/clipboard';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { AnimatedFAB } from 'react-native-paper';
import { END_POINTS } from '@truckmitr/src/utils/config';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function ContactUs() {
    const { t } = useTranslation();
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const [isExtended, setIsExtended] = useState(false);
    const [showCallbackModal, setShowCallbackModal] = useState(false);
    const [callbackReason, setCallbackReason] = useState('');
    const [callbackLoading, setCallbackLoading] = useState(false);
    const navigation = useNavigation<NavigatorProp>();
    const { shadow } = useShadow()
    const { isDriver } = useSelector((state: any) => { return state?.user })
    const [errors, setErrors] = useState<{
        callReason?: string;
    }>({});
    const driverReasons = [
        t('forJobs'),
        t('forVerification'),
        t('forTraining'),
        t('others'),
    ];
    const transporterReasons = [
        t('forHiringDriver'),
        t('forDriverVerification'),
        t('forBulkDriversRequirement'),
        t('others'),
    ];
    const callbackOptions = isDriver ? driverReasons : transporterReasons;

    const validate = (): boolean => {
        let valid = true;
        let newErrors: typeof errors = {};
        if (!callbackReason) {
            newErrors.callReason = t('contactReasonRequired');
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    const _goback = () => {
        navigation.goBack()
    }

       const handleCallbackSubmit = async () => {
        if (!validate()) return;
        setCallbackLoading(true);
        const formData = new FormData();
        formData.append('contact_reason', callbackReason);
        try {
            const response: any = await axiosInstance.post(END_POINTS.CALLBACK_REQUEST, formData);
            if (response?.data) {
                showToast(response?.data.message)
                setShowCallbackModal(false);
                setCallbackReason('');
                setErrors({});
            }
        } catch (error: any) {
            console.log(error);
        }
        finally {
            setCallbackLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            setIsExtended(true)
        }, 500);
    }, [])

    const _copyToClipboard = (text: string) => {
        Clipboard.setString(text);
        showToast(`${t('copied')} ${text}`)
    }

    const _makeCall = (number: string) => {
        Linking.openURL(`tel:${number}`);
    }

    const _sendEmail = (email: string) => {
        Linking.openURL(`mailto:${email}`);
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.white, alignItems: 'center' }}>
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{ width: responsiveWidth(100), fontSize: responsiveFontSize(2.2), color: colors.royalBlue, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }}>{t(`contactUs`)}</Text>
            </View>
            <Space height={responsiveHeight(2)} />
            <View style={{ width: responsiveWidth(95), backgroundColor: colors.white, borderRadius: 10, padding: responsiveFontSize(2), ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.4), }}>
                <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{t(`callOurSupportTeam`)}</Text>
                <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.4), fontWeight: 'bold', marginVertical: responsiveFontSize(.5) }}>{`18001024558`}</Text>
                <Space height={responsiveHeight(2)} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => _copyToClipboard('18001024558')} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: responsiveFontSize(3), borderRadius: 5, borderStyle: 'dashed', borderColor: colors.blackOpacity(.3), borderWidth: 1 }}>
                        <MaterialIcons name={'content-copy'} size={20} color={colors.royalBlue} />
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.8), fontWeight: 'bold', marginLeft: responsiveFontSize(1) }}>{t(`copyNumber`)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => _makeCall('18001024558')} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.royalBlue, padding: responsiveFontSize(1.2), paddingHorizontal: responsiveFontSize(2), borderRadius: 5 }}>
                        <Ionicons name={'call'} size={18} color={colors.white} />
                        <Text style={{ color: colors.white, fontWeight: '500', fontSize: responsiveFontSize(1.6), marginLeft: responsiveFontSize(1) }}>{t(`callForHelp`)}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Space height={responsiveHeight(5)} />
            <View style={{ width: responsiveWidth(95), backgroundColor: colors.white, borderRadius: 10, padding: responsiveFontSize(2), ...shadow, shadowColor: isIOS() ? colors.blackOpacity(.2) : colors.blackOpacity(.4), }}>
                <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.8), fontWeight: '500' }}>{t(`sendEmailToFeedback`)}</Text>
                <Text style={{ color: colors.black, fontSize: responsiveFontSize(2.4), fontWeight: 'bold', marginVertical: responsiveFontSize(.5) }}>{`contact@truckmitr.com`}</Text>
                <Space height={responsiveHeight(2)} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => _copyToClipboard('contact@truckmitr.com')} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: responsiveFontSize(3), borderRadius: 5, borderStyle: 'dashed', borderColor: colors.blackOpacity(.3), borderWidth: 1 }}>
                        <MaterialIcons name={'content-copy'} size={20} color={colors.royalBlue} />
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(1.8), fontWeight: 'bold', marginLeft: responsiveFontSize(1) }}>{t(`copyEmailId`)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => _sendEmail('contact@truckmitr.com')} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.royalBlue, padding: responsiveFontSize(1.2), paddingHorizontal: responsiveFontSize(2), borderRadius: 5 }}>
                        <MaterialCommunityIcons name={'email'} size={18} color={colors.white} />
                        <Text style={{ color: colors.white, fontWeight: '500', fontSize: responsiveFontSize(1.6), marginLeft: responsiveFontSize(1) }}>{t(`sendEmail`)}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Space style={{ flex: 1 }} />
            <View style={{ width: responsiveWidth(100), backgroundColor: colors.royalBlue }}>
                <Text style={{ color: colors.white, fontSize: responsiveFontSize(1.6), textAlign: 'center', margin: responsiveFontSize(1.5) }}>{`© 2025 TruckMitr Corporate Services Private Limited. \nAll Rights Reserved.`}</Text>
                <Space height={safeAreaInsets.bottom} />
            </View>
            {/* Callback Modal */}
                <Modal
                    visible={showCallbackModal}
                    transparent
                    onRequestClose={() => setShowCallbackModal(false)}
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>{t('requestCallback')}</Text>
                            <Space height={responsiveFontSize(2.5)} />
                            <View>
                                <Text style={{ color: colors.blackOpacity(.9), fontSize: responsiveFontSize(1.7), fontWeight: '600' }}>{t('contactReason')}</Text>
                                {callbackOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginVertical: responsiveFontSize(0.8),
                                        }}
                                        onPress={() => {
                                            setCallbackReason(option);
                                            setErrors((prevData) => ({
                                                ...prevData,
                                                callReason: undefined,
                                            }));
                                        }}
                                    >
                                        <View
                                            style={{
                                                height: 22,
                                                width: 22,
                                                borderRadius: 11,
                                                borderWidth: 2,
                                                borderColor: colors.royalBlue,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 10,
                                            }}
                                        >
                                            {callbackReason === option && (
                                                <View
                                                    style={{
                                                        height: 12,
                                                        width: 12,
                                                        borderRadius: 6,
                                                        backgroundColor: colors.royalBlue,
                                                    }}
                                                />
                                            )}
                                        </View>
                                        <Text style={{
                                            fontSize: responsiveFontSize(1.9),
                                            color: colors.blackOpacity(0.8),
                                            fontWeight: callbackReason === option ? 'bold' : '500',
                                        }}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                {errors?.callReason && (
                                    <Text style={{ color: 'red', fontSize: responsiveFontSize(1.6), marginTop: responsiveFontSize(.5) }}>{errors?.callReason}</Text>
                                )}
                            </View>
                            <TouchableOpacity
                                style={{ backgroundColor: colors.royalBlue, borderRadius: 8, padding: 12, alignItems: 'center', marginTop: responsiveFontSize(2) }}
                                onPress={handleCallbackSubmit}
                                disabled={callbackLoading}
                            >
                                {callbackLoading ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{t('submit')}</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowCallbackModal(false)} style={{ marginTop: 12, alignItems: 'center' }}>
                                <Text style={{ color: colors.royalBlue, fontWeight: 'bold' }}>{t('cancel')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
             <AnimatedFAB
                            icon={'phone'}
                            label={t('callback')}
                            color={colors.white}
                            extended={isExtended}
                            onPress={() => setShowCallbackModal(true)}
                            visible={true}
                            iconMode={'dynamic'}
                            style={{
                                position: 'absolute',
                                bottom: responsiveWidth(35),
                                right: responsiveWidth(5),
                                backgroundColor: colors.royalBlue
                            }}
                        />
        </View>
    )
}

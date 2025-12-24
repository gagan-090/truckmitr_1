import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useColor, useResponsiveScale, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space, TransporterVerificationStatusModal } from '@truckmitr/src/app/components';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useTranslation } from 'react-i18next';
import { hitSlop } from '@truckmitr/src/app/functions';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

export default function VerificationDriversByTransporter() {
    const { t } = useTranslation();
    useStatusBarStyle('dark-content')
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    const navigation = useNavigation<NavigatorProp>();
    const [existingVerification, setExistingVerification] = useState<any>(null);
    const [verificationData, setVerificationData] = useState<any>(null);
    const [verificationStatusModal, setVerificationStatusModal] = useState(false);
    const [paymentDetails, setIsPaymentDetails] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const _goback = () => {
        navigation.goBack();
    };

    const _navigateToSingleDriverVerification = () => {
        navigation.navigate(STACKS.TRANSPORTER_VERIFICATION, {
            verificationType: 'single'
        })
    }

    const _navigateToDriverPackVerification = () => {
        navigation.navigate(STACKS.TRANSPORTER_VERIFICATION, {
            verificationType: 'pack',
        })
    }

    const _onpressDocumentUploadScreen = () => {       
        navigation.navigate(STACKS.VERIFIED_DRIVERS_DOCUMENTS_UPLOAD)
    };

    const _onpressContactSales = () => {
        navigation.navigate(STACKS.CONTACT_US)
    }

    const fetchVerificationStatus = useCallback(async () => {
        try {
            const response: any = await axiosInstance.get(
                END_POINTS?.DRIVERVERIFICATIONSTATUS,
            );
            if (response?.data?.payment) {
                setIsPaymentDetails(response?.data?.payment)
            }
            if (response?.data?.success && response?.data?.data) {
                const data = response.data.data;
                if (data.length > 0) {
                    setVerificationData(data);
                    setExistingVerification(data);
                }
            }
        } catch (error) {
            console.error('Error fetching verification status:', error);
        } finally {
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchVerificationStatus();
        }, [fetchVerificationStatus]),
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchVerificationStatus()
    }, []);


    return (
        <View style={{ flex: 1, backgroundColor: colors.white }}>
            <Space height={safeAreaInsets.top} />
            <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback} style={{ height: responsiveFontSize(4), width: responsiveFontSize(4), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 100, zIndex: 100 }}>
                    <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={{
                    width: responsiveWidth(100),
                    fontSize: responsiveFontSize(2.2),
                    color: colors.royalBlue,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    position: 'absolute',
                    zIndex: 1,
                }}>{t('verifyYourDrivers')}</Text>
                <TouchableOpacity
                    hitSlop={hitSlop(10)}
                    onPress={onRefresh}
                    disabled={refreshing}
                    style={{
                        position: 'absolute',
                        right: responsiveWidth(5),
                        height: responsiveFontSize(4),
                        width: responsiveFontSize(4),
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.white,
                        borderRadius: 100,
                        zIndex: 100
                    }}
                >
                    {refreshing ? (
                        <ActivityIndicator size="small" color={colors.royalBlue} />
                    ) : (
                        <Ionicons
                            name={'refresh'}
                            size={24}
                            color={colors.royalBlue}
                        />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: responsiveHeight(21) }}>
                <Text style={[styles.subText, { color: colors.black, fontSize: responsiveFontSize(2), paddingHorizontal: responsiveWidth(6) }]}>
                    {t('buildTrustWithShippers')}
                </Text>
                {paymentDetails?.is_paid && (
                    <>
                        <TouchableOpacity
                            style={[styles.statusButton, { marginHorizontal: 16 }]}
                            onPress={() => navigation.navigate(STACKS.PAYMENT_HISTORY_SCREEN)}
                        >
                            <Text style={styles.statusButtonText}>
                                {t('paymentHistory')}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={16}
                                color={colors.royalBlue}
                            />
                        </TouchableOpacity>
                    </>
                )}
                {paymentDetails?.is_paid && (
                    <>
                        <TouchableOpacity
                            style={[styles.statusButton, { marginHorizontal: 16, }]}
                            onPress={_onpressDocumentUploadScreen}
                        >
                            <Text style={styles.statusButtonText}>
                                {t('uploadDocumentsForDrivers')}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={16}
                                color={colors.royalBlue}
                            />
                        </TouchableOpacity>
                    </>
                )}
                {/* Existing Verification Status */}
                {existingVerification && existingVerification.length > 0 && (
                    <>
                        <TouchableOpacity
                            style={[styles.statusButton, { marginHorizontal: 16, }]}
                            onPress={() => {
                                setVerificationData(existingVerification);
                                setVerificationStatusModal(true);
                            }}
                        >
                            <Text style={styles.statusButtonText}>
                                {t('viewVerificationStatus')}
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={16}
                                color={colors.royalBlue}
                            />
                        </TouchableOpacity>
                        <Space height={responsiveFontSize(2)} />
                    </>
                )}
                <Pressable style={styles.card} onPress={_navigateToSingleDriverVerification}>
                    <View style={{ flex: 2 }}>
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2.2), fontWeight: 'bold' }}>{t('singleDriver')}</Text>
                        <Text style={[{ color: colors.black, fontSize: responsiveFontSize(2), fontWeight: '500' }]}>{t('priceSingleDriver')}</Text>
                        <Text>{t('verifyOneDriver')}</Text>
                    </View>
                    <Image
                        source={{
                            uri: "https://cdn-icons-png.flaticon.com/512/8583/8583437.png",
                        }}
                        style={styles.image}
                    />
                </Pressable>

                {/* Card 2 */}
                <Pressable style={styles.card} onPress={_navigateToDriverPackVerification}>
                    <View style={{ flex: 2 }}>
                        <Text style={{ color: colors.royalBlue, fontSize: responsiveFontSize(2.2), fontWeight: 'bold' }}>{t('tenDriverPack')}</Text>
                        <Text style={[{ color: colors.black, fontSize: responsiveFontSize(2), fontWeight: '500' }]}>{t('pricePerDriver')}</Text>
                        <Text>{t('verifyTenDrivers')}</Text>
                    </View>
                    <Image
                        source={{
                            uri: "https://cdn-icons-png.flaticon.com/512/11725/11725890.png",
                        }}
                        style={styles.image}
                    />
                </Pressable>

                {/* Card 3 */}
                <View style={styles.card}>
                    <View style={{ flex: 1 }}>
                        <Text style={[{ color: colors.royalBlue, fontSize: responsiveFontSize(2.2), fontWeight: 'bold' }]}>{t('bulkDrivers')}</Text>
                        <Text style={[{ color: colors.black, fontSize: responsiveFontSize(2), fontWeight: '500' }]}>
                            {t('contactSalesDescription')}
                        </Text>
                        <Pressable style={[styles.btn, { backgroundColor: colors.royalBlue }]} onPress={_onpressContactSales}>
                            <Text style={{ color: colors.white, fontSize: responsiveFontSize(2), fontWeight: '500' }}>{t('contactSales')}</Text>
                        </Pressable>
                    </View>
                    <Image
                        source={{
                            uri: "https://cdn-icons-png.flaticon.com/512/2706/2706950.png"
                        }}
                        style={styles.image}
                    />
                </View>
            </ScrollView>
            {/* Verification Status Modal */}
            <TransporterVerificationStatusModal
                visible={verificationStatusModal}
                onClose={() => setVerificationStatusModal(false)}
                verificationData={verificationData}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    subText: { paddingHorizontal: 16, marginBottom: 5, marginTop: 20, fontWeight: '500' },
    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        margin: 12,
        borderRadius: 12,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        paddingHorizontal: 12
    },
    disabledCard: {
        opacity: 0.6,
    },
    image: {
        width: 50,
        height: 50
    },
    btn: {
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: "flex-start",
    },
    consentContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: 0.5,
        borderTopColor: 'gray'
    },
    consentContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkboxContainer: {
        marginRight: 8,
        padding: 4,
    },
    consentText: {
        flex: 1,
        flexShrink: 1,
        flexWrap: 'wrap',
    },
    buttonContainer: {
        backgroundColor: '#fff',
    },
    startButton: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F0F4FF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#1E3A8A30',
    },
    statusButtonText: {
        fontSize: 14,
        color: '#1E3A8A',
        fontWeight: '600',
    },
});
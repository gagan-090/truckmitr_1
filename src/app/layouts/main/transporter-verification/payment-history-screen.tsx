import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { useColor } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigatorParams } from '@truckmitr/stacks/stacks';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Space } from '@truckmitr/src/app/components';
import { useTranslation } from 'react-i18next';
import { hitSlop } from '@truckmitr/src/app/functions';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

interface Payment {
    payment_id: number;
    amount: string;
    payment_type: string;
    status: string;
    method: string;
    driver_count: string;
    order_id: string;
    transaction_id: string;
    payment_date: string;
}

interface PaymentData {
    is_paid: boolean;
    latest_payment: Payment;
    all_payments: Payment[];
}

export default function PaymentHistoryScreen() {
    const { t } = useTranslation();
    const colors = useColor();
    const safeAreaInsets = useSafeAreaInsets();
    const navigation = useNavigation<NavigatorProp>();
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const _goback = () => {
        navigation.goBack();
    };

    const fetchPaymentHistory = useCallback(async () => {
        try {
            setLoading(true);
            const response: any = await axiosInstance.get(
                END_POINTS?.DRIVERVERIFICATIONSTATUS,
            );

            if (response?.data?.success && response?.data?.payment) {
                setPaymentData(response.data.payment);
            }
        } catch (error) {
            console.error('Error fetching payment history:', error);
            Alert.alert('Error', 'Failed to fetch payment history');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPaymentHistory();
    }, [fetchPaymentHistory]);

    useFocusEffect(
        useCallback(() => {
            fetchPaymentHistory();
        }, [fetchPaymentHistory]),
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'captured':
            case 'verified':
            case 'completed':
                return 'green';
            case 'pending':
                return 'orange';
            case 'failed':
            case 'rejected':
                return colors.error;
            default:
                return 'gray';
        }
    };

    const getStatusText = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'captured':
                return t('Paid');
            case 'verified':
                return t('verified');
            case 'pending':
                return t('pending');
            case 'failed':
                return t('failed');
            case 'rejected':
                return t('rejected');
            default:
                return status;
        }
    };

    const getMethodIcon = (method: string) => {
        switch (method?.toLowerCase()) {
            case 'upi':
                return 'phone-portrait-outline';
            case 'card':
                return 'card-outline';
            case 'netbanking':
                return 'business-outline';
            case 'wallet':
                return 'wallet-outline';
            default:
                return 'card-outline';
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.white }]}>
                <Space height={safeAreaInsets.top} />
                <View style={styles.header}>
                    <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback}>
                        <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.royalBlue }]}>
                        {t('paymentHistory')}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.white }]}>
            <Space height={safeAreaInsets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity hitSlop={hitSlop(10)} onPress={_goback}>
                    <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.royalBlue }]}>
                    {t('paymentHistory')}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: safeAreaInsets.bottom + 20 }
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.royalBlue]}
                        tintColor={colors.royalBlue}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Latest Payment Summary */}
                {paymentData?.latest_payment && (
                    <View style={[styles.summaryCard, { backgroundColor: colors.royalBlue + '10' }]}>
                        <Text style={[styles.summaryTitle, { color: colors.royalBlue }]}>
                            {t('latestPayment')}
                        </Text>
                        <View style={styles.summaryRow}>
                            <View>
                                <Text style={[styles.amount, { color: colors.royalBlue }]}>
                                    ₹{paymentData.latest_payment.amount}
                                </Text>
                                <Text style={[styles.driverCount, { color: colors.black }]}>
                                    {paymentData.latest_payment.driver_count} {t('drivers')}
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.date, { color: 'gray' }]}>
                            {formatDate(paymentData.latest_payment.payment_date)} • {formatTime(paymentData.latest_payment.payment_date)}
                        </Text>
                    </View>
                )}

                {/* All Payments List */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.black }]}>
                        {t('allPayments')} ({paymentData?.all_payments?.length || 0})
                    </Text>

                    {paymentData?.all_payments?.map((payment, index) => (
                        <View
                            key={payment.payment_id}
                            style={[
                                styles.paymentCard,
                                {
                                    backgroundColor: colors.white,
                                    borderColor: colors.royalBlue,
                                    marginTop: index === 0 ? 0 : 12,
                                }
                            ]}
                        >
                            <View style={styles.paymentHeader}>
                                <View style={styles.paymentMethod}>
                                    <Ionicons
                                        name={getMethodIcon(payment.method)}
                                        size={20}
                                        color={colors.royalBlue}
                                    />
                                    <Text style={[styles.methodText, { color: colors.black }]}>
                                        {payment.method.toUpperCase()}
                                    </Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
                                    <Text style={styles.statusBadgeText}>
                                        {getStatusText(payment.status)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.paymentDetails}>
                                <Text style={[styles.paymentAmount, { color: colors.black }]}>
                                    ₹{payment.amount}
                                </Text>
                                <Text style={[styles.driverInfo, { color: 'gray' }]}>
                                    {payment.driver_count} {t('drivers')}
                                </Text>
                            </View>

                            <View style={styles.paymentMeta}>
                                <Text style={[styles.metaText, { color: 'gray' }]}>
                                    {formatDate(payment.payment_date)} • {formatTime(payment.payment_date)}
                                </Text>
                                <Text style={[styles.metaText, { color: 'gray' }]}>
                                    {t('orderId')}: {payment.order_id}
                                </Text>
                            </View>

                            {payment.transaction_id && (
                                <View style={styles.transactionId}>
                                    <Text style={[styles.transactionText, { color: 'gray' }]}>
                                        {t('transactionId')}:
                                    </Text>
                                    <Text style={[styles.transactionIdText, { color: colors.royalBlue }]}>
                                        {payment.transaction_id}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}

                    {(!paymentData?.all_payments || paymentData.all_payments.length === 0) && (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={48} color={'gray'} />
                            <Text style={[styles.emptyText, { color: 'gray' }]}>
                                {t('noPaymentsFound')}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryCard: {
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    amount: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    driverCount: {
        fontSize: 14,
        marginTop: 4,
    },
    date: {
        fontSize: 12,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    paymentCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    methodText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    paymentDetails: {
        marginBottom: 12,
    },
    paymentAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    driverInfo: {
        fontSize: 14,
        marginTop: 4,
    },
    paymentMeta: {
        marginBottom: 8,
    },
    metaText: {
        fontSize: 12,
        marginBottom: 2,
    },
    transactionId: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    transactionText: {
        fontSize: 12,
        marginRight: 4,
    },
    transactionIdText: {
        fontSize: 12,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 12,
        textAlign: 'center',
    },
});
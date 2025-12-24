/**
 * Driver Document Upload Screen
 * @format
 */

import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop } from '@truckmitr/src/app/functions';
import { useColor, useStatusBarStyle, useResponsiveScale } from '@truckmitr/src/app/hooks';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { BASE_URL, END_POINTS } from '@truckmitr/src/utils/config';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { NavigatorParams } from '@truckmitr/stacks/stacks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DriversDocumentUploadModal from './drivers-upload-document-modal';

type NavigatorProp = NativeStackNavigationProp<
    NavigatorParams,
    keyof NavigatorParams
>;

interface VerificationDriver {
    driver_id: number;
    driver_unique_id: number;
    driver_name: string;
    driver_mobile: string;
    verification_status?: {
        final_status?: 'verified' | 'rejected' | 'pending' | 'in_progress';
        id_verification_status?: 'verified' | 'rejected' | 'pending';
        address_verification_status?: 'verified' | 'rejected' | 'pending';
        court_check_status?: 'verified' | 'rejected' | 'pending';
        completed_at?: string;
        notes?: string;
    };
    images?: string;
    documents?: {
        all_uploaded: boolean
    }
    created_at?: string;
    overall_status?: string
}

const DriverDocumentUploadScreen = () => {
    const navigation = useNavigation<NavigatorProp>();
    const safeAreaInsets = useSafeAreaInsets();
    const { t } = useTranslation();
    const colors = useColor();
    useStatusBarStyle('dark-content');
    type TabType = 'pending' | 'started';
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [loading, setLoading] = useState(true);
    const [verificationDrivers, setVerificationDrivers] = useState<VerificationDriver[]>([]);
    const [documentUploadModal, setDocumentUploadModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<VerificationDriver | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const { responsiveWidth, responsiveFontSize } =
        useResponsiveScale();
    const fetchVerificationStatus = useCallback(async () => {
        try {
            setLoading(true);
            const response: any = await axiosInstance.get(
                END_POINTS?.DRIVERVERIFICATIONSTATUS,
            );
            if (response?.data?.success && response?.data?.data) {
                const data = response.data.data;
                if (data.length > 0) {
                    setVerificationDrivers(data);
                } else {
                    setVerificationDrivers([]);
                }
            } else {
                setVerificationDrivers([]);
            }
        } catch (error) {
            console.error('Error fetching verification status:', error);
            showToast(t('errorFetchingVerificationStatus'));
            setVerificationDrivers([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [t]);

    useFocusEffect(
        useCallback(() => {
            fetchVerificationStatus();
        }, [fetchVerificationStatus]),
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchVerificationStatus();
    };

    const handleDocumentUpload = (driver: VerificationDriver) => {
        setSelectedDriver(driver);
        setDocumentUploadModal(true);
    };

    const handleCloseDocumentUploadModal = () => {
        setDocumentUploadModal(false);
        setSelectedDriver(null);
    };

    const handleDocumentUploadSuccess = () => {
        showToast(t('documentsUploadedSuccessfully'));
        fetchVerificationStatus();
        setDocumentUploadModal(false);
        setSelectedDriver(null);
    };

    const getStatusText = (status: string | undefined) => {
        switch (status) {
            case 'verified':
                return t('verified');
            case 'rejected':
                return t('rejected');
            case 'in_progress':
                return t('inProgress');
            default:
                return t('pending');
        }
    };

    const goBack = () => {
        navigation.goBack();
    };

         // Tab Header Component
          const TabHeader = () => (
              <View style={{
                  flexDirection: 'row',
                  marginHorizontal: responsiveWidth(3),
                  marginBottom: responsiveFontSize(2),
                  justifyContent: 'space-between',
              }}>
                  {(['pending', 'started'] as TabType[]).map((tab) => {
                      const isActive = activeTab === tab;
                      return (
                          <TouchableOpacity
                              key={tab}
                              style={{
                                  flex: 1,
                                  marginHorizontal: 4,
                                  paddingVertical: responsiveFontSize(1.6),
                                  alignItems: 'center',
                                  borderRadius: 8,
                                  backgroundColor: isActive ? colors.royalBlue : colors.whiteOpacity(1),
                                  borderWidth: 1,
                                  borderColor: isActive ? colors.royalBlue : colors.blackOpacity(0.2),
                              }}
                              onPress={() => setActiveTab(tab)}
                          >
                              <Text style={{
                                  color: isActive ? colors.white : colors.blackOpacity(0.5),
                                  fontSize: responsiveFontSize(1.8),
                                  fontWeight: isActive ? '600' : '500'
                              }}>
                                  {tab === 'pending' ? t('ducumentPending') : t('verificationStarted')}
                              </Text>
                          </TouchableOpacity>
                      );
                  })}
              </View>
          );

    const renderDriverItem = ({ item, index }: { item: VerificationDriver; index: number }) => {
        const finalStatus = item?.overall_status;
        return (
            <View style={styles.driverCard}>
                <View style={styles.driverContent}>
                    <Image
                        style={styles.driverImage}
                        source={{
                            uri: item.images
                                ? `${BASE_URL}public/${item.images}`
                                : 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png',
                        }}
                    />

                    <View style={styles.driverInfo}>
                        <View style={styles.driverHeader}>
                            <Text style={styles.driverName}>{item.driver_name}</Text>
                            <View style={[
                                styles.finalStatusBadge,
                                finalStatus === 'verified' && styles.verifiedBadge,
                                finalStatus === 'rejected' && styles.rejectedBadge,
                                finalStatus === 'in_progress' && styles.inProgressBadge
                            ]}>
                                <Text style={[
                                    styles.finalStatusText,
                                    finalStatus === 'verified' && styles.verifiedText,
                                    finalStatus === 'rejected' && styles.rejectedText,
                                    finalStatus === 'in_progress' && styles.inProgressText
                                ]}>
                                    {getStatusText(finalStatus)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.driverDetails}>
                            <Text style={styles.driverMobile}>{item.driver_unique_id}</Text>
                        </View>
                    </View>
                </View>

                {/* Action Button */}
                {(!item?.documents?.all_uploaded || finalStatus == 'rejected')
                    && (
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={() => handleDocumentUpload(item)}
                        >
                            <Ionicons name="cloud-upload-outline" size={16} color={colors.white} />
                            <Text style={styles.uploadButtonText}>{t('uploadDocuments')}</Text>
                        </TouchableOpacity>
                    )}

                {item?.documents?.all_uploaded && finalStatus === 'pending' && (
                    <View style={styles.uploadedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.royalBlue} />
                        <Text style={styles.uploadedText}>{t('documentsUploaded')}</Text>
                    </View>
                )}
            </View>
        );
    };
    
    const pendingDocsDriverList = verificationDrivers.filter(item => item?.documents?.all_uploaded === false);
    const startedVerificationDriverList = verificationDrivers.filter(item => item?.documents?.all_uploaded === true);

    return (
        <View style={styles.container}>
            <Space height={safeAreaInsets.top} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    hitSlop={hitSlop(10)}
                    onPress={goBack}
                    style={styles.backButton}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.royalBlue} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {t('uploadDriverDocuments')}
                </Text>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsText}>
                    {t('uploadDocumentsInstructions')}
                </Text>
            </View>

            <TabHeader />

            {/* Driver List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={colors.royalBlue} size="large" />
                    <Text style={styles.loadingText}>{t('loadingVerifiedDrivers')}</Text>
                </View>
            ) : (
                activeTab === 'pending' ?
                pendingDocsDriverList.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Image
                        style={styles.emptyImage}
                        source={{ uri: 'https://truckmitr.com/public/images/preview.png' }}
                    />
                    <Text style={styles.emptyText}>{t('noVerifiedDrivers')}</Text>
                    <Text style={styles.emptySubtext}>
                        {t('noVerifiedDriversDescription')}
                    </Text>
                </View>
               ) :
                <FlatList
                    data={pendingDocsDriverList}
                    renderItem={renderDriverItem}
                    keyExtractor={(item, index) => (item.driver_id || index).toString()}
                    contentContainerStyle={styles.driverList}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                /> : 
                  startedVerificationDriverList.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Image
                        style={styles.emptyImage}
                        source={{ uri: 'https://truckmitr.com/public/images/preview.png' }}
                    />
                    <Text style={styles.emptyText}>{t('noVerifiedDrivers')}</Text>
                    <Text style={styles.emptySubtext}>
                        {t('noVerifiedDriversDescription')}
                    </Text>
                </View>
               ) :
                <FlatList
                    data={startedVerificationDriverList}
                    renderItem={renderDriverItem}
                    keyExtractor={(item, index) => (item.driver_id || index).toString()}
                    contentContainerStyle={styles.driverList}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                />
            )}

            {/* Document Upload Modal */}
            <DriversDocumentUploadModal
                visible={documentUploadModal}
                onClose={handleCloseDocumentUploadModal}
                onSuccess={handleDocumentUploadSuccess}
                driver_id={selectedDriver?.driver_id?.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        position: 'relative',
    },
    backButton: {
        height: 40,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 20,
        zIndex: 100,
    },
    headerTitle: {
        position: 'absolute',
        width: '100%',
        left:20,
        fontSize: 18,
        color: '#1E3A8A',
        fontWeight: 'bold',
        textAlign: 'center',
        zIndex: 1,
    },
    instructionsContainer: {
        padding: 16,
        backgroundColor: '#F8FAFC',
        marginHorizontal: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginBottom: 8,
    },
    instructionsText: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748B',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyImage: {
        height: 120,
        width: 200,
        tintColor: '#E2E8F0',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        fontWeight: '500',
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 20,
    },
    driverList: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    driverCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    driverContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    driverImage: {
        height: 50,
        width: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    driverInfo: {
        flex: 1,
    },
    driverHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    driverName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
        marginRight: 8,
    },
    finalStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    verifiedBadge: {
        backgroundColor: '#D1FAE5',
        borderColor: '#10B981',
    },
    rejectedBadge: {
        backgroundColor: '#FEE2E2',
        borderColor: '#EF4444',
    },
    inProgressBadge: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
    },
    verifiedText: {
        color: '#059669',
    },
    rejectedText: {
        color: '#DC2626',
    },
    inProgressText: {
        color: '#D97706',
    },
    driverDetails: {
        marginBottom: 6,
    },
    driverId: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 2,
    },
    driverMobile: {
        fontSize: 13,
        color: '#6B7280',
    },
    starRating: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    star: {
        marginRight: 2,
    },
    verificationInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    verificationId: {
        fontSize: 12,
        color: '#6B7280',
        flex: 1,
    },
    verificationDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1E3A8A',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    uploadedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#F0F4FF',
        gap: 8,
    },
    uploadedText: {
        color: '#1E3A8A',
        fontSize: 14,
        fontWeight: '600',
    },
    finalStatusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
});

export default DriverDocumentUploadScreen;
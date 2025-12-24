import React, { useState } from 'react';
import { hitSlop } from '@truckmitr/src/app/functions';
import { useColor, useResponsiveScale } from '@truckmitr/src/app/hooks';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface TransporterVerificationStatusModalProps {
  visible: boolean;
  onClose: () => void;
  verificationData?: any;
}

const TransporterVerificationStatusModal = ({
  visible,
  onClose,
  verificationData,
}: TransporterVerificationStatusModalProps) => {
  console.log('verificationData==>', verificationData);
  const { responsiveWidth, responsiveFontSize, responsiveHeight } =
    useResponsiveScale();
  const { t } = useTranslation();
  const colors = useColor();

  // State for managing collapsed/expanded drivers
  const [expandedDrivers, setExpandedDrivers] = useState<Set<number>>(new Set());

  // Calculate overall status from driver array
  const getOverallStatus = () => {
    if (!verificationData || !Array.isArray(verificationData) || verificationData.length === 0) {
      return 'pending';
    }

    const allVerified = verificationData.every(driver =>
      driver.verification?.final_status === 'verified' || driver.overall_status === 'verified'
    );
    const anyVerified = verificationData.some(driver =>
      driver.verification?.final_status === 'verified' || driver.overall_status === 'verified'
    );
    const anyRejected = verificationData.some(driver =>
      driver.verification?.final_status === 'rejected' || driver.overall_status === 'rejected'
    );

    if (allVerified) return 'completed';
    if (anyRejected) return 'discrepancy';
    if (anyVerified) return 'in_progress';
    return 'pending';
  };

  const overallStatus = getOverallStatus();

  // Get status-specific content
  const getStatusContent = () => {
    switch (overallStatus) {
      case 'completed':
        return {
          title: t('transporterVerificationCompleted'),
          subtitle: t('transporterVerificationCompletedSuccessfully'),
          showDownloadButton: true,
        };
      case 'discrepancy':
        return {
          title: t('transporterVerificationDiscrepancy'),
          subtitle: t('transporterVerificationNeedsAttention'),
          showDownloadButton: true,
        };
      case 'in_progress':
        return {
          title: t('transporterVerificationInProgress'),
          subtitle: t('transporterVerificationBeingProcessed'),
          showDownloadButton: false,
        };
      default:
        return {
          title: t('transporterVerificationPending'),
          subtitle: t('transporterVerificationAwaitingStart'),
          showDownloadButton: false,
        };
    }
  };

  const content = getStatusContent();

  // Toggle driver expansion
  const toggleDriverExpansion = (driverId: number) => {
    const newExpandedDrivers = new Set(expandedDrivers);
    if (newExpandedDrivers.has(driverId)) {
      newExpandedDrivers.delete(driverId);
    } else {
      newExpandedDrivers.add(driverId);
    }
    setExpandedDrivers(newExpandedDrivers);
  };

  // Check if driver is expanded
  const isDriverExpanded = (driverId: number) => {
    return expandedDrivers.has(driverId);
  };

  // Helper functions for status display
  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return t('verified');
      case 'pending':
        return t('pending');
      case 'rejected':
        return t('rejected');
      case 'in_progress':
        return t('inProgress');
      default:
        return status || t('pending');
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return {
          backgroundColor: colors.greenOpacitiy(0.2),
          borderColor: colors.greenOpacitiy(1),
        };
      case 'rejected':
        return {
          backgroundColor: '#FEE2E2',
          borderColor: '#EF4444',
        };
      case 'in_progress':
        return {
          backgroundColor: colors.royalBlueOpacity(0.2),
          borderColor: colors.royalBlue,
        };
      case 'pending':
      default:
        return {
          backgroundColor: colors.blackOpacity(0.1),
          borderColor: colors.blackOpacity(0.3),
        };
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return { color: colors.greenOpacitiy(1) };
      case 'rejected':
        return { color: '#DC2626'};
      case 'in_progress':
        return { color: colors.royalBlue };
      case 'pending':
      default:
        return { color: colors.blackOpacity(0.7) };
    }
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return '-';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            padding: responsiveWidth(3),
          }}
        >
          <TouchableOpacity
            hitSlop={hitSlop(10)}
            onPress={onClose}
            style={{
              height: responsiveFontSize(4),
              width: responsiveFontSize(4),
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.white,
              borderRadius: 100,
              zIndex: 100,
            }}
          >
            <Ionicons
              name={'chevron-back'}
              size={24}
              color={colors.royalBlue}
            />
          </TouchableOpacity>
          <Text
            style={{
              width: responsiveWidth(100),
              fontSize: responsiveFontSize(2.2),
              color: colors.royalBlue,
              fontWeight: 'bold',
              textAlign: 'center',
              position: 'absolute',
              zIndex: 1,
            }}
          >
            {t('transporterVerificationStatus')}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: responsiveHeight(8) }}
        >
          {/* Status Header */}
          <View
            style={{
              paddingHorizontal: responsiveWidth(5),
              marginBottom: responsiveFontSize(2),
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(2.4),
                fontWeight: 'bold',
                color: overallStatus === 'completed' ? colors.greenOpacitiy(1) : colors.black,
                textAlign: 'center',
                marginBottom: responsiveFontSize(1),
              }}
            >
              {content.title}
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(1.6),
                color: colors.blackOpacity(0.7),
                textAlign: 'center',
              }}
            >
              {content.subtitle}
            </Text>
          </View>
          {/* TAT */}
          <Text style={styles.sectionTitle}>
            {t('estimatedTurnaroundTime')}
          </Text>
          <View style={styles.tatWrapper}>
            <TatRow title={t('idVerification')} value={t(`1-2Days`)} />
            <TatRow title={t('addressVerification')} value={t(`2-14Days`)} />
            <TatRow title={t('courtVerification')} value={t(`1-2Days`)} />
          </View>

          {/* Driver List with Status */}
          <View style={styles.driversContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('driverVerificationStatus')}</Text>
              {verificationData && Array.isArray(verificationData) && verificationData.length > 1 && (
                <TouchableOpacity
                  style={styles.expandAllButton}
                  onPress={() => {
                    const allExpanded = verificationData.every(driver =>
                      expandedDrivers.has(driver.driver_id)
                    );
                    if (allExpanded) {
                      setExpandedDrivers(new Set());
                    } else {
                      const allDriverIds = verificationData.map(driver => driver.driver_id);
                      setExpandedDrivers(new Set(allDriverIds));
                    }
                  }}
                >
                  <Text style={styles.expandAllButtonText}>
                    {verificationData.every(driver =>
                      expandedDrivers.has(driver.driver_id)
                    ) ? t('collapseAll') : t('expandAll')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {verificationData && Array.isArray(verificationData) && verificationData.map((driver) => {
              const driverId = driver.driver_id;
              const isExpanded = isDriverExpanded(driverId);
              const finalStatus = driver.verification?.final_status || driver.overall_status;
              const verification = driver.verification || {};

              return (
                <View key={driverId} style={styles.driverStatusCard}>
                  {/* Driver Header - Always Visible */}
                  <TouchableOpacity
                    style={styles.driverHeader}
                    onPress={() => toggleDriverExpansion(driverId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.driverInfo}>
                      <Text style={styles.driverName}>{driver.driver_name}</Text>
                      <Text style={styles.driverMobile}>{driver.driver_unique_id}</Text>
                    </View>

                    <View style={styles.driverHeaderRight}>
                      {/* Final Status Badge */}
                      <View style={[
                        styles.finalStatusBadge,
                        finalStatus === 'verified' && styles.verifiedBadge,
                        finalStatus === 'rejected' && styles.rejectedBadge
                      ]}>
                        <Text style={[
                          styles.finalStatusText,
                          finalStatus === 'verified' && styles.verifiedText,
                          finalStatus === 'rejected' && styles.rejectedText
                        ]}>
                          {finalStatus === 'verified' ? t('verified') :
                            finalStatus === 'rejected' ? t('rejected') : t('pending')}
                        </Text>
                      </View>

                      {/* Expand/Collapse Icon */}
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.royalBlue}
                        style={styles.expandIcon}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <View style={styles.verificationSteps}>
                      {/* ID Verification Status */}
                      <View style={styles.statusRow}>
                        <View style={styles.statusInfoContainer}>
                          <Text style={styles.statusLabel}>{t('idVerification')}</Text>
                          {verification.id_status?.updated_at &&
                            <Text style={styles.updatedDate}>
                              {t('lastUpdated')} {formatDate(verification.id_status?.updated_at)}
                            </Text>
                          }
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            getStatusBadgeStyle(
                              verification.id_status?.status,
                            ),
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              getStatusTextStyle(
                                verification.id_status?.status,
                              ),
                            ]}
                          >
                            {getStatusDisplayText(
                              verification.id_status?.status
                            )}
                          </Text>
                        </View>
                      </View>
                      {/* Address Verification Status */}
                      <View style={styles.statusRow}>
                        <View style={styles.statusInfoContainer}>
                          <Text style={styles.statusLabel}>
                            {t('addressVerification')}
                          </Text>
                          {verification.address_status?.updated_at &&
                            <Text style={styles.updatedDate}>
                              {t('lastUpdated')} {formatDate(verification?.address_status?.updated_at)}
                            </Text>
                          }
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            getStatusBadgeStyle(
                              verification?.address_status?.status,
                            ),
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              getStatusTextStyle(
                                verification?.address_status?.status,
                              ),
                            ]}
                          >
                            {getStatusDisplayText(
                              verification?.address_status?.status,
                            )}
                          </Text>
                        </View>
                      </View>
                      {/* Court Check Status */}
                      <View style={styles.statusRow}>
                        <View style={styles.statusInfoContainer}>
                          <Text style={styles.statusLabel}>{t('courtVerification')}</Text>
                          {verification?.court_check_status?.updated_at &&
                            <Text style={styles.updatedDate}>
                              {t('lastUpdated')} {formatDate(verification?.court_check_status?.updated_at)}
                            </Text>
                          }
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            getStatusBadgeStyle(
                              verification?.court_check_status?.status,
                            ),
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              getStatusTextStyle(
                                verification?.court_check_status?.status,
                              ),
                            ]}
                          >
                            {getStatusDisplayText(
                              verification?.court_check_status?.status,
                            )}
                          </Text>
                        </View>
                      </View>

                      {/* Final Status */}
                      <View style={[styles.stepRow, styles.finalStatusRow]}>
                        <Text style={styles.finalStatusLabel}>{t('finalStatus')}</Text>
                        <View style={[
                          styles.statusBadge,
                          finalStatus === 'verified' && styles.verifiedBadge,
                          finalStatus === 'rejected' && styles.rejectedBadge
                        ]}>
                          <Text style={[
                            styles.statusText,
                            finalStatus === 'verified' && styles.verifiedText,
                            finalStatus === 'rejected' && styles.rejectedText
                          ]}>
                            {finalStatus === 'verified' ? t('verified') :
                              finalStatus === 'rejected' ? t('rejected') : t('pending')}
                          </Text>
                        </View>
                      </View>

                      {/* Notes */}
                      {driver.verification?.notes && (
                        <View style={styles.notesContainer}>
                          <Text style={styles.notesTitle}>{t('notes')}</Text>
                          <Text style={styles.notesText}>{driver.verification_status.notes}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const TatRow = ({ title, value }: { title: string; value: string }) => (
  <View style={styles.tatRow}>
    <Text style={styles.tatTitle}>{title}</Text>
    <Text style={styles.tatValue}>{value}</Text>
  </View>
);

export default TransporterVerificationStatusModal;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 48, // balance arrow space
    color: '#111418',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: 'black',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statusWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderColor: '#e8e8e8',
  },
  statusItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    position: 'relative',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tatWrapper: {
    marginBottom: 16,
  },
  tatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  tatTitle: { fontSize: 14, color: '#60758a' },
  tatValue: { fontSize: 14, color: '#111418', fontWeight: '500' },
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
  },
  verificationDetailsCard: {
    flexDirection: 'column',
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 14,
    color: '#111418',
    fontWeight: '500',
    flex: 1,
  },
  notesHeading: {
    fontSize: 13,
    color: '#60758a',
    fontWeight: '600',
    marginBottom: 4,
  },
  missingTitle: {
    fontSize: 13,
    color: '#60758a',
    marginBottom: 4,
  },
  missingHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111418',
    marginBottom: 8,
  },
  missingSub: { fontSize: 14, color: '#60758a', lineHeight: 20 },
  documentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginLeft: 8,
    backgroundColor: '#f0f2f5',
  },
  downloadBtn: {
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 50,
  },
  downloadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  connectorLine: {
    position: 'absolute',
    left: 28,
    top: 48,
    width: 2,
    height: 32,
    backgroundColor: '#E0E0E0',
  },
  activeConnectorLine: {
    backgroundColor: 'green',
  },
  driversContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  expandAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F4FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E3A8A30',
  },
  expandAllButtonText: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  driverStatusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  driverInfo: {
    flex: 1,
  },
  driverHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  finalStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  finalStatusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  expandIcon: {
    marginLeft: 8,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  driverMobile: {
    fontSize: 14,
    color: '#6B7280',
  },
  verificationSteps: {
    gap: 8,
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#fff',
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  stepLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  finalStatusRow: {
    paddingTop: 8,
    marginTop: 4,
  },
  finalStatusLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  statusBadge: {
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
  statusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  verifiedText: {
    color: '#059669',
  },
  rejectedText: {
    color: '#DC2626',
  },
  completionDateContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  completionDateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  completionDateValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  notesTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  statusInfoContainer: {
    flex: 1,
  },
  updatedDate: {
    fontSize: 12,
    color: 'black',
    marginTop: 2,
  },
});

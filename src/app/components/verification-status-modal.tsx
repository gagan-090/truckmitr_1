import React from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface VerificationStatusModalProps {
  visible: boolean;
  onClose: () => void;
  verificationData?: any;
}

const VerificationStatusModal = ({
  visible,
  onClose,
  verificationData,
}: VerificationStatusModalProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  const { responsiveWidth, responsiveFontSize, responsiveHeight } =
    useResponsiveScale();
  const { t } = useTranslation();
  const colors = useColor();
  const isCompleted = verificationData?.overall_status === 'verified'


  // Get verification status from API data
  const getVerificationStatus = () => {
    const overallStatus = verificationData?.overall_status;

    // Return the appropriate status
    let returnStatus = overallStatus || 'pending';
    if (isCompleted) {
      returnStatus = 'completed';
    }

    return { status: returnStatus };
  };

  const { status } = getVerificationStatus();

  // Get status-specific content
  const getStatusContent = () => {
    switch (status) {
      case 'completed':
      case 'verified':
        return {
          title: t('verificationCompleted'),
          subtitle: t('verificationCompletedSuccessfully'),
          showDownloadButton: true,
        };
      case 'rejected':
      case 'discrepancy':
        return {
          title: t('verificationDiscrepancy'),
          subtitle: t('verificationNeedsAttention'),
          showDownloadButton: true,
        };
      case 'in_progress':
        return {
          title: t('verificationInProgress'),
          subtitle: t('verificationBeingProcessed'),
          showDownloadButton: false,
        };
      default:
        return {
          title: t('verificationPending'),
          subtitle: t('verificationAwaitingStart'),
          showDownloadButton: false,
        };
    }
  };

  const statusContent = getStatusContent();

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
          backgroundColor: colors.blackOpacity(0.1),
          borderColor: colors.blackOpacity(0.5),
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
        return { color: colors.blackOpacity(0.8) };
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
            {t(`verificationStatus`)}
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
                color: isCompleted ? colors.greenOpacitiy(1) : colors.black,
                textAlign: 'center',
                marginBottom: responsiveFontSize(1),
              }}
            >
              {statusContent.title}
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(1.6),
                color: colors.blackOpacity(0.7),
                textAlign: 'center',
              }}
            >
              {statusContent.subtitle}
            </Text>
          </View>

          {/* Status Tracker */}
          <Text style={styles.sectionTitle}>{t('statusTracker')}</Text>
          <View style={styles.statusItem}>
            <View style={styles.statusContent}>
              <View
                style={[styles.iconContainer, isCompleted && { backgroundColor: colors.greenOpacitiy(1) }]}
              >
                <Ionicons
                  name={isCompleted ? 'checkmark-sharp' : 'time-outline'}
                  size={22}
                  color={isCompleted ? colors.white : colors.royalBlue}
                />
              </View>
              <Text
                style={[styles.statusLabel, isCompleted && { color: colors.greenOpacitiy(1) }]}
              >
                {verificationData?.overall_status?.charAt(0).toUpperCase() + verificationData?.overall_status?.slice(1).toLowerCase()}
              </Text>
            </View>
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

          {/* Individual Verification Statuses */}
          {verificationData?.verification && (
            <View style={styles.verificationDetailsCard}>
              <Text style={styles.missingHeader}>
                {t('currentVerificationStatus')}
              </Text>

              {/* ID Verification Status */}
              <View style={styles.statusRow}>
                <View style={styles.statusInfoContainer}>
                  <Text style={styles.statusLabel}>{t('idVerification')}</Text>
                  {verificationData.verification.id_status?.status == 'verified' && verificationData.verification.id_status?.updated_at &&
                    <Text style={styles.updatedDate}>
                      {t('lastUpdated')} {formatDate(verificationData.verification.id_status?.updated_at)}
                    </Text>
                  }
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    getStatusBadgeStyle(
                      verificationData.verification.id_status?.status,
                    ),
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      getStatusTextStyle(
                        verificationData.verification.id_status?.status,
                      ),
                    ]}
                  >
                    {getStatusDisplayText(
                      verificationData.verification.id_status?.status
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
                  {verificationData.verification.address_status?.status == 'verified' && verificationData.verification.address_status?.updated_at &&
                    <Text style={styles.updatedDate}>
                      {t('lastUpdated')} {formatDate(verificationData.verification.address_status?.updated_at)}
                    </Text>
                  }
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    getStatusBadgeStyle(
                      verificationData.verification.address_status?.status,
                    ),
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      getStatusTextStyle(
                        verificationData.verification.address_status?.status,
                      ),
                    ]}
                  >
                    {getStatusDisplayText(
                      verificationData.verification.address_status?.status,
                    )}
                  </Text>
                </View>
              </View>

              {/* Court Check Status */}
              <View style={styles.statusRow}>
                <View style={styles.statusInfoContainer}>
                  <Text style={styles.statusLabel}>{t('courtVerification')}</Text>
                  {verificationData.verification.court_check_status?.status == 'verified' && verificationData.verification.court_check_status?.updated_at &&
                    <Text style={styles.updatedDate}>
                      {t('lastUpdated')} {formatDate(verificationData.verification.court_check_status?.updated_at)}
                    </Text>
                  }
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    getStatusBadgeStyle(
                      verificationData.verification.court_check_status?.status,
                    ),
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      getStatusTextStyle(
                        verificationData.verification.court_check_status?.status,
                      ),
                    ]}
                  >
                    {getStatusDisplayText(
                      verificationData.verification.court_check_status?.status,
                    )}
                  </Text>
                </View>
              </View>

              {/* Notes */}
              {verificationData.verification.notes && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.notesHeading}>{t('noteByAdmin')}</Text>
                  <Text style={styles.missingSub}>
                    {verificationData.verification.notes}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Missing Documents */}
          {verificationData?.document_status?.missing_documents?.length > 0 && (
            <View style={styles.verificationDetailsCard}>
              <Text style={styles.missingTitle}>{t('missingDocuments')}</Text>
              <Text style={styles.missingHeader}>
                {t('pleaseUploadRequiredDocuments')}
              </Text>
              <Text style={styles.missingSub}>
                {t('verificationOnHoldMissingDocuments')}
              </Text>
            </View>
          )}

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

export default VerificationStatusModal;

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
    paddingHorizontal: 20,
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
    paddingLeft: 20
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tatWrapper: {
    marginHorizontal: 4,
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
  tatTitle: { fontSize: 14, color: '#084489', fontWeight: '500' },
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
    color: '#084489',
    fontWeight: '500',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  notesHeading: {
    fontSize: 13,
    color: '#084489',
    fontWeight: '500',
    marginBottom: 4,
  },
  missingTitle: {
    fontSize: 13,
    color: 'black',
    marginBottom: 4,
  },
  missingHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#084489',
    marginBottom: 8,
  },
  missingSub: { fontSize: 13 },
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
  statusInfoContainer: {
    flex: 1,
  },
  updatedDate: {
    fontSize: 12,
    color: 'black',
    marginTop: 2,
  },

});

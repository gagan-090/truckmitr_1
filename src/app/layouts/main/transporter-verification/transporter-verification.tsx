/**
 * Transporter Verification Screen
 * @format
 */

import React, { useCallback, useEffect, useState } from 'react';
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
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Space,
  TransporterPaymentModal
} from '@truckmitr/src/app/components';
import { hitSlop } from '@truckmitr/src/app/functions';
import { useColor, useResponsiveScale, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { BASE_URL, END_POINTS } from '@truckmitr/src/utils/config';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AnimatedFAB } from 'react-native-paper';

type NavigatorProp = NativeStackNavigationProp<
  NavigatorParams,
  keyof NavigatorParams
>;

interface Driver {
  id: string;
  name: string;
  unique_id: string;
  mobile: string;
  email: string;
  images?: string;
  star_rating: number;
  ranking: string;
  isDocumentVerified: boolean;
  driver_verification: any;
}

const TransporterVerificationScreen = () => {
  const navigation = useNavigation<NavigatorProp>();
  const safeAreaInsets = useSafeAreaInsets();
  const { t } = useTranslation();
  const colors = useColor();
  useStatusBarStyle('dark-content');

  const [loading, setLoading] = useState(true);
  const [driverList, setDriverList] = useState<Driver[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [startingVerification, setStartingVerification] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [isExtended, setIsExtended] = useState(false);
  const { responsiveWidth, responsiveFontSize, responsiveHeight } = useResponsiveScale();

  useEffect(() => {
    setTimeout(() => {
      setIsExtended(true)
    }, 500);
  }, [])

  const fetchDriverList = useCallback(async () => {
    try {
      setLoading(true);
      const { data }: any = await axiosInstance.get(
        END_POINTS?.TRANSPORTER_DRIVERS(''),
      );
      if (data?.status && Array.isArray(data?.drivers)) {
        const unverifiedDrivers = data.drivers.filter(
          (driver: { driver_verification: null; }) => driver.driver_verification === null
        );
        setDriverList(unverifiedDrivers);
      }
    } catch (error) {
      console.error('Error fetching driver list:', error);
      showToast(t('errorFetchingDrivers'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDriverList();
    }, [fetchDriverList]),
  );

  const toggleDriverSelection = (driverId: string) => {
    const driver = driverList.find(d => d.id === driverId);
    if (!driver) {
      console.warn(`Driver with ID ${driverId} not found`);
      return;
    }
    setSelectedDrivers(prev => {
      if (prev.includes(driverId)) {
        return prev.filter(id => id !== driverId);
      } else {
        return [...prev, driverId];
      }
    });
  };

  const startVerification = async () => {
    if (selectedDrivers.length === 0) {
      showToast(t('pleaseSelectDrivers'));
      return;
    }
    setPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      setStartingVerification(true);
      const response = await axiosInstance.post(
        END_POINTS.TRANSPORTER_BULK_VERIFICATION,
        {
          driver_ids: selectedDrivers,
          payment_data: paymentData,
        },
      );

      if (response?.data?.success) {
        showToast(
          response?.data?.message || t('verificationStartedSuccessfully'),
        );
        setSelectedDrivers([]);
        setPaymentModal(false)
        navigation.navigate(STACKS.VERIFIED_DRIVERS_DOCUMENTS_UPLOAD)
        fetchDriverList();
      } else {
        showToast(response?.data?.message || t('verificationStartFailed'));
      }
    } catch (error) {
      console.error('Error starting verification:', error);
      showToast(t('errorStartingVerification'));
    } finally {
      setStartingVerification(false);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  const renderDriverItem = ({ item }: { item: Driver }) => {
    const isSelected = selectedDrivers.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.driverCard,
          isSelected && styles.selectedDriverCard,
        ]}
        onPress={() => toggleDriverSelection(item.id)}
      >
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
              <Text style={styles.driverName}>{item.name}</Text>
              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkedBox,
                ]}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                )}
              </View>
            </View>

            <View style={styles.driverDetails}>
              <Text style={styles.driverId}>{item.unique_id}</Text>
              <Text style={styles.driverMobile}>{item.mobile}</Text>
            </View>

            <View style={styles.starRating}>
              {Array.from({ length: 5 }).map((_, i) => (
                <FontAwesome
                  key={i}
                  name="star"
                  size={12}
                  color={
                    i < item.star_rating
                      ? colors.royalBlue
                      : colors.blackOpacity(0.2)
                  }
                  style={styles.star}
                />
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Space height={safeAreaInsets.top} />

      {/* Header */}
      <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', padding: responsiveWidth(3) }}>
        <TouchableOpacity
          hitSlop={hitSlop(10)}
          onPress={goBack}
          style={{
            height: responsiveFontSize(4),
            width: responsiveFontSize(4),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.white,
            borderRadius: 100,
            zIndex: 100,
          }}>
          <Ionicons name={'chevron-back'} size={24} color={colors.royalBlue} />
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
          }}>
          {t('selectDriversForVerification')}
        </Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.selectionCount}>
          {t('selectedDrivers', {
            count: selectedDrivers.length
          })}
        </Text>
      </View>

      {/* Driver List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.royalBlue} size="large" />
          <Text style={styles.loadingText}>{t('loadingDrivers')}</Text>
        </View>
      ) : driverList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            style={styles.emptyImage}
            source={{ uri: 'https://truckmitr.com/public/images/preview.png' }}
          />
          <Text style={styles.emptyText}>{t('noDriversAvailable')}</Text>
        </View>
      ) : (
        <FlatList
          data={driverList}
          renderItem={renderDriverItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.driverList}
          showsVerticalScrollIndicator={false}
        />
      )}
      <Text style={styles.startButtonText}>
      </Text>
      {/* Start Verification Button */}
      {selectedDrivers.length > 0 && (
        <View style={[styles.buttonContainer, { bottom: safeAreaInsets.bottom }]}>
          <TouchableOpacity
            style={[
              styles.startButton,
              { backgroundColor: colors.royalBlue, }
            ]}
            onPress={startVerification}
          >
            {startingVerification ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.startButtonText}>
              {selectedDrivers.length < 10 ?  `${t('proceed')}     ${1180} x ${selectedDrivers.length} = ₹${selectedDrivers.length * 1180}` : `${t('proceed')}     ${826} x ${selectedDrivers.length} = ₹${selectedDrivers.length * 826}`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Modal */}
      <TransporterPaymentModal
        visible={paymentModal}
        onClose={() => setPaymentModal(false)}
        selectedDriversCount={selectedDrivers.length}
        onPaymentSuccess={handlePaymentSuccess}
      />
      {selectedDrivers.length < 1 &&
        <AnimatedFAB
          icon={({ size, color }) => (
            <FontAwesome6 name="user-tie" size={size} color={color} />
          )}
          label={t('addDriver')}
          color={colors.white}
          extended={isExtended}
          onPress={() => navigation.navigate(STACKS.ADD_DRIVER)}
          visible={true}
          iconMode={'dynamic'}
          style={{
            position: 'absolute',
            bottom: responsiveWidth(20),
            right: responsiveWidth(5),
            backgroundColor: colors.royalBlue
          }}
        />
      }
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
    marginBottom: 4,
  },
  selectionCount: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
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
  },
  driverList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  driverCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedDriverCard: {
    borderColor: '#1E3A8A',
    backgroundColor: '#F0F4FF',
  },
  disabledDriverCard: {
    opacity: 0.5,
  },
  unverifiedDriverCard: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  driverContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverImage: {
    height: 45,
    width: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  disabledCheckbox: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    opacity: 0.5,
  },
  driverDetails: {
    marginBottom: 4,
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
  },
  star: {
    marginRight: 2,
  },
  unverifiedText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
    marginTop: 2,
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
  },
  startButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
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

export default TransporterVerificationScreen;

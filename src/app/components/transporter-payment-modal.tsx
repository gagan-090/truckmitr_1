import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColor, useResponsiveScale } from '@truckmitr/src/app/hooks';
import { hitSlop } from '@truckmitr/src/app/functions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { encode } from 'base-64';
import RazorpayCheckout from 'react-native-razorpay';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import analytics from '@react-native-firebase/analytics';
import { END_POINTS, STATICS } from '@truckmitr/src/utils/config';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import axios from 'axios';

interface TransporterPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDriversCount: number;
  onPaymentSuccess: (paymentData: any) => void;
}

const TransporterPaymentModal = ({
  visible,
  onClose,
  selectedDriversCount,
  onPaymentSuccess,
}: TransporterPaymentModalProps) => {
  const { t } = useTranslation();
  const colors = useColor();
  const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
  const { user } = useSelector((state: any) => state.user);

  const [isCapturingPayment, setIsCapturingPayment] = useState(false);

  const amountPerDriver = selectedDriversCount < 10 ? 1180 : 826;
  const totalAmount = amountPerDriver * selectedDriversCount;
  const totalAmountInPaise = totalAmount * 100; // Convert to paise


  const generateOrderId = async () => {
  try {
    const data = new FormData();
    data.append('amount', totalAmountInPaise)
    data.append('payment_type', 'transporter_verification');

    const response = await axiosInstance.post(END_POINTS.CREATE_ORDER, data)
    if(!!response?.data?.order?.id){
    processPayment(response?.data?.order?.id)
    }
  } catch (error) {
    console.error('Error creating order:', error);
  }
};

  const capturePayment = async (paymentData: any, orderId: string) => {
    setIsCapturingPayment(true);
    try {
      const paymentId = paymentData?.razorpay_payment_id;
      const key_id = STATICS?.RAYZORPAY_KEY_ID;
      const key_secret = STATICS?.RAYZORPAY_SECRET;
      const authToken = encode(`${key_id}:${key_secret}`);

      // Verify payment with Razorpay
      const response = await axios.get(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authToken}`,
        },
      });

      if (response?.data?.status === "captured") {
        console.log('Payment captured successfully:', response.data);

        // Prepare payment details for backend
        const paymentDetails = {
          ...response.data,
          verification_amount: totalAmount // Total amount for transporter verification
        };

        // Convert the created_at timestamp (in seconds) to a Date object
        const startTimestamp = response?.data?.created_at;
        const startDate = new Date(startTimestamp * 1000); // convert to milliseconds
        // Add 1 year to the start date
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        const endTimestamp = Math.floor(endDate.getTime() / 1000);

        // Send payment details to backend
        let bodyFormData = new FormData();
        bodyFormData.append('unique_id', user?.unique_id);
        bodyFormData.append('amount', totalAmountInPaise.toString()); // Amount in paise
        bodyFormData.append('payment_id', paymentId);
        bodyFormData.append('order_id', orderId);
        bodyFormData.append('payment_status', response?.data?.status);
        bodyFormData.append('payment_details', JSON.stringify(paymentDetails));
        bodyFormData.append('payment_type', 'transporter_verification');
        bodyFormData.append('driver_count', selectedDriversCount.toString());
        bodyFormData.append('start_at', startTimestamp);
        bodyFormData.append('end_at', endTimestamp);

        // Send to verification payment capture endpoint
        const captureResponse = await axiosInstance.post(END_POINTS.PAYMENT_SUBSCRIPTION_CAPTURE, bodyFormData);
        console.log('captureResponse==>', captureResponse);
        if (captureResponse?.data?.status) {
          console.log('Payment captured in backend successfully');
          return captureResponse.data;
        } else {
          throw new Error('Payment capture failed in backend');
        }
      } else {
        throw new Error('Payment not captured by Razorpay');
      }
    } catch (error: any) {
      console.error('Payment capture error:', error.response?.data || error.message);
      throw error;
    } finally {
      setIsCapturingPayment(false);
    }
  };

  const processPayment = async (orderId: string) => {
    const options = {
      description: `Driver Verification Fee (${selectedDriversCount} drivers)`,
      image: 'https://truckmitr.com/public/front/assets/images/logotrick.png',
      currency: 'INR',
      key: STATICS?.RAYZORPAY_KEY_ID,
      amount: totalAmountInPaise.toString(),
      name: 'TruckMitr',
      order_id: orderId,
      notes: {
        unique_id: user?.unique_id,
        role: user?.role,
        driver_count: selectedDriversCount.toString(),
        payment_type: 'transporter_verification',
      },
      prefill: {
        email: user?.email,
        contact: Number(user?.mobile),
        name: user?.name,
      },
      theme: { color: colors.royalBlue },
    } as any;

    await RazorpayCheckout.open(options)
      .then(async data => {
        console.log('Payment Success:', data);

        const eventData = {
          user_id: String(user?.id ?? ''),
          user_unique_id: user?.unique_id ?? '',
          user_name: user?.name ?? '',
          user_email: user?.email ?? '',
          user_role: user?.role ?? '',
          payment_order_id: data?.razorpay_order_id ?? '',
          payment_id: data?.razorpay_payment_id ?? '',
          payment_signature: data?.razorpay_signature ?? '',
          payment_amount: totalAmount.toString(),
          payment_currency: options.currency,
          payment_method: 'razorpay',
          driver_count: selectedDriversCount.toString(),
          payment_type: 'transporter_verification',
          status: 'success',
        };

        // Firebase Analytics
        await analytics().logEvent('transporter_verification_payment_success', eventData);

        // Facebook Analytics
        AppEventsLogger.logEvent('transporter_verification_payment_success', eventData);

        // Capture payment on our backend
        try {
          const captureResult = await capturePayment(data, orderId);
          showToast(t('paymentSuccessful'));
          onPaymentSuccess({ ...data, captureResult });
        } catch (captureError) {
          console.error('Payment capture failed:', captureError);
          showToast(t('paymentCaptureFailed'));
          // Don't close modal on capture failure
        }
      })
      .catch(async error => {
        console.log('Payment Error:', error);
        showToast(t('paymentUnsuccessful'));

        const errorData = {
          user_id: String(user?.id ?? ''),
          user_unique_id: user?.unique_id ?? '',
          user_name: user?.name ?? '',
          user_email: user?.email ?? '',
          user_role: user?.role ?? '',
          payment_amount: totalAmount.toString(),
          payment_currency: options.currency,
          payment_method: 'razorpay',
          driver_count: selectedDriversCount.toString(),
          payment_type: 'transporter_verification',
          status: 'failed',
          error_code: error?.code,
          error_description: error?.description,
          error_reason: error?.reason,
        };

        // Firebase Analytics
        await analytics().logEvent('transporter_verification_payment_failure', errorData);

        // Facebook Analytics
        AppEventsLogger.logEvent('transporter_verification_payment_failure', errorData);
      });
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
            {t('paymentVerification')}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: responsiveHeight(8) }}
        >
          {/* Payment Summary */}
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
                color: colors.black,
                textAlign: 'center',
                marginBottom: responsiveFontSize(1),
              }}
            >
              {t('paymentSummary')}
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(1.6),
                color: colors.blackOpacity(0.7),
                textAlign: 'center',
              }}
            >
              {t('driverVerificationPaymentDescription')}
            </Text>
          </View>

          {/* Payment Details Card */}
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>{t('selectedDrivers')?.replace(': {{count}}', ``)}</Text>
              <Text style={styles.paymentValue}>{selectedDriversCount}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>{t('amountPerDriver')}</Text>
              <Text style={styles.paymentValue}>₹{amountPerDriver}</Text>
            </View>
            <View style={[styles.paymentRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>{t('totalAmount')}</Text>
              <Text style={styles.totalValue}>₹{totalAmount}</Text>
            </View>
          </View>

          {/* Payment Benefits */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>{t('whatYouGet')}</Text>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.greenOpacitiy(1)} />
              <Text style={styles.benefitText}>{t('driverVerificationBenefit1')}</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.greenOpacitiy(1)} />
              <Text style={styles.benefitText}>{t('driverVerificationBenefit2')}</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.greenOpacitiy(1)} />
              <Text style={styles.benefitText}>{t('driverVerificationBenefit3')}</Text>
            </View>
          </View>

          {/* Pay Now Button */}
          <TouchableOpacity
            onPress={generateOrderId}
            activeOpacity={0.7}
            disabled={isCapturingPayment}
            style={{
              height: responsiveHeight(5.8),
              width: responsiveWidth(90),
              backgroundColor: isCapturingPayment ? colors.blackOpacity(0.3) : colors.royalBlue,
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              borderRadius: 8,
              marginTop: responsiveFontSize(2),
              opacity: isCapturingPayment ? 0.6 : 1,
            }}
          >
            {isCapturingPayment ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.white} style={{ marginRight: 8 }} />
                <Text
                  style={{
                    color: colors.white,
                    fontSize: responsiveFontSize(2),
                    fontWeight: '600',
                  }}
                >
                  {t('processing')}...
                </Text>
              </View>
            ) : (
              <Text
                style={{
                  color: colors.white,
                  fontSize: responsiveFontSize(2),
                  fontWeight: '600',
                }}
              >
                {t('payNow')} ₹{totalAmount}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Loading Overlay */}
        {isCapturingPayment && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.royalBlue} />
              <Text style={styles.loadingText}>{t('processingPayment')}</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  paymentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 18,
    color: '#111827',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  benefitsCard: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 16,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
});

export default TransporterPaymentModal;

import analytics from '@react-native-firebase/analytics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import { hitSlop } from '@truckmitr/src/app/functions';
import {
  useColor,
  useResponsiveScale,
} from '@truckmitr/src/app/hooks';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { PaymentVerificationModalAction } from '@truckmitr/src/redux/actions/user.action';
import { NavigatorParams, STACKS } from '@truckmitr/src/stacks/stacks';
import { END_POINTS, STATICS } from '@truckmitr/src/utils/config';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import RazorpayCheckout from 'react-native-razorpay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { encode } from 'base-64';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';

type NavigatorProp = NativeStackNavigationProp<
  NavigatorParams,
  keyof NavigatorParams
>;

export default function PaymentVerify({ }: any) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const colors = useColor();
  const safeAreaInsets = useSafeAreaInsets();
  const { responsiveHeight, responsiveWidth, responsiveFontSize } =
    useResponsiveScale();
  const navigation = useNavigation<NavigatorProp>();
  const { user, paymentVerificationModal, isDriver } = useSelector(
    (state: any) => {
      return state?.user;
    },
  );

  const _generateOrderId = async () => {
    const keyId = STATICS?.RAYZORPAY_KEY_ID;
    const keySecret = STATICS?.RAYZORPAY_SECRET;

    // Combine keyId and keySecret with colon and encode in base64
    const auth = 'Basic ' + encode(`${keyId}:${keySecret}`);

    const data = {
      amount: 118000, // ₹1180 (in paise)
      currency: 'INR',
      payment: {
        capture: 'automatic',
        capture_options: {
          automatic_expiry_period: 12,
          manual_expiry_period: 7200,
          refund_speed: 'optimum',
        },
      },
      notes: {
        unique_id: user?.unique_id,
        role: user?.role,
      },
    };

    try {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: auth,
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();
      _onPressPayNow(json.id);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const _onPressPayNow = async (orderId: string) => {
    // Format mobile number - ensure it's just 10 digits
    const rawMobile = String(user?.mobile || '').replace(/\D/g, '');
    const mobileNumber = rawMobile.length >= 10 ? rawMobile.slice(-10) : rawMobile;

    // Get email - use default if not available
    const userEmail = user?.email || `user${user?.id}@truckmitr.com`;

    const options = {
      description: 'Verification Fee',
      image: 'https://truckmitr.com/public/front/assets/images/logotrick.png',
      currency: 'INR',
      key: STATICS?.RAYZORPAY_KEY_ID,
      amount: '118000', // ₹1180 (in paise)
      name: 'TruckMitr',
      order_id: orderId,
      notes: {
        unique_id: user?.unique_id,
        role: user?.role,
      },
      prefill: {
        email: userEmail,
        contact: mobileNumber,
        name: user?.name || '',
      },
      readonly: {
        email: true,
        contact: true,
        name: true
      },
      hidden: {
        email: true,
        contact: false
      },
      theme: { color: colors.royalBlue },
    } as any;

    await RazorpayCheckout.open(options)
      .then(async data => {
        console.log(`Success: `, data);

        const eventData = {
          user_id: String(user?.id ?? ''),
          user_unique_id: user?.unique_id ?? '',
          user_name: user?.name ?? '',
          user_email: user?.email ?? '',
          user_role: user?.role ?? '',
          payment_order_id: data?.razorpay_order_id ?? '',
          payment_id: data?.razorpay_payment_id ?? '',
          payment_signature: data?.razorpay_signature ?? '',
          payment_amount: '1180', // ₹1180
          payment_currency: options.currency,
          payment_method: 'razorpay',
          status: 'success',
        };

        // 🔹 Firebase Analytics
        await analytics().logEvent('payment_success', eventData);

        // 🔹 Facebook Analytics (custom event)
        AppEventsLogger.logEvent('payment_success', eventData);

        dispatch(PaymentVerificationModalAction(false));
        const response = await axiosInstance.post(
          END_POINTS.DRIVERVERIFICATIONSTART,
        );

        console.log('response verification START= >', response);

        if (response?.data?.success) {
          const successMessage =
            response?.data?.message || 'Verification started successfully';
          showToast(successMessage);

          // Navigate to verification status screen
          setTimeout(() => {
            navigation.navigate(STACKS.VERIFICATIONSTATUS);
          }, 100);
        } else {
          // Handle error cases
          const errorMessage = response?.data?.message;
          if (errorMessage?.includes('documents must be uploaded')) {
            showToast(errorMessage);
            setTimeout(() => {
              navigation.navigate(STACKS.DOCUMENTUPLOAD);
            }, 100);
          } else {
            showToast(errorMessage || 'Failed to start verification');
          }
        }
        // setTimeout(() => {
        //     navigation.navigate(STACKS.PAYMENT_SUCCESS, {
        //         options,
        //         data,
        //         amount: 1180
        //     });
        // }, 100);
      })
      .catch(async error => {
        console.log(`Error: `, error);
        showToast(t('oopsPaymentUnsuccessful'));
        dispatch(PaymentVerificationModalAction(false));

        const errorData = {
          user_id: String(user?.id ?? ''),
          user_unique_id: user?.unique_id ?? '',
          user_name: user?.name ?? '',
          user_email: user?.email ?? '',
          user_role: user?.role ?? '',
          payment_amount: '1180', // ₹1180
          payment_currency: options.currency,
          payment_method: 'razorpay',
          status: 'failed',
          error_code: error?.code,
          error_description: error?.description,
          error_reason: error?.reason,
        };

        // 🔹 Firebase Analytics
        await analytics().logEvent('payment_failure', errorData);

        // 🔹 Facebook Analytics (custom event)
        AppEventsLogger.logEvent('payment_failure', errorData);
      });
  };

  return (
    <Modal
      visible={paymentVerificationModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => dispatch(PaymentVerificationModalAction(false))}
    >
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        <Space height={safeAreaInsets.top} />
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
            onPress={() => dispatch(PaymentVerificationModalAction(false))}
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
            {t('verificationFee')}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: responsiveHeight(8) }}
        >
          {/* Payment Header */}
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
              {t('verificationFee')}
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(1.6),
                color: colors.blackOpacity(0.7),
                textAlign: 'center',
              }}
            >
              {t('oneTimeVerificationFee')}
            </Text>
          </View>

          {/* Payment Amount Card */}
          <View
            style={{
              marginHorizontal: responsiveWidth(5),
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: responsiveFontSize(2.5),
              marginBottom: responsiveFontSize(3),
              borderWidth: 1,
              borderColor: colors.blackOpacity(0.1),
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(2.2),
                fontWeight: 'bold',
                color: colors.black,
                textAlign: 'center',
                marginBottom: responsiveFontSize(1),
              }}
            >
              {t('amount')}: ₹1180
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(1.6),
                color: colors.blackOpacity(0.7),
                textAlign: 'center',
                lineHeight: responsiveFontSize(2.2),
              }}
            >
              {t('oneTimeVerificationFeeDescription')}
            </Text>
          </View>

          {/* Payment Features */}
          <View
            style={{
              marginHorizontal: responsiveWidth(5),
              backgroundColor: colors.white,
              borderRadius: 12,
              padding: responsiveFontSize(2.5),
              marginBottom: responsiveFontSize(3),
              borderWidth: 1,
              borderColor: colors.blackOpacity(0.1),
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(1.8),
                fontWeight: '600',
                color: colors.black,
                marginBottom: responsiveFontSize(1.5),
              }}
            >
              {t('whatYouGet')}
            </Text>
            <View style={{ marginBottom: responsiveFontSize(1) }}>
              <Text style={{ fontSize: responsiveFontSize(1.5), color: colors.blackOpacity(0.8) }}>
                ✓ {t('identityVerification')}
              </Text>
            </View>
            <View style={{ marginBottom: responsiveFontSize(1) }}>
              <Text style={{ fontSize: responsiveFontSize(1.5), color: colors.blackOpacity(0.8) }}>
                ✓ {t('addressVerification')}
              </Text>
            </View>
            <View style={{ marginBottom: responsiveFontSize(1) }}>
              <Text style={{ fontSize: responsiveFontSize(1.5), color: colors.blackOpacity(0.8) }}>
                ✓ {t('courtCheck')}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: responsiveFontSize(1.5), color: colors.blackOpacity(0.8) }}>
                ✓ {t('verifiedDriverBadge')}
              </Text>
            </View>
          </View>

          {/* Pay Now Button */}
          <View style={{ paddingHorizontal: responsiveWidth(5) }}>
            <TouchableOpacity
              onPress={() => navigation.navigate(STACKS.DOCUMENTUPLOAD)}
              activeOpacity={0.7}
              style={{
                height: responsiveHeight(5.8),
                width: '100%',
                backgroundColor: colors.royalBlue,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                marginBottom: responsiveFontSize(2),
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: responsiveFontSize(2),
                  fontWeight: '600',
                }}
              >
                {t('payNow')} ₹1180
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({});

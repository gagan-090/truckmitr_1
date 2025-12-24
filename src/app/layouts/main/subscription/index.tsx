import analytics from '@react-native-firebase/analytics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import { isIOS } from '@truckmitr/src/app/functions';
import {
    useColor,
    useResponsiveScale,
    useShadow
} from '@truckmitr/src/app/hooks';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { subscriptionModalAction } from '@truckmitr/src/redux/actions/user.action';
import { NavigatorParams, STACKS } from '@truckmitr/src/stacks/stacks';
import { STATICS } from '@truckmitr/src/utils/config';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Image,
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
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type NavigatorProp = NativeStackNavigationProp<
  NavigatorParams,
  keyof NavigatorParams
>;

export default function Subscription({}: any) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const colors = useColor();
  const safeAreaInsets = useSafeAreaInsets();
  const { shadow } = useShadow();
  const { responsiveHeight, responsiveWidth, responsiveFontSize } =
    useResponsiveScale();
  const [checkBoxSelect, setCheckBoxSelect] = useState<boolean>(false);
  const navigation = useNavigation<NavigatorProp>();
  const { user, subscriptionModal, isDriver, isTransporter } = useSelector(
    (state: any) => {
      return state?.user;
    },
  );

      // State for error messages
      const [errors, setErrors] = useState<{
          checkBox?: string
      }>({});
  

  const _generateOrderId = async () => {
  if (!validate()) return;
  try {
    const amount = isDriver ? 19900 : 49900;
    const data = new FormData();
    data.append('amount', amount)
    data.append('payment_type', 'subscription');

    console.log('Creating order with amount:', amount);
    const response = await axiosInstance.post(END_POINTS.CREATE_ORDER, data)
    console.log('Order response:', response?.data);
    
    if(!!response?.data?.order?.id){
      console.log('Order created successfully, opening Razorpay with amount:', amount);
      _onPressPayNow(response?.data?.order?.id)
    } else {
      console.error('No order ID in response:', response?.data);
      showToast(t('oopsPaymentUnsuccessful'));
    }
  } catch (error) {
    console.error('Error creating order:', error);
    showToast(t('oopsPaymentUnsuccessful'));
  }
};

    const _onpressCheckBox = () => {
        setCheckBoxSelect(!checkBoxSelect);
        setErrors(() => ({
            checkBox: undefined,
        }));
    };

    const validate = (): boolean => {
        let valid = true;
        const newErrors: { [key: string]: string } = {};
        if (!checkBoxSelect) {
            newErrors.checkBox = t(`youNeedToAcceptTruckMitr`);
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

  const _onPressPayNow = async (orderId:string) => {
    const options = {
      description: 'Annual Subscription',
      image: 'https://truckmitr.com/public/front/assets/images/logotrick.png',
      currency: 'INR',
      key: STATICS?.RAYZORPAY_KEY_ID,
      amount: isDriver ? '19900' : '49900', // ₹1.00 (in paise)
      name: 'TruckMitr',
      order_id: orderId,
      notes: {
        unique_id: user?.unique_id,
        role: user?.role,
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
          payment_amount: isDriver ? '199' : '499',
          payment_currency: options.currency,
          payment_method: 'razorpay',
          status: 'success',
        };

        // 🔹 Firebase Analytics
        await analytics().logEvent('payment_success', eventData);

        // 🔹 Facebook Analytics (custom event)
        AppEventsLogger.logEvent('payment_success', eventData);

        dispatch(subscriptionModalAction(false));
        setTimeout(() => {
          navigation.navigate(STACKS.PAYMENT_SUCCESS, { options, data });
        }, 100);
      })
      .catch(async error => {
        console.log(`Error: `, error);
        showToast(t('oopsPaymentUnsuccessful'));
        dispatch(subscriptionModalAction(false));

        const errorData = {
          user_id: String(user?.id ?? ''),
          user_unique_id: user?.unique_id ?? '',
          user_name: user?.name ?? '',
          user_email: user?.email ?? '',
          user_role: user?.role ?? '',
          payment_amount: isDriver ? '199' : '499',
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
      animationType="slide"
      transparent={true}
      visible={subscriptionModal}
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => dispatch(subscriptionModalAction(false))}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.blackOpacity(0.5),
          justifyContent: 'flex-end',
        }}
      >
        <TouchableOpacity
          onPress={() => dispatch(subscriptionModalAction(false))}
          style={{ height: '100%', width: '100%' }}
        ></TouchableOpacity>
        <View
          style={{
            width: responsiveWidth(100),
            backgroundColor: colors.white,
            alignItems: 'center',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
            maxHeight: responsiveHeight(95),
          }}
        >
          <Image
            style={{
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              opacity: 0.5,
            }}
            blurRadius={30}
            source={{
              uri: `https://i.pinimg.com/736x/cc/65/e9/cc65e91f907be8e7d203d13ce986cac6.jpg`,
            }}
          />
          <View style={{ padding: responsiveWidth(2.5), alignItems: 'center' }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: responsiveWidth(2.5),
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                onPress={() => dispatch(subscriptionModalAction(false))}
                activeOpacity={0.7}
                style={{
                  height: responsiveFontSize(4),
                  width: responsiveFontSize(4),
                  backgroundColor: colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  top: responsiveFontSize(1.5),
                  right: responsiveFontSize(1),
                  alignSelf: 'center',
                  borderRadius: 100,
                  ...shadow,
                  shadowColor: isIOS()
                    ? colors.blackOpacity(0.2)
                    : colors.blackOpacity(0.7),
                }}
              >
                <Ionicons name={'close'} size={20} color={colors.black} />
              </TouchableOpacity>
              <Space height={responsiveHeight(3)} />
              {isDriver ? (
                <Text
                  style={{
                    color: colors.black,
                    fontSize: responsiveFontSize(2.4),
                    fontWeight: 'bold',
                  }}
                >
                  {t('limitedTimeOffer')}
                </Text>
              ) : (
                <Text
                  style={{
                    color: colors.black,
                    fontSize: responsiveFontSize(2.4),
                    fontWeight: 'bold',
                  }}
                >
                  {t('yourSmartHiriningPartner')}
                </Text>
              )}
              <Space height={responsiveHeight(2)} />
              {isDriver ? (
                <Text style={{ textAlign: 'center' }}>
                  {t('getSkillsGetHired')}
                  {'\n'}
                  <Text>{t('joinTruckMitrMembership')}</Text>
                </Text>
              ) : (
                <Text
                  style={{
                    color: colors.blackOpacity(0.6),
                    textAlign: 'center',
                  }}
                >
                  {t(`makeHiringSimple`)} {'\n'}
                  <Text style={{ color: colors.black, fontWeight: 'bold' }}>
                    {t(`getHiringSimple`)}
                  </Text>
                </Text>
              )}
              <Space height={responsiveHeight(2)} />
              <View
                style={{
                  width: responsiveWidth(85),
                  backgroundColor: colors.whiteOpacity(0.5),
                  padding: responsiveFontSize(2),
                }}
              >
                {isDriver && (
                  <>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <View
                        style={{
                          height: responsiveFontSize(3.2),
                          width: responsiveFontSize(3.2),
                          backgroundColor: colors.blackOpacity(0.03),
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 100,
                          marginRight: responsiveFontSize(1),
                        }}
                      >
                        <Image
                          style={{
                            height: responsiveFontSize(2),
                            width: responsiveFontSize(2),
                          }}
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/512/2027/2027595.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          color: colors.blackOpacity(0.9),
                          fontSize: responsiveFontSize(1.8),
                          fontWeight: '500',
                        }}
                      >
                        {t(`launchPriceForDriver`)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: responsiveHeight(0.5),
                      }}
                    >
                      <View
                        style={{
                          height: responsiveFontSize(3.2),
                          width: responsiveFontSize(3.2),
                          backgroundColor: colors.blackOpacity(0.03),
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 100,
                          marginRight: responsiveFontSize(1),
                        }}
                      >
                        <Image
                          style={{
                            height: responsiveFontSize(2),
                            width: responsiveFontSize(2),
                          }}
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/512/427/427735.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          color: colors.blackOpacity(0.9),
                          fontSize: responsiveFontSize(1.8),
                          fontWeight: '500',
                        }}
                      >
                        {t(`regularPriceForDriver`)}
                      </Text>
                    </View>
                    <Space height={responsiveHeight(2.5)} />
                  </>
                )}
                {isDriver && (
                  <Text
                    style={{
                      color: colors.black,
                      fontSize: responsiveFontSize(2),
                      fontWeight: 'bold',
                    }}
                  >
                    {t('memberShipBenifits')}
                  </Text>
                )}
                {isTransporter && (
                  <Text
                    style={{
                      color: colors.black,
                      fontSize: responsiveFontSize(2),
                      fontWeight: 'bold',
                    }}
                  >
                    {t('memberShipBenifits')}
                  </Text>
                )}
                <Space height={responsiveHeight(0.5)} />
                {isDriver && (
                  <>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <View
                        style={{
                          height: responsiveFontSize(3.2),
                          width: responsiveFontSize(3.2),
                          backgroundColor: colors.blackOpacity(0.03),
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 100,
                          marginRight: responsiveFontSize(1),
                        }}
                      >
                        <Image
                          style={{
                            height: responsiveFontSize(2),
                            width: responsiveFontSize(2),
                          }}
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/512/10703/10703030.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          color: colors.blackOpacity(0.8),
                          fontSize: responsiveFontSize(1.6),
                          fontWeight: '500',
                          textDecorationLine: 'underline',
                        }}
                      >
                        {t('unlimitedAccessVideo')}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: responsiveHeight(0.5),
                      }}
                    >
                      <View
                        style={{
                          height: responsiveFontSize(3.2),
                          width: responsiveFontSize(3.2),
                          backgroundColor: colors.blackOpacity(0.03),
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 100,
                          marginRight: responsiveFontSize(1),
                        }}
                      >
                        <Image
                          style={{
                            height: responsiveFontSize(2),
                            width: responsiveFontSize(2),
                          }}
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/512/10703/10703030.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          color: colors.blackOpacity(0.8),
                          fontSize: responsiveFontSize(1.6),
                          fontWeight: '500',
                          textDecorationLine: 'underline',
                        }}
                      >
                        {t(`quizAccessStrongProfile`)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: responsiveHeight(0.5),
                      }}
                    >
                      <View
                        style={{
                          height: responsiveFontSize(3.2),
                          width: responsiveFontSize(3.2),
                          backgroundColor: colors.blackOpacity(0.03),
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 100,
                          marginRight: responsiveFontSize(1),
                        }}
                      >
                        <Image
                          style={{
                            height: responsiveFontSize(2),
                            width: responsiveFontSize(2),
                          }}
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/512/10703/10703030.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          color: colors.blackOpacity(0.8),
                          fontSize: responsiveFontSize(1.6),
                          fontWeight: '500',
                          textDecorationLine: 'underline',
                        }}
                      >
                        {t(`priorityJobAccess`)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: responsiveHeight(0.5),
                      }}
                    >
                      <View
                        style={{
                          height: responsiveFontSize(3.2),
                          width: responsiveFontSize(3.2),
                          backgroundColor: colors.blackOpacity(0.03),
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 100,
                          marginRight: responsiveFontSize(1),
                        }}
                      >
                        <Image
                          style={{
                            height: responsiveFontSize(2),
                            width: responsiveFontSize(2),
                          }}
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/512/10703/10703030.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          color: colors.blackOpacity(0.8),
                          fontSize: responsiveFontSize(1.6),
                          fontWeight: '500',
                          textDecorationLine: 'underline',
                        }}
                      >
                        {t(`limitedSlots`)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: responsiveHeight(0.5),
                      }}
                    >
                      <View
                        style={{
                          height: responsiveFontSize(3.2),
                          width: responsiveFontSize(3.2),
                          backgroundColor: colors.blackOpacity(0.03),
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 100,
                          marginRight: responsiveFontSize(1),
                        }}
                      >
                        <Image
                          style={{
                            height: responsiveFontSize(2),
                            width: responsiveFontSize(2),
                          }}
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/512/10703/10703030.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          color: colors.blackOpacity(0.8),
                          fontSize: responsiveFontSize(1.6),
                          fontWeight: '500',
                          textDecorationLine: 'underline',
                        }}
                      >
                        {t(`payAndSaveYourJourney`)}
                      </Text>
                    </View>
                  </>
                )}
                {isTransporter && (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingRight: 5,
                      }}
                    >
                      <View
                        style={{
                          height: responsiveFontSize(3.2),
                          width: responsiveFontSize(3.2),
                          backgroundColor: colors.blackOpacity(0.03),
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 100,
                          marginRight: responsiveFontSize(1),
                        }}
                      >
                        <Image
                          style={{
                            height: responsiveFontSize(2),
                            width: responsiveFontSize(2),
                          }}
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/512/10703/10703030.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          color: colors.blackOpacity(0.8),
                          fontSize: responsiveFontSize(1.6),
                          fontWeight: '500',
                          textDecorationLine: 'underline',
                        }}
                      >
                        {t('easyProfileUpdates')}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: responsiveHeight(0.5),
                      }}
                    >
                      <View
                        style={{
                          height: responsiveFontSize(3.2),
                          width: responsiveFontSize(3.2),
                          backgroundColor: colors.blackOpacity(0.03),
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 100,
                          marginRight: responsiveFontSize(1),
                        }}
                      >
                        <Image
                          style={{
                            height: responsiveFontSize(2),
                            width: responsiveFontSize(2),
                          }}
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/512/10703/10703030.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          color: colors.blackOpacity(0.8),
                          fontSize: responsiveFontSize(1.6),
                          fontWeight: '500',
                          textDecorationLine: 'underline',
                        }}
                      >
                        {t(`unlimitedJobPostingForTransporter`)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: responsiveHeight(0.5),
                      }}
                    >
                      <View
                        style={{
                          height: responsiveFontSize(3.2),
                          width: responsiveFontSize(3.2),
                          backgroundColor: colors.blackOpacity(0.03),
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 100,
                          marginRight: responsiveFontSize(1),
                        }}
                      >
                        <Image
                          style={{
                            height: responsiveFontSize(2),
                            width: responsiveFontSize(2),
                          }}
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/512/10703/10703030.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          color: colors.blackOpacity(0.8),
                          fontSize: responsiveFontSize(1.6),
                          fontWeight: '500',
                          textDecorationLine: 'underline',
                        }}
                      >
                        {t(`unlimitedDriverApplications`)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: responsiveHeight(0.5),
                      }}
                    >
                      <View
                        style={{
                          height: responsiveFontSize(3.2),
                          width: responsiveFontSize(3.2),
                          backgroundColor: colors.blackOpacity(0.03),
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 100,
                          marginRight: responsiveFontSize(1),
                        }}
                      >
                        <Image
                          style={{
                            height: responsiveFontSize(2),
                            width: responsiveFontSize(2),
                          }}
                          source={{
                            uri: 'https://cdn-icons-png.flaticon.com/512/10703/10703030.png',
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          color: colors.blackOpacity(0.8),
                          fontSize: responsiveFontSize(1.6),
                          fontWeight: '500',
                          textDecorationLine: 'underline',
                        }}
                      >
                        {t(`skilEnhancement`)}
                      </Text>
                    </View>
                    <Space height={responsiveHeight(2)} />
                    {/* <Text style={{ color: colors.blackOpacity(.8), fontSize: responsiveFontSize(1.6), fontWeight: '500' }}><Text style={{ color: colors.blackOpacity(1), fontWeight: 'bold', fontSize: responsiveFontSize(1.8), }}>{t(`note_`)} </Text>{t(`hiringFeePerDriverWithFreeReplacementWithin`)}</Text> */}
                  </>
                )}
              </View>
              <Space height={responsiveHeight(2)} />
              <View
                style={{
                  width: responsiveWidth(40),
                  backgroundColor: colors.white,
                  padding: responsiveFontSize(2),
                  alignItems: 'center',
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.blackOpacity(0.1),
                  ...shadow,
                  shadowColor: isIOS()
                    ? colors.blackOpacity(0.2)
                    : colors.royalBlueOpacity(0.9),
                }}
              >
                <View
                  style={{
                    height: responsiveFontSize(3.2),
                    width: responsiveFontSize(3.2),
                    backgroundColor: colors.blackOpacity(0.03),
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 100,
                    marginRight: responsiveFontSize(1),
                    position: 'absolute',
                    right: responsiveFontSize(0.1),
                    top: responsiveFontSize(0.8),
                  }}
                >
                  <Image
                    style={{
                      height: responsiveFontSize(3),
                      width: responsiveFontSize(3),
                    }}
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/512/5582/5582932.png',
                    }}
                  />
                </View>
                <Space height={responsiveHeight(1)} />
                {isDriver ? (
                  <>
                    <Text
                      style={{
                        color: colors.black,
                        fontSize: responsiveFontSize(2),
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      {t(`annualMembership`)}
                    </Text>
                    <Text
                      style={{
                        color: colors.blackOpacity(0.5),
                        fontSize: responsiveFontSize(1.4),
                        fontWeight: '500',
                      }}
                    >
                      {t(`billedAnnual`)}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text
                      style={{
                        color: colors.black,
                        fontSize: responsiveFontSize(2),
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      {t(`quarterMembership`)}
                    </Text>
                    <Text
                      style={{
                        color: colors.blackOpacity(0.5),
                        fontSize: responsiveFontSize(1.4),
                        fontWeight: '500',
                      }}
                    >
                      {t(`billedQuarter`)}
                    </Text>
                  </>
                )}
                <Space height={responsiveHeight(0.25)} />
                {isDriver && (
                  <Text
                    style={{
                      color: colors.black,
                      fontSize: responsiveFontSize(3.5),
                      fontWeight: 'bold',
                    }}
                  >
                    {`₹199/`}
                    <Text
                      style={{
                        color: colors.blackOpacity(0.5),
                        fontSize: responsiveFontSize(2),
                        textDecorationLine: 'line-through',
                        fontWeight: '400',
                      }}
                    >{`₹499`}</Text>
                  </Text>
                )}
                {isTransporter && (
                  <Text
                    style={{
                      color: colors.black,
                      fontSize: responsiveFontSize(3.5),
                      fontWeight: 'bold',
                    }}
                  >
                    {`₹499/`}
                    <Text
                      style={{
                        color: colors.blackOpacity(0.5),
                        fontSize: responsiveFontSize(2),
                        textDecorationLine: 'line-through',
                        fontWeight: '400',
                      }}
                    >{`₹999`}</Text>
                  </Text>
                )}
                <Space height={responsiveHeight(0.5)} />
                <Text
                  style={{
                    color: colors.blackOpacity(0.7),
                    fontSize: responsiveFontSize(1.4),
                    fontWeight: '500',
                    textAlign: 'center',
                  }}
                >
                  { isDriver ? t(`forFirstYear`) : t(`for3Months`)}
                </Text>
                <Space height={responsiveHeight(1)} />
                <View
                  style={{
                    backgroundColor: colors.royalBlue,
                    paddingVertical: responsiveFontSize(0.2),
                    paddingHorizontal: responsiveFontSize(1.5),
                    borderRadius: 100,
                    position: 'absolute',
                    bottom: -8,
                  }}
                >
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: responsiveFontSize(1.4),
                      fontWeight: '500',
                    }}
                  >{`${t(`save`)} ${isDriver ? '60%' : '50%'}`}</Text>
                </View>
              </View>
              <Space height={responsiveHeight(5)} />
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity activeOpacity={1} onPress={_onpressCheckBox}>
                                <MaterialCommunityIcons
                                    name={checkBoxSelect ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                    size={24}
                                    color={colors.royalBlue}
                                />
                            </TouchableOpacity>
                            <Text style={{ color: colors.blackOpacity(0.7), marginStart: responsiveFontSize(1) }}>
                                {t(`iAgreeToTruckMitr`)}
                                <Text onPress={() => { dispatch(subscriptionModalAction(false)); navigation.navigate(STACKS?.SUBSCRIPTION_CONSENT)}} style={{ color: colors.royalBlue, fontWeight: '500' }}> {t(`Subscription consent`)}</Text>
                            </Text>
                        </View>
                        {errors.checkBox && (<View style={{ flexDirection: 'row', marginTop: responsiveHeight(1) }}>
                            <MaterialIcons name="error" size={14} color={colors.error} style={{ marginTop: responsiveFontSize(.3) }} />
                            <Text style={{ color: colors.error, fontSize: responsiveFontSize(1.7), marginLeft: responsiveFontSize(0.5) }}>
                                {errors.checkBox}
                            </Text>
                        </View>)}
                <Space height={responsiveHeight(2)} />
              <TouchableOpacity
                onPress={_generateOrderId}
                activeOpacity={0.7}
                style={{
                  height: responsiveHeight(5.8),
                  width: responsiveWidth(90),
                  backgroundColor: colors.royalBlue,
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontSize: responsiveFontSize(2),
                    fontWeight: '500',
                  }}
                >
                  {t('payNow')}
                </Text>
              </TouchableOpacity>
              <Space height={responsiveHeight(2)} />
              <Text
                style={{
                  width: responsiveWidth(70),
                  color: colors.blackOpacity(0.9),
                  fontSize: responsiveFontSize(1.6),
                  fontWeight: '400',
                  textAlign: 'center',
                }}
              >
                {t(`dontMissOutUnlockYourBenefitsWith`)}{' '}
                <Text style={{ color: colors.black, fontWeight: 'bold' }}>
                  {t(`membership`)}
                </Text>{' '}
                {t(`andKickstartYourJourney`)}
              </Text>
              <Space height={responsiveHeight(2)} />
              <Space height={safeAreaInsets.bottom} />
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({});

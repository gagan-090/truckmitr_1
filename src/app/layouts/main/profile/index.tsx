import {
  Alert,
  Image,
  ScrollView,
  Share,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native'
import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useColor, useResponsiveScale, useShadow, useStatusBarStyle } from '@truckmitr/src/app/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NavigatorParams, STACKS } from '@truckmitr/stacks/stacks';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Space } from '@truckmitr/src/app/components';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { deleteUserData } from '@truckmitr/src/utils/config/token';
import { subscriptionDetailsAction, subscriptionModalAction, userAction, userAuthenticatedAction } from '@truckmitr/src/redux/actions/user.action';
import { useDispatch, useSelector } from 'react-redux';
import { BASE_URL, END_POINTS } from '@truckmitr/src/utils/config';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import analytics from '@react-native-firebase/analytics';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import RNFetchBlob from 'react-native-blob-util';
import LinearGradient from 'react-native-linear-gradient';
import { openOverlayPermission } from '@truckmitr/src/utils/permissions/appearOnTopPermission';
import { ZegoSendCallInvitationButton } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { startVideoCall } from '@truckmitr/src/utils/zegoService';

type NavigatorProp = NativeStackNavigationProp<NavigatorParams, keyof NavigatorParams>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const capitalizeFirst = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Apple-style Confirmation Dialog Component
interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const AppleConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  isDestructive = false,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const colors = useColor();
  const { responsiveFontSize, responsiveWidth, responsiveHeight } = useResponsiveScale();
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Animated.View
        style={[
          styles.dialogOverlay,
          { opacity: opacityValue }
        ]}
      >
        <Animated.View
          style={[
            styles.dialogContainer,
            {
              transform: [{ scale: scaleValue }],
              backgroundColor: colors.white,
              width: responsiveWidth(75),
            }
          ]}
        >
          {/* Icon */}
          <View style={[
            styles.dialogIconContainer,
            { backgroundColor: isDestructive ? 'rgba(255, 59, 48, 0.1)' : 'rgba(8, 68, 137, 0.1)' }
          ]}>
            {isDestructive ? (
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={32}
                color="#FF3B30"
              />
            ) : (
              <MaterialCommunityIcons
                name="logout"
                size={32}
                color={colors.royalBlue}
              />
            )}
          </View>

          {/* Title */}
          <Text style={[
            styles.dialogTitle,
            {
              color: colors.black,
              fontSize: responsiveFontSize(2.2),
            }
          ]}>
            {title}
          </Text>

          {/* Message */}
          <Text style={[
            styles.dialogMessage,
            {
              color: colors.blackOpacity(0.6),
              fontSize: responsiveFontSize(1.7),
            }
          ]}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={styles.dialogButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCancel}
              disabled={loading}
              style={[
                styles.dialogButton,
                styles.dialogCancelButton,
                { backgroundColor: colors.blackOpacity(0.05) }
              ]}
            >
              <Text style={[
                styles.dialogButtonText,
                {
                  color: colors.blackOpacity(0.8),
                  fontSize: responsiveFontSize(1.8),
                }
              ]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onConfirm}
              disabled={loading}
              style={[
                styles.dialogButton,
                styles.dialogConfirmButton,
                { backgroundColor: isDestructive ? '#FF3B30' : colors.royalBlue }
              ]}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={[
                  styles.dialogButtonText,
                  {
                    color: colors.white,
                    fontSize: responsiveFontSize(1.8),
                  }
                ]}>
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// Menu Item Component for Apple-style list
interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  showDivider?: boolean;
  isLast?: boolean;
  rightElement?: React.ReactNode;
  textColor?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  onPress,
  showDivider = true,
  isLast = false,
  rightElement,
  textColor,
}) => {
  const colors = useColor();
  const { responsiveFontSize, responsiveWidth } = useResponsiveScale();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      style={[
        styles.menuItem,
        {
          paddingVertical: responsiveFontSize(1.8),
          paddingHorizontal: responsiveFontSize(2),
        }
      ]}
    >
      <View style={[styles.menuIconContainer, { marginRight: responsiveFontSize(1.5) }]}>
        {icon}
      </View>
      <Text style={[
        styles.menuItemText,
        {
          color: textColor || colors.black,
          fontSize: responsiveFontSize(1.9),
        }
      ]}>
        {title}
      </Text>
      {rightElement || (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.blackOpacity(0.25)}
        />
      )}
    </TouchableOpacity>
  );
};

// Section Header Component
interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  const colors = useColor();
  const { responsiveFontSize, responsiveWidth } = useResponsiveScale();

  return (
    <Text style={[
      styles.sectionHeader,
      {
        color: colors.blackOpacity(0.5),
        fontSize: responsiveFontSize(1.5),
        marginHorizontal: responsiveFontSize(2),
        marginTop: responsiveFontSize(3),
        marginBottom: responsiveFontSize(1),
      }
    ]}>
      {title.toUpperCase()}
    </Text>
  );
};

// Card Container Component
interface CardContainerProps {
  children: React.ReactNode;
}

const CardContainer: React.FC<CardContainerProps> = ({ children }) => {
  const colors = useColor();
  const { responsiveWidth, responsiveFontSize } = useResponsiveScale();
  const { shadow } = useShadow();

  return (
    <View style={[
      styles.cardContainer,
      {
        marginHorizontal: responsiveFontSize(2),
        backgroundColor: colors.white,
        borderRadius: 14,
        ...shadow,
        shadowColor: colors.blackOpacity(0.08),
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 3,
      }
    ]}>
      {children}
    </View>
  );
};

export default function Profile() {
  const { t } = useTranslation();
  const dispatch = useDispatch()
  useStatusBarStyle('dark-content')
  const { user, isDriver, isTransporter, profileCompletion, subscriptionDetails, rank, star_rating, subscriptionModal } = useSelector((state: any) => { return state?.user }) || {};
  const colors = useColor();
  const safeAreaInsets = useSafeAreaInsets();
  const { shadow } = useShadow()
  const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
  const navigation = useNavigation<NavigatorProp>();

  const progress = profileCompletion || 0;
  const size = responsiveFontSize(12);
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progress / 100) * circumference;
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  // Dialog States
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getDuration()
      const _fetchUser = async () => {
        const profile: any = await axiosInstance.get(END_POINTS?.GET_PROFILE);
        if (profile?.data?.status) {
          dispatch(userAction(profile?.data))
          const subscriptionDetails: any = await axiosInstance.get(END_POINTS?.PAYMENT_SUBSCRIPTION_DETAILS);
          if (subscriptionDetails?.data?.status) {
            dispatch(subscriptionDetailsAction(subscriptionDetails?.data?.data))
          }
        }
      }
      _fetchUser()
    }, [])
  );

  const getDuration = () => {
    const startDate = moment.unix(subscriptionDetails?.start_at);
    const endDate = moment.unix(subscriptionDetails?.end_at);
    const years = endDate.diff(startDate, 'years');
    return years;
  };

  const _navigateProfileEdit = () => {
    isDriver && navigation.navigate(STACKS.PROFILE_EDIT)
    isTransporter && navigation.navigate(STACKS.PROFILE_EDIT_TRANSPORTER)
  }
  const _navigateRating = () => navigation.navigate(STACKS.RATING)
  const _navigateContactUs = () => navigation.navigate(STACKS.CONTACT_US)
  const _navigatePrivacy = () => navigation.navigate(STACKS.PRIVACY)
  const _navigateSetting = () => navigation.navigate(STACKS.SETTINGS)

  const deleteAccount = async () => {
    setIsDeleting(true);
    const userinfo = {
      id: user?.id ?? '',
      unique_id: user?.unique_id ?? '',
      name: user?.name ?? '',
      mobile: user?.mobile ?? '',
      email: user?.email ?? '',
      role: user?.role ?? '',
    };

    const eventParams = {
      user_id: String(userinfo.id),
      user_unique_id: userinfo.unique_id,
      user_name: userinfo.name,
      user_email: userinfo.email,
      user_role: userinfo.role,
      method: 'user_requested',
    };

    try {
      const response: any = await axiosInstance.post(END_POINTS?.DELETE_ACCOUNT);

      if (response?.data?.status) {
        await analytics().logEvent('delete_account', eventParams);
        AppEventsLogger.logEvent('delete_account', eventParams);
        await new Promise<void>(res => setTimeout(() => res(), 500));
        dispatch(userAuthenticatedAction(false));
        deleteUserData();
        showToast(response?.data?.message);
      }
    } catch (error) {
      console.warn('Delete account error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const _onPressShareApp = async () => {
    try {
      const result = await Share.share({
        message: `🚛 At TruckMitr.com, we're more than just a platform – we're the driving force behind a revolution in the Indian trucking industry. \n👷‍♂️For Drivers: Apply for verified jobs, watch training videos, and take quizzes to upskill. \n🏢 For Transporters: Post jobs and connect instantly with skilled, trusted drivers.  the movement transforming Indian logistics – download the TruckMitr app now!   \n\n👉 https://play.google.com/store/apps/details?id=com.truckmitr`
      });
    } catch (error) {
      console.error('Error sharing the app:', error);
    }
  };

  const _onPressDeleteAccount = () => {
    setShowDeleteDialog(true);
  }

  const _onPressLogout = async () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    const userinfo = {
      id: user?.id ?? '',
      unique_id: user?.unique_id ?? '',
      name: user?.name ?? '',
      mobile: user?.mobile ?? '',
      email: user?.email ?? '',
      role: user?.role ?? '',
    };

    try {
      const eventParams = {
        method: 'manual_logout',
        user_id: String(userinfo.id),
        user_unique_id: userinfo.unique_id,
        user_name: userinfo.name,
        user_email: userinfo.email,
        user_role: userinfo.role,
      };

      await analytics().logEvent('user_logout', eventParams);
      AppEventsLogger.logEvent('user_logout', eventParams);
      await new Promise<void>(res => setTimeout(() => res(), 500));
      await axiosInstance.post(END_POINTS?.LOGOUT);
    } catch (error) {
      console.warn('Analytics logout error:', error);
    }

    dispatch(userAuthenticatedAction(false));
    deleteUserData();
    setShowLogoutDialog(false);
  };

  const downloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);
      const getPDFLink: any = await axiosInstance.get(END_POINTS?.INVOICE_DOWNLOAD);
      if (getPDFLink?.data?.url) {
        const { config, fs, android } = RNFetchBlob;
        const timestamp = new Date().getTime()
        const filePath = `${fs.dirs.DownloadDir}/Invoice${timestamp}.pdf`;

        await config({
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            path: filePath,
            description: 'Downloading invoice',
            title: 'TruckMitr Invoice',
            mime: 'application/pdf',
            mediaScannable: true,
          },
        })
          .fetch('GET', getPDFLink?.data?.url)
          .then((res) => {
            android.actionViewIntent(res.path(), 'application/pdf');
          })
          .catch((e) => {
            Alert.alert('Error', e.message);
          });
      }
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Space height={safeAreaInsets.top} />

      {/* Apple-style Confirmation Dialogs */}
      <AppleConfirmDialog
        visible={showLogoutDialog}
        title={t('logout')}
        message={t('areYouSureLogout') || 'Are you sure you want to logout from your account?'}
        confirmText={t('logout')}
        cancelText={t('cancel')}
        isDestructive={false}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutDialog(false)}
      />

      <AppleConfirmDialog
        visible={showDeleteDialog}
        title={t('deleteAccount')}
        message={t('areYouSureDeleteAccount') || 'This action cannot be undone. All your data will be permanently deleted.'}
        confirmText={t('delete') || 'Delete'}
        cancelText={t('cancel')}
        isDestructive={true}
        onConfirm={deleteAccount}
        onCancel={() => setShowDeleteDialog(false)}
        loading={isDeleting}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: responsiveHeight(4) }}
      >
        {/* Profile Header Section */}
        <View style={[
          styles.profileHeader,
          {
            paddingHorizontal: responsiveFontSize(2),
            paddingTop: responsiveFontSize(2),
            paddingBottom: responsiveFontSize(3),
          }
        ]}>
          {/* Profile Avatar with Progress Ring */}
          <TouchableOpacity
            onPress={_navigateProfileEdit}
            activeOpacity={0.9}
            style={styles.avatarContainer}
          >
            <Svg width={size} height={size} style={styles.progressRing}>
              <Defs>
                <SvgLinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#084489" />
                  <Stop offset="100%" stopColor="#0c78f0" />
                </SvgLinearGradient>
              </Defs>
              {/* Background Circle */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={colors.blackOpacity(0.06)}
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress Circle */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#progressGradient)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
              />
            </Svg>
            <Image
              style={[
                styles.avatarImage,
                {
                  height: size - strokeWidth * 4,
                  width: size - strokeWidth * 4,
                  backgroundColor: colors.white,
                }
              ]}
              source={{
                uri: user?.images
                  ? `${BASE_URL}public/${user?.images}`
                  : `https://cdn-icons-png.flaticon.com/512/3177/3177440.png`
              }}
            />
            {/* Completion Badge */}
            <View style={[
              styles.completionBadge,
              {
                backgroundColor: colors.white,
                ...shadow,
                shadowColor: colors.blackOpacity(0.15),
              }
            ]}>
              <Text style={[
                styles.completionText,
                {
                  fontSize: responsiveFontSize(1.3),
                  color: progress >= 80 ? '#34C759' : progress >= 50 ? '#FF9500' : '#FF3B30',
                }
              ]}>
                {`${profileCompletion}%`}
              </Text>
            </View>
          </TouchableOpacity>

          {/* User Info */}
          <View style={styles.userInfoContainer}>
            <Text style={[
              styles.userName,
              {
                color: colors.black,
                fontSize: responsiveFontSize(2.6),
              }
            ]}>
              {user?.name || ''}
            </Text>

            <Text style={[
              styles.userId,
              {
                color: colors.blackOpacity(0.5),
                fontSize: responsiveFontSize(1.5),
              }
            ]}>
              {`ID: ${user?.unique_id || ''}`}
            </Text>

            {/* Role Badge */}
            <View style={[
              styles.roleBadge,
              { backgroundColor: colors.royalBlueOpacity(0.08) }
            ]}>
              <Text style={[
                styles.roleText,
                {
                  color: colors.royalBlue,
                  fontSize: responsiveFontSize(1.4),
                }
              ]}>
                {capitalizeFirst(user?.role)}
              </Text>
            </View>

            {/* Star Rating for Drivers */}
            {isDriver && (
              <View style={styles.starContainer}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <FontAwesome
                    key={i}
                    name={i < star_rating ? 'star' : 'star-o'}
                    size={14}
                    color={i < star_rating ? '#FFD700' : colors.blackOpacity(0.2)}
                    style={{ marginRight: 3 }}
                  />
                ))}
              </View>
            )}

            {/* Rank Badge for Drivers */}
            {isDriver && rank && (
              <View style={[
                styles.rankBadge,
                { backgroundColor: 'rgba(255, 215, 0, 0.15)' }
              ]}>
                <Text style={[
                  styles.rankText,
                  {
                    color: colors.bronze,
                    fontSize: responsiveFontSize(1.4),
                  }
                ]}>
                  {rank}
                </Text>
                <Text style={{ fontSize: responsiveFontSize(1.5) }}>🏆</Text>
              </View>
            )}
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            onPress={_navigateProfileEdit}
            activeOpacity={0.7}
            style={[
              styles.editButton,
              { backgroundColor: colors.blackOpacity(0.05) }
            ]}
          >
            <Feather name="edit-2" size={18} color={colors.blackOpacity(0.6)} />
          </TouchableOpacity>
        </View>

        {/* Profile Incomplete Card */}
        {Number(profileCompletion) !== 100 && (
          <>
            <View style={[
              styles.incompleteCard,
              {
                marginHorizontal: responsiveFontSize(2),
                borderRadius: 16,
                overflow: 'hidden',
              }
            ]}>
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
                colors={['rgba(8, 68, 137, 0.08)', 'rgba(12, 120, 240, 0.12)']}
              />
              <View style={styles.incompleteCardContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[
                    styles.alertIconContainer,
                    { backgroundColor: colors.royalBlueOpacity(0.15) }
                  ]}>
                    <Ionicons name="alert-circle" size={24} color={colors.royalBlue} />
                  </View>
                  <View style={{ flex: 1, marginLeft: responsiveFontSize(1.5) }}>
                    <Text style={[
                      styles.incompleteTitle,
                      {
                        color: colors.black,
                        fontSize: responsiveFontSize(1.9),
                      }
                    ]}>
                      {t('yourProfileIncomplete')}
                    </Text>
                    <Text style={[
                      styles.incompleteSubtitle,
                      {
                        color: colors.blackOpacity(0.5),
                        fontSize: responsiveFontSize(1.5),
                      }
                    ]}>
                      {t('profileIncompleteTitle')}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={_navigateProfileEdit}
                  activeOpacity={0.8}
                  style={[
                    styles.completeButton,
                    { backgroundColor: colors.royalBlue }
                  ]}
                >
                  <Text style={[
                    styles.completeButtonText,
                    {
                      color: colors.white,
                      fontSize: responsiveFontSize(1.7),
                    }
                  ]}>
                    {t('completeProfile')}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
            <Space height={responsiveFontSize(1)} />
          </>
        )}

        {/* Premium Membership Card */}
        {!subscriptionDetails?.showSubscriptionModel && (
          <>
            <SectionHeader title={t('membership')} />
            {/* Blue Border Wrapper */}
            <View style={[
              styles.premiumCardBorder,
              { marginHorizontal: responsiveFontSize(1) }
            ]}>
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
                colors={['#084489', '#0c78f0', '#4A90D9', '#0c78f0', '#084489']}
              />

              {/* Inner Card - White to Blue Gradient Background */}
              <View style={[styles.premiumMembershipCard, { overflow: 'hidden' }]}>
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                  colors={['#FFFFFF', '#F5F9FF', '#E8F1FF', '#DCE9FF']}
                />

                {/* Subscribed Badge - Top Right */}
                <View style={styles.premiumSubscribedBadge}>
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
                    colors={['#084489', '#0c78f0', '#4A90D9']}
                  />
                  <Text style={[styles.premiumSubscribedText, { color: '#FFFFFF' }]}>
                    {t('subscribed').toUpperCase()}
                  </Text>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" style={{ marginLeft: 3 }} />
                </View>

                {/* Card Content */}
                <View style={{ padding: responsiveFontSize(1.5), paddingTop: responsiveFontSize(1.5) }}>
                  {/* Title Section */}
                  <Text style={[
                    styles.premiumMembershipTitle,
                    { fontSize: responsiveFontSize(2.4), color: '#084489' }
                  ]}>
                    {isDriver || getDuration() > 0 ? t('annualMembership') : t('quarterMembership')}
                  </Text>
                  <Text style={[
                    styles.premiumMembershipSubtitle,
                    { fontSize: responsiveFontSize(1.4), marginTop: 2, color: 'rgba(8, 68, 137, 0.6)' }
                  ]}>
                    {isDriver || getDuration() > 0 ? t('billedAnnual') : t('billedQuarter')}
                  </Text>

                  <Space height={responsiveFontSize(1.5)} />

                  {/* Price and Dates Row */}
                  <View style={styles.premiumPriceRow}>
                    {/* Left - Price Section */}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={[
                          styles.premiumPriceText,
                          { fontSize: responsiveFontSize(3.8), color: '#084489' }
                        ]}>
                          {`₹${subscriptionDetails?.payment_details?.amount / 100}`}
                        </Text>
                        <Text style={[
                          styles.premiumOriginalPrice,
                          { fontSize: responsiveFontSize(1.8), color: 'rgba(8, 68, 137, 0.4)' }
                        ]}>
                          {`₹${subscriptionDetails?.payment_details?.membership_amount
                            ? subscriptionDetails.payment_details.membership_amount.toLocaleString('en-IN')
                            : isDriver ? '599' : '999'}`}
                        </Text>
                      </View>
                      <Text style={[
                        styles.premiumDurationText,
                        { fontSize: responsiveFontSize(1.4), marginTop: 2, color: 'rgba(8, 68, 137, 0.6)' }
                      ]}>
                        {isDriver || getDuration() > 0 ? t('forFirstYear') : t('for3Months')}
                      </Text>

                      {/* Savings Badge */}
                      <View style={[styles.premiumSavingsBadge, { marginTop: responsiveFontSize(1) }]}>
                        <LinearGradient
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
                          colors={['#084489', '#0c78f0', '#4A90D9']}
                        />
                        <Text style={[
                          styles.premiumSavingsText,
                          { fontSize: responsiveFontSize(1.3), color: '#FFFFFF' }
                        ]}>
                          {`${t('save')} ${((((subscriptionDetails?.payment_details?.membership_amount || (isDriver ? 599 : 999)) - (subscriptionDetails?.payment_details?.amount / 100)) / (subscriptionDetails?.payment_details?.membership_amount || (isDriver ? 599 : 999))) * 100).toFixed(0)}%`}
                        </Text>
                      </View>
                    </View>

                    {/* Right - Dates Section */}
                    <View style={styles.premiumDateContainer}>
                      {/* Start Date */}
                      <View style={styles.premiumDateRow}>
                        <View style={[styles.premiumDateIconContainer, { borderColor: 'rgba(8, 68, 137, 0.3)' }]}>
                          <Ionicons name="calendar-outline" size={16} color="#0c78f0" />
                        </View>
                        <View style={{ marginLeft: 6 }}>
                          <Text style={[
                            styles.premiumDateLabel,
                            { fontSize: responsiveFontSize(1.2), color: 'rgba(8, 68, 137, 0.6)' }
                          ]}>
                            {t('start')}:
                          </Text>
                          <Text style={[
                            styles.premiumDateValue,
                            { fontSize: responsiveFontSize(1.4), color: '#084489' }
                          ]}>
                            {moment.unix(subscriptionDetails?.start_at).format('DD MMM YYYY')}
                          </Text>
                        </View>
                      </View>

                      <Space height={responsiveFontSize(0.8)} />

                      {/* Expired Date */}
                      <View style={styles.premiumDateRow}>
                        <View style={[styles.premiumDateIconContainer, { borderColor: 'rgba(8, 68, 137, 0.3)' }]}>
                          <Ionicons name="time-outline" size={16} color="#0c78f0" />
                        </View>
                        <View style={{ marginLeft: 6 }}>
                          <Text style={[
                            styles.premiumDateLabel,
                            { fontSize: responsiveFontSize(1.2), color: 'rgba(8, 68, 137, 0.6)' }
                          ]}>
                            {t('expired')}:
                          </Text>
                          <Text style={[
                            styles.premiumDateValue,
                            { fontSize: responsiveFontSize(1.4), color: '#084489' }
                          ]}>
                            {moment.unix(subscriptionDetails?.end_at).subtract(1, 'day').format('DD MMM YYYY')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <Space height={responsiveFontSize(1.5)} />

                  {/* Download Invoice Button */}
                  <TouchableOpacity
                    onPress={downloadInvoice}
                    activeOpacity={0.85}
                    disabled={downloadingInvoice}
                    style={[
                      styles.premiumInvoiceButton,
                      { opacity: downloadingInvoice ? 0.7 : 1 }
                    ]}
                  >
                    <LinearGradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFillObject}
                      colors={['#084489', '#0c78f0', '#4A90D9', '#0c78f0', '#084489']}
                    />
                    {downloadingInvoice ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <MaterialIcons name="file-download" size={20} color="#FFFFFF" />
                        <Text style={[
                          styles.premiumInvoiceButtonText,
                          { fontSize: responsiveFontSize(1.7), marginLeft: 8, color: '#FFFFFF' }
                        ]}>
                          {t('downloadInvoice')}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Account Section */}
        <SectionHeader title={t('account')} />
        <CardContainer>
          <MenuItem
            icon={<Feather name="user" size={20} color={colors.royalBlue} />}
            title={t('profile')}
            onPress={_navigateProfileEdit}
          />
        </CardContainer>
        {/* <TouchableOpacity 
onPress={()=>{
  openOverlayPermission()
  console.log('pressed');
  
}}
>
  <Text>Enable Appear on Top</Text>
</TouchableOpacity> */}

        {/* <ZegoSendCallInvitationButton
          invitees={[{ userID: 'TM2512UPDR23435', userName: '"Abhishek"' }]}
          isVideoCall={true}
          resourceID={"TruckMitr"} // Please fill in the resource ID name that has been configured in the ZEGOCLOUD's console here.
        /> */}
        <ZegoSendCallInvitationButton
          invitees={[{ userID: 'TM2512UPDR23435', userName: 'Abhishek' }]}
          isVideoCall={true}
          resourceID="TruckMitr"
          text="Call Driver"
          backgroundColor={colors.white}
          textColor={colors.royalBlue}
          width={160}
          height={48}
          borderRadius={12}
          // borderColor={colors.royalBlue}
        />
        {/* General Section */}
        <SectionHeader title={t('general')} />
        <CardContainer>
          <MenuItem
            icon={<FontAwesome name="star-o" size={20} color="#FFD700" />}
            title={t('rateUs')}
            onPress={_navigateRating}
          />
          <View style={[styles.divider, { backgroundColor: colors.blackOpacity(0.06) }]} />
          <MenuItem
            icon={<AntDesign name="customerservice" size={20} color="#34C759" />}
            title={t('contactUs')}
            onPress={_navigateContactUs}
          />
          <View style={[styles.divider, { backgroundColor: colors.blackOpacity(0.06) }]} />
          <MenuItem
            icon={<Feather name="shield" size={20} color="#5856D6" />}
            title={t('privacyPolicy')}
            onPress={_navigatePrivacy}
          />
          <View style={[styles.divider, { backgroundColor: colors.blackOpacity(0.06) }]} />
          <MenuItem
            icon={<Ionicons name="settings-outline" size={20} color="#8E8E93" />}
            title={t('settings')}
            onPress={_navigateSetting}
          />
        </CardContainer>

        {/* Share Section */}
        <SectionHeader title={t('sharing')} />
        <CardContainer>
          <MenuItem
            icon={<Ionicons name="share-social-outline" size={20} color={colors.azureBlue} />}
            title={t('shareTheApp')}
            onPress={_onPressShareApp}
          />
        </CardContainer>

        {/* Account Actions Section */}
        <SectionHeader title={t('logins')} />
        <CardContainer>
          <MenuItem
            icon={<MaterialCommunityIcons name="logout" size={20} color={colors.royalBlue} />}
            title={t('logout')}
            onPress={_onPressLogout}
          />
          <View style={[styles.divider, { backgroundColor: colors.blackOpacity(0.06) }]} />
          <MenuItem
            icon={<MaterialCommunityIcons name="delete-outline" size={20} color="#FF3B30" />}
            title={t('deleteAccount')}
            onPress={_onPressDeleteAccount}
            textColor="#FF3B30"
          />
        </CardContainer>

        <Space height={responsiveHeight(8)} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  // Profile Header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
  },
  avatarImage: {
    borderRadius: 100,
  },
  completionBadge: {
    position: 'absolute',
    bottom: -4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  completionText: {
    fontWeight: '700',
  },
  userInfoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  userName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  userId: {
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    fontWeight: '600',
  },
  starContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
    gap: 4,
  },
  rankText: {
    fontWeight: '600',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Incomplete Card
  incompleteCard: {
    overflow: 'hidden',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  incompleteCardContent: {
    padding: 16,
  },
  alertIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incompleteTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  incompleteSubtitle: {
    flex: 1,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 14,
    gap: 8,
  },
  completeButtonText: {
    fontWeight: '600',
  },

  // Membership Card
  membershipCard: {
    position: 'relative',
    overflow: 'hidden',
  },
  subscribedRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomRightRadius: 10,
    gap: 4,
  },
  subscribedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  membershipTitle: {
    fontWeight: '700',
    marginBottom: 2,
  },
  membershipSubtitle: {},
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  priceText: {
    fontWeight: '800',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    fontWeight: '400',
  },
  durationText: {
    marginTop: 2,
  },
  savingsBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  savingsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  dateContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateLabel: {},
  dateValue: {
    fontWeight: '500',
  },
  invoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  invoiceButtonText: {
    fontWeight: '600',
  },

  // Premium Membership Card Styles
  premiumCardBorder: {
    borderRadius: 20,
    padding: 3,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  premiumMembershipCard: {
    borderRadius: 17,
    position: 'relative',
    overflow: 'hidden',
  },
  premiumSubscribedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden',
    zIndex: 10,
  },
  premiumSubscribedText: {
    color: '#1a1a2e',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  premiumMembershipTitle: {
    color: '#D4AF37',
    fontWeight: '700',
    fontStyle: 'italic',
  },
  premiumMembershipSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  premiumPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  premiumPriceText: {
    color: '#D4AF37',
    fontWeight: '800',
  },
  premiumOriginalPrice: {
    color: 'rgba(255, 255, 255, 0.5)',
    textDecorationLine: 'line-through',
    fontWeight: '400',
    marginLeft: 6,
  },
  premiumDurationText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  premiumSavingsBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  premiumSavingsText: {
    color: '#0a1628',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  premiumDateContainer: {
    alignItems: 'flex-start',
  },
  premiumDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumDateIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumDateLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  premiumDateValue: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  premiumInvoiceButtonWrapper: {
    borderRadius: 14,
    padding: 3,
    overflow: 'hidden',
  },
  premiumInvoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 11,
    overflow: 'hidden',
  },
  premiumInvoiceButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
    overflow: 'hidden',
  },
  premiumInvoiceButtonText: {
    color: '#0a1628',
    fontWeight: '700',
  },

  // Section & Menu
  sectionHeader: {
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  cardContainer: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 32,
    alignItems: 'center',
  },
  menuItemText: {
    flex: 1,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    marginLeft: 56,
  },

  // Dialog
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogContainer: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  dialogIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  dialogMessage: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  dialogButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCancelButton: {},
  dialogConfirmButton: {},
  dialogButtonText: {
    fontWeight: '600',
  },
});
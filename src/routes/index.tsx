import { StatusBar, useColorScheme, View, Image, AppState, Linking } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { darkTheme, lightTheme } from '@truckmitr/res/colors';
import { Auth, Main, ProfileCompletionStack } from '@truckmitr/stacks/index';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import BootSplash from 'react-native-bootsplash';
import { navigationRef } from '@truckmitr/utils/global/global.ref';
import { useDispatch, useSelector } from 'react-redux';
import { getUserData, deleteUserData } from '../utils/config/token';
import { validateToken } from '../utils/config/tokenValidator';
import { CommonActions } from '@react-navigation/native';
import { STACKS } from '@truckmitr/stacks/stacks';
import { onTokenExpired } from '../utils/config/authEvents';
import {
  subscriptionDetailsAction,
  userAction,
  userAuthenticatedAction,
} from '../redux/actions/user.action';
import axiosInstance from '../utils/config/axiosInstance';
import { END_POINTS } from '../utils/config';
import { useResponsiveScale } from '../app/hooks';
import Subscription from '../app/layouts/main/subscription';
import InAppUpdatePopup from '../utils/update';
import analytics from '@react-native-firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import { consumePendingNotificationNavigation, resetNotificationFlag } from '../utils/notification';
import { ZegoCallInvitationDialog } from '@zegocloud/zego-uikit-prebuilt-call-rn';

export let isNavigationReady = false;

export const setNavigationReady = (ready: boolean) => {
  isNavigationReady = ready;
};


export default function Routes() {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const { responsiveWidth, responsiveHeight } = useResponsiveScale();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const { isAuthenticated, subscriptionModal, user, profileRequiredFieldsStatus } = useSelector((state: any) => state?.user);
  const [isAppReady, setIsAppReady] = useState(false);

  console.log('🛡️ AUTH GATE STATUS:', { isAuthenticated, profileRequiredFieldsStatus });
  const [isInitializing, setIsInitializing] = useState(true);

  const routeNameRef = useRef<string | undefined>(undefined);
  const userIdRef = useRef<string | undefined>(undefined);
  const appState = useRef(AppState.currentState);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasInitialized = useRef(false);
  const lastBackgroundTime = useRef<number>(0);
  const isProfileCompleted = Boolean(
    user?.data?.profile_completed
  );

  console.log('--------------------------user data------------------', user);
  console.log('--------------------------is profile completed------------------', isProfileCompleted);

  // -------------------------------
  // 🔹 Logout and Redirect to Login
  // -------------------------------
  const logoutUser = async () => {
    console.log('🚪 Logging out user - token expired or invalid. Stack:', new Error().stack);

    // Clear token from storage
    await deleteUserData();

    // Clear session flag
    await AsyncStorage.removeItem('app_session_active');

    // Update Redux state
    dispatch(userAuthenticatedAction(false));

    // Reset navigation to login screen
    if (navigationRef.current) {
      navigationRef.current.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: STACKS.LOGIN }],
        })
      );
    }
  };

  // -------------------------------
  // 🔹 Get Logged-in User ID
  // -------------------------------
  const getLoggedInUserId = () => {
    return userIdRef.current || user?.data?.id?.toString() || user?.id?.toString() || 'UNKNOWN';
  };

  // -------------------------------
  // 🔹 Log User Event to Backend
  // -------------------------------
  const logUserEventBackend = async (screenName: string) => {
    try {
      const token = await getUserData();
      if (!token) {
        console.log("⚠️ No token found, skipping event log for:", screenName);
        return;
      }

      const payload = {
        event_type: screenName,
        description: `${screenName} from mobile app`,
      };

      const response = await axiosInstance.post(END_POINTS.LOG_USER_EVENT, payload);

      console.log("✅ logUserEvent saved:", payload, "Response:", response.data);
    } catch (err: any) {
      console.error("❌ logUserEvent error for", screenName, ":", err.response?.data || err.message || err);
    }
  };

  // -------------------------------
  // 🔹 Refresh User Data
  // -------------------------------
  const refreshUserData = async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);

      // Don't validate token on every refresh - just try to fetch data
      // If token is invalid, the API will return 401/403
      const profile: any = await axiosInstance.get(END_POINTS?.GET_PROFILE, {
        headers: {
          'X-Skip-Global-Logout': 'true' // Prevent auto-logout during refresh
        }
      });

      if (profile?.data?.status && profile?.status === 200) {
        // Don't overwrite user data during refresh to preserve local edits
        // Only update if this is initial load or explicit refresh
        console.log('Profile refreshed successfully');
        dispatch(userAction(profile?.data));
        userIdRef.current = profile?.data?.data?.id?.toString();

        const sub: any = await axiosInstance.get(END_POINTS?.PAYMENT_SUBSCRIPTION_DETAILS, {
          headers: {
            'X-Skip-Global-Logout': 'true'
          }
        });
        // Always dispatch subscription data - even empty array to clear stale data
        const subData = sub?.data?.data || [];
        dispatch(subscriptionDetailsAction(subData));
      } else if (profile?.status === 401 || profile?.status === 403) {
        // Only logout on explicit auth failure, not on network errors
        console.log('Auth failed during refresh - logging out');
        await logoutUser();
      }
      // For other errors (network, timeout), just log and continue - don't logout
    } catch (error: any) {
      console.error("Refresh user data error:", error);
      // Only logout if it's an authentication error, not a network/timeout error
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log('Auth error during refresh - logging out');
        await logoutUser();
      } else {
        console.log('Network error during refresh - keeping user logged in');
        // Network error or timeout - don't logout, user can retry
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // -------------------------------
  // 🔹 Listen for Token Expiration Events
  // -------------------------------
  useEffect(() => {
    const handleTokenExpired = async () => {
      console.log('🔴 Token expired event received - logging out');
      await logoutUser();
    };

    // Listen for token expiration events from axios interceptor
    const subscription = onTokenExpired(handleTokenExpired);

    return () => {
      subscription.remove();
    };
  }, []);

  // -------------------------------
  // 🔹 Handle App State Changes
  // -------------------------------
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      // Track when app goes to background
      if (nextAppState.match(/inactive|background/)) {
        lastBackgroundTime.current = Date.now();
      }

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isAuthenticated
      ) {
        // Calculate how long the app was in background
        const timeInBackground = Date.now() - lastBackgroundTime.current;

        // Only refresh if app was in background for more than 5 seconds
        // This prevents refresh when returning from image picker or other quick actions
        if (timeInBackground > 5000) {
          console.log('App has come to the foreground - refreshing user data');
          // Use setTimeout to avoid blocking the UI
          setTimeout(() => {
            refreshUserData();
          }, 500);
        } else {
          console.log('App returned quickly, skipping refresh to preserve local changes');
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  // -------------------------------
  // 🔹 Check incomplete signup
  // -------------------------------
  useEffect(() => {
    const checkIncompleteSignup = async () => {
      const raw = await AsyncStorage.getItem('signup_incomplete');
      if (raw) {
        const data = JSON.parse(raw);
        const timeElapsed = Date.now() - data.timestamp;
        if (timeElapsed > 2 * 60 * 1000) {
          await analytics().logEvent('signup_incomplete', data);
          AppEventsLogger.logEvent('signup_incomplete', data);
          await AsyncStorage.removeItem('signup_incomplete');
        }
      }
    };
    checkIncompleteSignup();
  }, []);

  // -------------------------------
  // 🔹 Load User + Profile + Subscription
  // -------------------------------
  useEffect(() => {
    const init = async () => {
      try {
        // Check if we're in the middle of a session (prevents re-init on activity restart)
        const sessionActive = await AsyncStorage.getItem('app_session_active');

        if (hasInitialized.current && sessionActive === 'true') {
          console.log('App already initialized and session active, skipping re-init');
          // Just hide splash and mark as ready
          await BootSplash.hide({ fade: true });
          setIsAppReady(true);
          setIsInitializing(false);
          return;
        }

        setIsInitializing(true);
        const token = await getUserData();
        if (token) {
          // Validate token before setting authenticated
          const isTokenValid = await validateToken();

          if (!isTokenValid) {
            console.log('Stored token is invalid - user needs to login again');
            await deleteUserData();
            await AsyncStorage.removeItem('app_session_active');
            dispatch(userAuthenticatedAction(false));
          } else {
            dispatch(userAuthenticatedAction(true));

            const profile: any = await axiosInstance.get(END_POINTS?.GET_PROFILE, {
              headers: {
                'X-Skip-Global-Logout': 'true' // Prevent auto-logout during init
              }
            });
            if (profile?.data?.status) {
              dispatch(userAction(profile?.data));
              userIdRef.current = profile?.data?.data?.id?.toString();

              const sub: any = await axiosInstance.get(END_POINTS?.PAYMENT_SUBSCRIPTION_DETAILS, {
                headers: {
                  'X-Skip-Global-Logout': 'true'
                }
              });
              // Always dispatch subscription data - even empty array to clear stale data
              const subData = sub?.data?.data || [];
              dispatch(subscriptionDetailsAction(subData));

              // Mark session as active
              await AsyncStorage.setItem('app_session_active', 'true');
            } else if (profile?.status === 401 || profile?.status === 403) {
              // Token became invalid
              await deleteUserData();
              await AsyncStorage.removeItem('app_session_active');
              dispatch(userAuthenticatedAction(false));
            }
          }
        } else {
          // No token, clear session
          await AsyncStorage.removeItem('app_session_active');
        }
      } catch (error) {
        console.error("Init error:", error);
        // On init error, ensure we're not stuck in authenticated state with bad token
        const isTokenValid = await validateToken();
        if (!isTokenValid) {
          await deleteUserData();
          await AsyncStorage.removeItem('app_session_active');
          dispatch(userAuthenticatedAction(false));
        }
      } finally {
        hasInitialized.current = true;
        setIsInitializing(false);
        setTimeout(async () => {
          await BootSplash.hide({ fade: true });
          setIsAppReady(true);
        }, 1200);
      }
    };
    init();
    SystemNavigationBar.setNavigationColor('translucent');
  }, []);
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      console.log('🌐 Deep link received by Navigation:', url);
    });

    return () => sub.remove();
  }, []);

  // Only show loading screen during initial app load, not during refresh
  if (!isAppReady && isInitializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <Image
          style={{ height: responsiveHeight(18), width: responsiveWidth(88), top: responsiveHeight(.4) }}
          source={{ uri: 'https://truckmitr.com/public/images/preview.png' }}
        />
      </View>
    );
  }

  // -------------------------------
  // 🔹 Navigation Tracking
  // -------------------------------
  return (
    <NavigationContainer
      // linking={linking}
      ref={navigationRef}
      theme={theme}
      onReady={async () => {
        setNavigationReady(true);
        console.log('🟢 NavigationContainer READY');
        await consumePendingNotificationNavigation();
        console.log(
          '🟢 Initial route:',
          navigationRef.current?.getCurrentRoute()?.name
        );

        const initialScreen = navigationRef.current?.getCurrentRoute()?.name;
        routeNameRef.current = initialScreen;

        console.log(`🚀 App Ready → User ID: ${getLoggedInUserId()} | Screen: ${initialScreen}`);
        logUserEventBackend(initialScreen!); // log initial screen
      }}
      onStateChange={async () => {
        const currentScreen = navigationRef.current?.getCurrentRoute()?.name;
        if (routeNameRef.current !== currentScreen && currentScreen) {
          console.log(`➡️ User ID: ${getLoggedInUserId()} | Screen Opened: ${currentScreen}`);

          await analytics().logScreenView({
            screen_name: currentScreen,
            screen_class: currentScreen,
          });

          AppEventsLogger.logEvent("screen_view", { screen_name: currentScreen });
          await logUserEventBackend(currentScreen); // log every screen change

          routeNameRef.current = currentScreen;
          resetNotificationFlag();
        }
      }}
    >
      <StatusBar translucent backgroundColor="transparent" />
      <ZegoCallInvitationDialog />
      {!isAuthenticated ? (
        <Auth />
        // ) : profileRequiredFieldsStatus === false ? (
        //   <ProfileCompletionStack />
      ) : (
        <Main />
      )}
      {subscriptionModal && <Subscription />}
      <InAppUpdatePopup />
    </NavigationContainer>
  );
}

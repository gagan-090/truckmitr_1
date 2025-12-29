/**
 * useSubscription Hook
 * 
 * Custom hook for managing subscription state and payment flow.
 * Handles:
 * - Subscription creation
 * - Payment checkout flow
 * - Resume pending payments
 * - Status verification
 */

import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import analytics from '@react-native-firebase/analytics';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import { useColor } from '@truckmitr/src/app/hooks';
import { showToast } from '@truckmitr/src/app/hooks/toast';
import SubscriptionService, { SubscriptionStatus, PendingSubscription } from '@truckmitr/src/services/subscription/SubscriptionService';
import RazorpayCheckoutWrapper, { CheckoutErrorType } from '@truckmitr/src/services/subscription/RazorpayCheckoutWrapper';

// Payment state types
export type PaymentState =
    | 'idle'
    | 'creating_subscription'
    | 'opening_checkout'
    | 'processing_payment'
    | 'verifying_payment'
    | 'success'
    | 'failed'
    | 'cancelled';

export interface UseSubscriptionReturn {
    // State
    paymentState: PaymentState;
    isLoading: boolean;
    error: string | null;
    pendingSubscription: PendingSubscription | null;

    // Actions
    initiateSubscription: (planId: string) => Promise<boolean>;
    resumePendingPayment: () => Promise<boolean>;
    verifySubscriptionStatus: (subscriptionId: string) => Promise<SubscriptionStatus | null>;
    clearError: () => void;
    resetState: () => void;
}

export function useSubscription(): UseSubscriptionReturn {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const colors = useColor();

    const { user, isDriver } = useSelector((state: any) => state?.user);

    // Local state
    const [paymentState, setPaymentState] = useState<PaymentState>('idle');
    const [error, setError] = useState<string | null>(null);
    const [pendingSubscription, setPendingSubscription] = useState<PendingSubscription | null>(null);

    // Computed state
    const isLoading = ['creating_subscription', 'opening_checkout', 'processing_payment', 'verifying_payment'].includes(paymentState);

    /**
     * Check for pending subscription on mount
     */
    useEffect(() => {
        const checkPendingSubscription = async () => {
            const pending = await SubscriptionService.getPendingSubscription();
            if (pending) {
                // Verify if subscription is already active
                const isActive = await SubscriptionService.isSubscriptionActive(pending.subscriptionId);
                if (isActive) {
                    await SubscriptionService.clearPendingSubscription();
                    setPendingSubscription(null);
                } else {
                    setPendingSubscription(pending);
                }
            }
        };

        checkPendingSubscription();
    }, []);

    /**
     * Log analytics event
     */
    const logAnalyticsEvent = useCallback(async (eventName: string, eventData: Record<string, any>) => {
        try {
            await analytics().logEvent(eventName, eventData);
            AppEventsLogger.logEvent(eventName, eventData);
        } catch (e) {
            console.error('Analytics error:', e);
        }
    }, []);

    /**
     * Build analytics data
     */
    const buildAnalyticsData = useCallback((additionalData: Record<string, any> = {}) => {
        return {
            user_id: String(user?.id ?? ''),
            user_unique_id: user?.unique_id ?? '',
            user_name: user?.name ?? '',
            user_email: user?.email ?? '',
            user_role: user?.role ?? '',
            ...additionalData,
        };
    }, [user]);

    /**
     * Initiate subscription payment flow
     * 
     * Flow:
     * 1. Call backend to create subscription
     * 2. Open Razorpay checkout with subscription_id
     * 3. On checkout success, show processing message
     * 4. Poll/verify subscription status
     * 5. Update UI based on actual status
     */
    const initiateSubscription = useCallback(async (planId: string): Promise<boolean> => {
        setError(null);

        try {
            // Step 1: Create subscription via backend
            setPaymentState('creating_subscription');

            const subscriptionResponse = await SubscriptionService.createSubscription(planId);

            if (!subscriptionResponse.subscription_id || !subscriptionResponse.razorpay_key) {
                throw new Error(t('failedToCreateSubscription'));
            }

            // Step 2: Open Razorpay checkout
            setPaymentState('opening_checkout');

            const checkoutOptions = RazorpayCheckoutWrapper.buildSubscriptionOptions({
                razorpayKey: subscriptionResponse.razorpay_key,
                subscriptionId: subscriptionResponse.subscription_id,
                userEmail: user?.email,
                userMobile: user?.mobile,
                userName: user?.name,
                userUniqueId: user?.unique_id,
                userRole: user?.role,
                themeColor: colors.royalBlue,
            });

            const checkoutResult = await RazorpayCheckoutWrapper.openSubscriptionCheckout(checkoutOptions);

            // Step 3: Handle checkout result
            if (!checkoutResult.success) {
                if (checkoutResult.cancelled) {
                    setPaymentState('cancelled');
                    showToast(t('paymentCancelled'));

                    await logAnalyticsEvent('subscription_payment_cancelled', buildAnalyticsData({
                        plan_id: planId,
                        subscription_id: subscriptionResponse.subscription_id,
                    }));

                    return false;
                }

                // Payment failed
                const parsedError = RazorpayCheckoutWrapper.parseError(checkoutResult.error);
                setPaymentState('failed');
                setError(parsedError.message);
                showToast(t('oopsPaymentUnsuccessful'));

                await logAnalyticsEvent('subscription_payment_failed', buildAnalyticsData({
                    plan_id: planId,
                    subscription_id: subscriptionResponse.subscription_id,
                    error_type: parsedError.type,
                    error_message: parsedError.message,
                }));

                return false;
            }

            // Step 4: Checkout closed successfully - but do NOT trust this!
            // Show processing message and verify with backend
            setPaymentState('verifying_payment');

            await logAnalyticsEvent('subscription_checkout_success', buildAnalyticsData({
                plan_id: planId,
                subscription_id: subscriptionResponse.subscription_id,
                payment_id: checkoutResult.data?.razorpay_payment_id,
            }));

            // Step 5: Poll subscription status as fallback verification
            const finalStatus = await SubscriptionService.pollSubscriptionStatus(
                subscriptionResponse.subscription_id,
                5, // max 5 attempts
                3000 // 3 second intervals
            );

            if (finalStatus === 'active') {
                setPaymentState('success');
                await SubscriptionService.clearPendingSubscription();

                await logAnalyticsEvent('subscription_payment_verified', buildAnalyticsData({
                    plan_id: planId,
                    subscription_id: subscriptionResponse.subscription_id,
                    status: 'active',
                }));

                return true;
            } else if (finalStatus === 'halted' || finalStatus === 'cancelled') {
                setPaymentState('failed');
                setError(t('paymentVerificationFailed'));
                return false;
            } else {
                // Status still pending - webhook will handle it
                // Show success for now (webhook is final authority)
                setPaymentState('success');
                await SubscriptionService.clearPendingSubscription();
                return true;
            }

        } catch (err: any) {
            console.error('initiateSubscription error:', err);
            setPaymentState('failed');
            setError(err.message || t('somethingWentWrong'));
            showToast(err.message || t('oopsPaymentUnsuccessful'));

            await logAnalyticsEvent('subscription_payment_error', buildAnalyticsData({
                error: err.message,
            }));

            return false;
        }
    }, [user, colors, t, logAnalyticsEvent, buildAnalyticsData]);

    /**
     * Resume a pending payment that was interrupted
     */
    const resumePendingPayment = useCallback(async (): Promise<boolean> => {
        if (!pendingSubscription) {
            return false;
        }

        setError(null);
        setPaymentState('verifying_payment');

        try {
            // First check if subscription is already active
            const isActive = await SubscriptionService.isSubscriptionActive(
                pendingSubscription.subscriptionId
            );

            if (isActive) {
                setPaymentState('success');
                await SubscriptionService.clearPendingSubscription();
                setPendingSubscription(null);
                showToast(t('subscriptionAlreadyActive'));
                return true;
            }

            // Get razorpay key from backend (would need a new endpoint or cached value)
            // For now, we'll re-initiate the subscription flow
            return await initiateSubscription(pendingSubscription.planId);

        } catch (err: any) {
            console.error('resumePendingPayment error:', err);
            setPaymentState('failed');
            setError(err.message || t('failedToResumePayment'));
            return false;
        }
    }, [pendingSubscription, initiateSubscription, t]);

    /**
     * Verify subscription status
     */
    const verifySubscriptionStatus = useCallback(async (
        subscriptionId: string
    ): Promise<SubscriptionStatus | null> => {
        try {
            const status = await SubscriptionService.getSubscriptionStatus(subscriptionId);
            return status?.status || null;
        } catch (err) {
            console.error('verifySubscriptionStatus error:', err);
            return null;
        }
    }, []);

    /**
     * Clear current error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Reset state to idle
     */
    const resetState = useCallback(() => {
        setPaymentState('idle');
        setError(null);
    }, []);

    return {
        paymentState,
        isLoading,
        error,
        pendingSubscription,
        initiateSubscription,
        resumePendingPayment,
        verifySubscriptionStatus,
        clearError,
        resetState,
    };
}

export default useSubscription;

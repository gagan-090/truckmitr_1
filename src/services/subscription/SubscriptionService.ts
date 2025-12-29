/**
 * Subscription Service
 * 
 * Handles all subscription-related operations following Razorpay's subscription flow.
 * 
 * SECURITY RULES:
 * ❌ Never store Razorpay secret key in frontend
 * ❌ Never create payments in frontend  
 * ❌ Never trust Razorpay success callback alone
 * ✅ Only open Razorpay Checkout using subscription_id from backend
 * ✅ Backend is the single source of truth
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '@truckmitr/src/utils/config/axiosInstance';
import { END_POINTS } from '@truckmitr/src/utils/config';

// Storage keys for subscription persistence
const STORAGE_KEYS = {
    PENDING_SUBSCRIPTION: 'pending_subscription_id',
    SUBSCRIPTION_PLAN_ID: 'pending_plan_id',
    SUBSCRIPTION_CREATED_AT: 'subscription_created_at',
};

// Subscription status types
export type SubscriptionStatus =
    | 'created'      // Subscription created but not active
    | 'authenticated' // Customer authenticated subscription
    | 'active'       // Subscription is active (payment successful)
    | 'pending'      // Payment pending
    | 'halted'       // Subscription halted due to payment failure
    | 'cancelled'    // Subscription cancelled
    | 'completed'    // Subscription completed
    | 'expired';     // Subscription expired

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    amount: number;
    currency: string;
    period: string;
    interval: number;
}

export interface CreateSubscriptionResponse {
    subscription_id: string;
    razorpay_key: string;
    status?: string;
    message?: string;
}

export interface SubscriptionStatusResponse {
    id: string;
    status: SubscriptionStatus;
    plan_id: string;
    current_start?: number;
    current_end?: number;
    paid_count?: number;
    remaining_count?: number;
    short_url?: string;
}

export interface PendingSubscription {
    subscriptionId: string;
    planId: string;
    createdAt: number;
}

class SubscriptionService {
    private static instance: SubscriptionService;

    private constructor() { }

    public static getInstance(): SubscriptionService {
        if (!SubscriptionService.instance) {
            SubscriptionService.instance = new SubscriptionService();
        }
        return SubscriptionService.instance;
    }

    /**
     * Create a new subscription via backend API
     * 
     * @param planId - The ID of the subscription plan
     * @returns Subscription details including subscription_id and razorpay_key
     * @throws Error if subscription creation fails
     */
    async createSubscription(planId: string): Promise<CreateSubscriptionResponse> {
        try {
            const formData = new FormData();
            formData.append('plan_id', planId);

            const response = await axiosInstance.post(
                END_POINTS.PAYMENT_SUBSCRIPTION_CREATE,
                formData
            );

            if (response?.data?.subscription_id && response?.data?.razorpay_key) {
                // Save pending subscription for resume functionality
                await this.savePendingSubscription(
                    response.data.subscription_id,
                    planId
                );

                return {
                    subscription_id: response.data.subscription_id,
                    razorpay_key: response.data.razorpay_key,
                    status: 'created',
                };
            }

            throw new Error(response?.data?.message || 'Failed to create subscription');
        } catch (error: any) {
            console.error('SubscriptionService.createSubscription error:', error);

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }

            throw new Error(error.message || 'Failed to create subscription');
        }
    }

    /**
     * Fetch subscription status from backend (for verification/fallback)
     * 
     * @param subscriptionId - The Razorpay subscription ID
     * @returns Subscription status details
     */
    async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatusResponse | null> {
        try {
            const response = await axiosInstance.get(
                `api/subscription/${subscriptionId}`
            );

            if (response?.data) {
                return {
                    id: response.data.id || subscriptionId,
                    status: response.data.status as SubscriptionStatus,
                    plan_id: response.data.plan_id,
                    current_start: response.data.current_start,
                    current_end: response.data.current_end,
                    paid_count: response.data.paid_count,
                    remaining_count: response.data.remaining_count,
                    short_url: response.data.short_url,
                };
            }

            return null;
        } catch (error: any) {
            console.error('SubscriptionService.getSubscriptionStatus error:', error);
            return null;
        }
    }

    /**
     * Check if subscription is active
     * 
     * @param subscriptionId - The Razorpay subscription ID
     * @returns Boolean indicating if subscription is active
     */
    async isSubscriptionActive(subscriptionId: string): Promise<boolean> {
        const status = await this.getSubscriptionStatus(subscriptionId);
        return status?.status === 'active';
    }

    /**
     * Save pending subscription for resume functionality
     * This allows users to resume payment if app is closed during checkout
     */
    async savePendingSubscription(subscriptionId: string, planId: string): Promise<void> {
        try {
            await AsyncStorage.multiSet([
                [STORAGE_KEYS.PENDING_SUBSCRIPTION, subscriptionId],
                [STORAGE_KEYS.SUBSCRIPTION_PLAN_ID, planId],
                [STORAGE_KEYS.SUBSCRIPTION_CREATED_AT, Date.now().toString()],
            ]);
        } catch (error) {
            console.error('Failed to save pending subscription:', error);
        }
    }

    /**
     * Get any pending subscription that needs to be resumed
     * 
     * @returns Pending subscription details or null
     */
    async getPendingSubscription(): Promise<PendingSubscription | null> {
        try {
            const values = await AsyncStorage.multiGet([
                STORAGE_KEYS.PENDING_SUBSCRIPTION,
                STORAGE_KEYS.SUBSCRIPTION_PLAN_ID,
                STORAGE_KEYS.SUBSCRIPTION_CREATED_AT,
            ]);

            const subscriptionId = values[0][1];
            const planId = values[1][1];
            const createdAt = values[2][1];

            if (!subscriptionId || !planId || !createdAt) {
                return null;
            }

            // Check if subscription is not too old (24 hours max)
            const createdAtTime = parseInt(createdAt, 10);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            if (Date.now() - createdAtTime > maxAge) {
                // Clear old pending subscription
                await this.clearPendingSubscription();
                return null;
            }

            return {
                subscriptionId,
                planId,
                createdAt: createdAtTime,
            };
        } catch (error) {
            console.error('Failed to get pending subscription:', error);
            return null;
        }
    }

    /**
     * Clear pending subscription after successful payment or cancellation
     */
    async clearPendingSubscription(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.PENDING_SUBSCRIPTION,
                STORAGE_KEYS.SUBSCRIPTION_PLAN_ID,
                STORAGE_KEYS.SUBSCRIPTION_CREATED_AT,
            ]);
        } catch (error) {
            console.error('Failed to clear pending subscription:', error);
        }
    }

    /**
     * Poll subscription status with retry logic
     * Used as fallback to verify payment status
     * 
     * @param subscriptionId - The Razorpay subscription ID
     * @param maxAttempts - Maximum number of polling attempts
     * @param intervalMs - Interval between attempts in milliseconds
     * @returns Final subscription status
     */
    async pollSubscriptionStatus(
        subscriptionId: string,
        maxAttempts: number = 5,
        intervalMs: number = 3000
    ): Promise<SubscriptionStatus | null> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const status = await this.getSubscriptionStatus(subscriptionId);

                if (status?.status === 'active') {
                    await this.clearPendingSubscription();
                    return 'active';
                }

                if (status?.status === 'halted' || status?.status === 'cancelled') {
                    return status.status;
                }

                // Wait before next attempt
                if (attempt < maxAttempts) {
                    await new Promise<void>((resolve) => setTimeout(() => resolve(), intervalMs));
                }
            } catch (error) {
                console.error(`Polling attempt ${attempt} failed:`, error);
            }
        }

        return null;
    }
}

export default SubscriptionService.getInstance();

/**
 * Razorpay Checkout Wrapper
 * 
 * A safe wrapper around react-native-razorpay for subscription payments.
 * 
 * IMPORTANT: 
 * - Payment success callback does NOT mean payment is captured
 * - Always verify with backend before marking user as subscribed
 * - Backend webhook is the final authority
 */

import RazorpayCheckout from 'react-native-razorpay';

// Razorpay checkout options for subscriptions
export interface SubscriptionCheckoutOptions {
    key: string;
    subscription_id: string;
    name: string;
    description: string;
    prefill: {
        email?: string;
        contact?: string | number;
        name?: string;
    };
    theme: {
        color: string;
    };
    image?: string;
    notes?: Record<string, string>;
}

// Razorpay success response
export interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
}

// Razorpay error response
export interface RazorpayErrorResponse {
    code: string;
    description: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: {
        order_id?: string;
        payment_id?: string;
    };
}

// Checkout result
export interface CheckoutResult {
    success: boolean;
    data?: RazorpaySuccessResponse;
    error?: RazorpayErrorResponse;
    cancelled?: boolean;
}

// Error types for better error handling
export enum CheckoutErrorType {
    PAYMENT_CANCELLED = 'PAYMENT_CANCELLED',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    NETWORK_ERROR = 'NETWORK_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ParsedCheckoutError {
    type: CheckoutErrorType;
    message: string;
    originalError?: RazorpayErrorResponse;
}

class RazorpayCheckoutWrapper {
    private static instance: RazorpayCheckoutWrapper;

    private constructor() { }

    public static getInstance(): RazorpayCheckoutWrapper {
        if (!RazorpayCheckoutWrapper.instance) {
            RazorpayCheckoutWrapper.instance = new RazorpayCheckoutWrapper();
        }
        return RazorpayCheckoutWrapper.instance;
    }

    /**
     * Open Razorpay checkout for subscription payment
     * 
     * IMPORTANT: Success from this method does NOT confirm payment!
     * Always verify with backend after success.
     * 
     * @param options - Checkout options with subscription_id
     * @returns Checkout result
     */
    async openSubscriptionCheckout(
        options: SubscriptionCheckoutOptions
    ): Promise<CheckoutResult> {
        try {
            // Validate required fields
            if (!options.key) {
                throw new Error('Razorpay key is required');
            }
            if (!options.subscription_id) {
                throw new Error('Subscription ID is required');
            }

            // Open Razorpay checkout
            const data = await RazorpayCheckout.open(options as any) as any;

            // Success callback - but DO NOT trust this alone!
            return {
                success: true,
                data: {
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_subscription_id: data.razorpay_subscription_id || '',
                    razorpay_signature: data.razorpay_signature,
                },
            };
        } catch (error: any) {
            // Parse and return error
            const parsedError = this.parseError(error);

            return {
                success: false,
                error: error,
                cancelled: parsedError.type === CheckoutErrorType.PAYMENT_CANCELLED,
            };
        }
    }

    /**
     * Parse Razorpay error into a more usable format
     * 
     * @param error - Raw error from Razorpay
     * @returns Parsed error with type and message
     */
    parseError(error: any): ParsedCheckoutError {
        // Handle user cancellation
        if (
            error?.code === 'PAYMENT_CANCELLED' ||
            error?.description?.toLowerCase().includes('cancelled') ||
            error?.description?.toLowerCase().includes('canceled') ||
            error?.code === 2
        ) {
            return {
                type: CheckoutErrorType.PAYMENT_CANCELLED,
                message: 'Payment was cancelled',
                originalError: error,
            };
        }

        // Handle network errors
        if (
            error?.code === 'NETWORK_ERROR' ||
            error?.description?.toLowerCase().includes('network') ||
            error?.description?.toLowerCase().includes('internet')
        ) {
            return {
                type: CheckoutErrorType.NETWORK_ERROR,
                message: 'Network error occurred. Please check your internet connection.',
                originalError: error,
            };
        }

        // Handle payment failure
        if (error?.code || error?.description) {
            return {
                type: CheckoutErrorType.PAYMENT_FAILED,
                message: error?.description || 'Payment failed. Please try again.',
                originalError: error,
            };
        }

        // Unknown error
        return {
            type: CheckoutErrorType.UNKNOWN_ERROR,
            message: 'An unexpected error occurred',
            originalError: error,
        };
    }

    /**
     * Build checkout options for subscription
     * 
     * @param params - Required parameters for checkout
     * @returns Complete checkout options
     */
    buildSubscriptionOptions(params: {
        razorpayKey: string;
        subscriptionId: string;
        userEmail?: string;
        userMobile?: string | number;
        userName?: string;
        userUniqueId?: string;
        userRole?: string;
        themeColor?: string;
    }): SubscriptionCheckoutOptions {
        return {
            key: params.razorpayKey,
            subscription_id: params.subscriptionId,
            name: 'TruckMitr',
            description: 'Subscription Payment',
            image: 'https://truckmitr.com/public/front/assets/images/logotrick.png',
            prefill: {
                email: params.userEmail || '',
                contact: params.userMobile || '',
                name: params.userName || '',
            },
            theme: {
                color: params.themeColor || '#1E3A8A',
            },
            notes: {
                unique_id: params.userUniqueId || '',
                role: params.userRole || '',
            },
        };
    }
}

export default RazorpayCheckoutWrapper.getInstance();

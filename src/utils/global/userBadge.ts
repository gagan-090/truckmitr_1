/**
 * Utility function to get user badge text based on role and subscription
 */

export interface UserBadgeParams {
  user: {
    role?: string;
  };
  subscriptionDetails?: {
    id?: string;
    payment_id?: string;
    amount?: string | number;
    payment_details?: {
      amount?: number;
    };
  };
  isDriver?: boolean;
}

/**
 * Get the actual paid amount from subscription
 */
const getPaidAmount = (subscriptionDetails: any, isDriver: boolean): number => {
  // Amount is stored directly on subscription object as string (e.g., "99.00")
  if (subscriptionDetails?.amount) {
    return parseFloat(subscriptionDetails.amount);
  }
  // Fallback to payment_details.amount (in paise, needs /100)
  if (subscriptionDetails?.payment_details?.amount) {
    return subscriptionDetails.payment_details.amount / 100;
  }
  // Default fallback
  return isDriver ? 199 : 499;
};

/**
 * Capitalize first letter of a string
 */
const capitalizeFirst = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Get user badge text based on role and subscription
 * 
 * Logic:
 * - Transporter:
 *   - No subscription: show role only
 *   - Amount 99/100/1: "Legacy Transporter"
 *   - Amount 499: "Transporter Pro"
 * 
 * - Driver:
 *   - No subscription: show role only
 *   - Amount 1/49/100: "Legacy Driver"
 *   - Amount 199: "Verified Driver"
 *   - Amount 499: "Trusted Driver"
 */
export const getUserBadgeText = ({ user, subscriptionDetails, isDriver }: UserBadgeParams): string => {
  const userRole = capitalizeFirst(user?.role || '');

  // Check if user has subscription
  const hasSub = subscriptionDetails && (subscriptionDetails?.id || subscriptionDetails?.payment_id);

  if (!hasSub) {
    // No subscription - show role only
    return userRole;
  }

  // Get paid amount
  const paidAmount = getPaidAmount(subscriptionDetails, isDriver || false);
  const role = user?.role?.toLowerCase();

  if (role === 'transporter') {
    // Transporter logic
    if (paidAmount === 99 || paidAmount === 100 || paidAmount === 1) {
      return 'Legacy Transporter';
    }
    if (paidAmount === 499) {
      return 'Transporter Pro';
    }
    // Default for transporter with subscription but unrecognized amount
    return userRole;
  }

  if (role === 'driver') {
    // Driver logic
    if (paidAmount === 1 || paidAmount === 49 || paidAmount === 100) {
      return 'Legacy Driver';
    }
    if (paidAmount === 199) {
      return 'Verified Driver';
    }
    if (paidAmount === 499) {
      return 'Trusted Driver';
    }
    // Default for driver with subscription but unrecognized amount
    return userRole;
  }

  // Fallback for unknown roles
  return userRole;
};

/**
 * Get user tier type for internal use
 */
export type TierType = 'JOB READY' | 'VERIFIED' | 'TRUSTED' | 'LEGACY' | 'TRANSPORTER PRO';

export const getUserTier = ({ user, subscriptionDetails, isDriver }: UserBadgeParams): TierType => {
  const hasSub = subscriptionDetails && (subscriptionDetails?.id || subscriptionDetails?.payment_id);

  if (!hasSub) {
    return 'JOB READY';
  }

  const paidAmount = getPaidAmount(subscriptionDetails, isDriver || false);
  const role = user?.role?.toLowerCase();

  if (role === 'transporter') {
    if (paidAmount === 99 || paidAmount === 100 || paidAmount === 1) {
      return 'LEGACY';
    }
    if (paidAmount === 499) {
      return 'TRANSPORTER PRO';
    }
    return 'JOB READY';
  }

  if (role === 'driver') {
    if (paidAmount === 1 || paidAmount === 49 || paidAmount === 100) {
      return 'LEGACY';
    }
    if (paidAmount === 199) {
      return 'VERIFIED';
    }
    if (paidAmount === 499) {
      return 'TRUSTED';
    }
    return 'JOB READY';
  }

  return 'JOB READY';
};

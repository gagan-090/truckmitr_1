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
    hasActiveSubscription?: boolean;
    showSubscriptionModel?: boolean;
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
    if (paidAmount === 99) {
      return 'Job Ready Driver';
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

/**
 * Check if user should show membership card
 * Currently only drivers get cards, but future-ready for transporters
 */
export const shouldShowMembershipCard = ({ user, subscriptionDetails, isDriver }: UserBadgeParams): boolean => {
  const role = user?.role?.toLowerCase();

  // Check if user has subscription
  const hasSub = subscriptionDetails && (subscriptionDetails?.id || subscriptionDetails?.payment_id);
  const hasActiveSubscription = Boolean(subscriptionDetails?.hasActiveSubscription || !subscriptionDetails?.showSubscriptionModel);

  if (role === 'driver') {
    // Drivers get cards when they have active subscription and subscription ID
    return Boolean(isDriver && hasActiveSubscription && hasSub);
  }

  if (role === 'transporter') {
    // Future: Transporters will get cards based on similar logic
    // To enable transporter cards, simply change this to:
    // return Boolean(hasActiveSubscription && hasSub);
    return Boolean(hasActiveSubscription && hasSub);
  }

  return false;
};

/**
 * Get membership card tier configuration
 * Maps our utility tiers to card display properties
 */
export interface MembershipCardConfig {
  tier: TierType;
  displayName: string;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
}

export const getMembershipCardConfig = (params: UserBadgeParams): MembershipCardConfig | null => {
  if (!shouldShowMembershipCard(params)) {
    return null;
  }

  const tier = getUserTier(params);
  const role = params.user?.role?.toLowerCase();

  // Driver card configurations
  if (role === 'driver') {
    switch (tier) {
      case 'TRUSTED':
        return {
          tier,
          displayName: 'Trusted Driver',
          backgroundColor: '#1a237e', // Deep blue
          textColor: '#ffffff',
          borderColor: '#ffd700' // Gold border
        };
      case 'VERIFIED':
        return {
          tier,
          displayName: 'Verified Driver',
          backgroundColor: '#2e7d32', // Green
          textColor: '#ffffff',
          borderColor: '#4caf50'
        };
      case 'LEGACY':
        return {
          tier,
          displayName: 'Legacy Driver',
          backgroundColor: '#5d4037', // Brown
          textColor: '#ffffff',
          borderColor: '#8d6e63'
        };
      default:
        return {
          tier: 'JOB READY',
          displayName: 'Job Ready Driver',
          backgroundColor: '#1976d2', // Blue
          textColor: '#ffffff',
          borderColor: '#42a5f5'
        };
    }
  }

  // Future: Transporter card configurations
  if (role === 'transporter') {
    switch (tier) {
      case 'TRANSPORTER PRO':
        return {
          tier,
          displayName: 'Transporter Pro',
          backgroundColor: '#4a148c', // Purple
          textColor: '#ffffff',
          borderColor: '#ffd700'
        };
      case 'LEGACY':
        return {
          tier,
          displayName: 'Legacy Transporter',
          backgroundColor: '#5d4037', // Brown
          textColor: '#ffffff',
          borderColor: '#8d6e63'
        };
      default:
        return {
          tier: 'JOB READY',
          displayName: 'Transporter',
          backgroundColor: '#1976d2',
          textColor: '#ffffff',
          borderColor: '#42a5f5'
        };
    }
  }

  return null;
};
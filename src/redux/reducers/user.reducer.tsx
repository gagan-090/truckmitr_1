import * as TYPES from '@truckmitr/redux/actions/types'

const initialState = {
    user: null,
    userEdit: null,
    isAuthenticated: false,
    isDriver: undefined,
    isTransporter: undefined,
    profileCompletion: null,
    rank: null,
    star_rating: null,
    dashboard: null,
    subscriptionDetails: null,
    subscriptionModal: false,
    paymentVerificationModal: false,
    referral: null,
    whatsapp_link: null
}

const userReducer = (state = initialState, action: any) => {
    const { type, payload } = action
    switch (type) {
        case TYPES['USER_AUTHENTICATED']:
            return {
                ...state,
                isAuthenticated: Boolean(payload)
            }
        case TYPES['FETCH_USER']:
            let editData = payload?.user;
            if (typeof editData?.Operational_Segment === 'string') {
                try {
                    editData.Operational_Segment = JSON.parse(editData.Operational_Segment);
                } catch (e) {
                    console.error("Invalid JSON string in Operational_Segment", e);
                }
            }
            
            // Preserve local edits (like profilePath) when refreshing user data
            const preservedUserEdit = (state.userEdit as any)?.profilePath 
                ? { ...payload?.user, profilePath: (state.userEdit as any).profilePath }
                : payload?.user;
            
            return {
                ...state,
                user: payload?.user,
                userEdit: preservedUserEdit,
                isDriver: payload?.user?.role === 'driver',
                isTransporter: payload?.user?.role === 'transporter',
                profileCompletion: payload?.profile_completion,
                dashboard: payload?.dashboard_status,
                rank: payload?.rank,
                star_rating: payload?.star_rating,
                referral: {referral_remains: payload?.referral_remains, referral_sent: payload?.referral_sent,referral_success: payload?.referral_success, referral_bonus: payload?.referral_bonus, total_referrals: payload?.total_referrals},
                whatsapp_link: payload?.whatsapp_link
            }
        case TYPES['USER_PROFILE_EDIT']:
            return {
                ...state,
                userEdit: payload
            }
        case TYPES['SUBSCRIPTION_DETAILS']:
            // filter for subscription records
            const subscription = payload.filter((item: any) => item.payment_type === "subscription");
            let payloadSubscriptionDetails = subscription[0]
            if (typeof payloadSubscriptionDetails?.payment_details === 'string') {
                try {
                    payloadSubscriptionDetails.payment_details = JSON.parse(payloadSubscriptionDetails.payment_details);
                } catch (e) {
                    console.error("Invalid JSON string in payment_details", e);
                }
            }
            const currentTimeInSeconds = Math.floor(Date.now() / 1000);
            const subscriptionExpiry = currentTimeInSeconds > payloadSubscriptionDetails?.end_at;
            const isExpired = subscriptionExpiry;
            const hasNoSubscription = !payloadSubscriptionDetails?.id;
            return {
                ...state,
                subscriptionDetails: payloadSubscriptionDetails?.id ? { ...payloadSubscriptionDetails, subscriptionExpiry, showSubscriptionModel: (hasNoSubscription || isExpired) } : { showSubscriptionModel: (hasNoSubscription || isExpired) }
            }
        case TYPES['SUBSCRIPTION_MODAL']:
            return {
                ...state,
                subscriptionModal: payload
            }
        case TYPES['PAYMENTVERIFICATION_MODAL']:
            return {
                ...state,
                paymentVerificationModal: payload
            }
        default: return { ...state }
    }

}

export default userReducer
import messaging, {
    FirebaseMessagingTypes,
    AuthorizationStatus,
} from '@react-native-firebase/messaging';
import {
    checkNotifications,
    requestNotifications,
    RESULTS,
} from 'react-native-permissions';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

const CHANNEL_ID = 'truckMitr_channel';
const CHANNEL_NAME = 'TruckMitr Notifications';
const SOUND_NAME = 'truck_sound';

let notificationShown = false;

export const setupFirebaseNotifications = async () => {
    console.log('--- Setting up Firebase Notifications ---');

    // Create notification channel FIRST - this is critical for kill mode
    await createNotifeeChannel();

    // Request Android notification permission WITHOUT setTimeout to prevent app restart issues
    if (Platform.OS === 'android') {
        try {
            const { status } = await checkNotifications();
            console.log('Android Notification Permission Status (checkNotifications):', status);
            if (status !== RESULTS.GRANTED) {
                console.log('Android: Requesting POST_NOTIFICATIONS permission...');
                const requestStatus = await requestNotifications(['alert', 'sound']);
                console.log('Android POST_NOTIFICATIONS Permission Request Result:', requestStatus.status);
            }
        } catch (error) {
            console.error('Error requesting Android notification permission:', error);
        }
    }

    const currentStatus = await messaging().hasPermission();
    console.log('FCM current permission status:', currentStatus);

    let token: string | null = null;

    if (currentStatus === AuthorizationStatus.NOT_DETERMINED) {
        console.log('FCM permission not determined, requesting...');
        token = await requestFCMUserPermission();
    } else {
        console.log('FCM permission already determined, getting token...');
        token = await getFCMToken();
    }

    attachNotificationListeners();
    console.log('--- Firebase Notifications setup complete ---');
    return token;
};

const requestFCMUserPermission = async () => {
    try {
        const status = await messaging().requestPermission({
            provisional: true,
            announcement: true,
        });
        console.log('FCM Permission Request Status:', status);
        if (
            status === AuthorizationStatus.AUTHORIZED ||
            status === AuthorizationStatus.PROVISIONAL
        ) {
            return getFCMToken();
        }
        console.warn('FCM: User denied notification permission.');
        return null;
    } catch (e) {
        console.error('Error requesting FCM permission:', e);
        return null;
    }
};

const getFCMToken = async () => {
    try {
        const token = await messaging().getToken();
        console.log('FCM Token retrieved:', token);
        return token;
    } catch (e) {
        console.error('Error getting FCM token:', e);
        return null;
    }
};

const createNotifeeChannel = async () => {
    try {
        await notifee.createChannel({
            id: CHANNEL_ID,
            name: CHANNEL_NAME,
            sound: SOUND_NAME,
            importance: AndroidImportance.HIGH,
            vibration: true,
        });
        console.log('Notifee channel created or updated successfully (ID:', CHANNEL_ID + ')');
    } catch (err) {
        console.error('Error creating notifee channel:', err);
    }
};

// Function to ensure channel is created immediately on app start
export const initializeNotificationChannel = async () => {
    if (Platform.OS === 'android') {
        await createNotifeeChannel();
        console.log('Notification channel initialized for kill mode support');
    }
};

// Helper function to display notification with custom truck sound
export const displayNotificationWithTruckSound = async (title: string, body: string, data?: any) => {
    try {
        // Generate unique notification ID based on content to prevent duplicates
        const notificationId = generateNotificationId(title, body, data);
        await notifee.displayNotification({
            id: notificationId,
            title: title,
            body: body,
            data: data,
            android: {
                channelId: CHANNEL_ID,
                smallIcon: 'ic_notification',
                sound: SOUND_NAME,
                importance: AndroidImportance.HIGH,
                pressAction: {
                    id: 'default',
                },
                vibrationPattern: [300, 500],
                autoCancel: true,
            },
        });
        return true;
    } catch (error) {
        console.error('Error displaying notification with truck sound:', error);
        return false;
    }
};

// Generate unique ID for notification to prevent duplicates
const generateNotificationId = (title: string, body: string, data?: any): string => {
    const content = `${title}-${body}-${JSON.stringify(data || {})}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
};

const attachNotificationListeners = () => {
    console.log('Attaching notification listeners...');
    // Disable FCM's auto-initialization to prevent automatic notifications
    messaging().setAutoInitEnabled(false);

    messaging().onMessage(async (msg: FirebaseMessagingTypes.RemoteMessage) => {
        console.log('--- Foreground message received (onMessage) ---');
        console.log('Message:', JSON.stringify(msg, null, 2));

        // Prevent duplicate notifications
        if (notificationShown) {
            console.log('Notification already shown, skipping duplicate...');
            return;
        }

        const title: any = msg.notification?.title || msg.data?.title || 'TruckMitr 🔔';
        const body: any = msg.notification?.body || msg.data?.body || 'You have a new message';

        try {
            // Set flag to prevent duplicates
            notificationShown = true;
            await displayNotificationWithTruckSound(title, body, msg.data);
            // Reset flag after a short delay to allow new notifications
            setTimeout(() => {
                notificationShown = false;
            }, 2000);

        } catch (displayError) {
            console.error('Error displaying Notifee foreground notification:', displayError);
            // Reset flag on error
            notificationShown = false;
        }
        console.log('------------------------------------------------');
    });

    messaging().setBackgroundMessageHandler(async msg => {
        console.log('--- Background message received (setBackgroundMessageHandler) ---');
        console.log('Message:', JSON.stringify(msg, null, 2));

        const title: any = msg.notification?.title || msg.data?.title;
        const body: any = msg.notification?.body || msg.data?.body;

        try {
            await displayNotificationWithTruckSound(title, body, msg.data);
        } catch (displayError) {
            console.error('Error displaying background notification:', displayError);
        }

        console.log('----------------------------------------------------');
    });

    messaging().onNotificationOpenedApp(msg => {
        console.log('Message:', JSON.stringify(msg, null, 2));
        notificationShown = false;
        // You can add navigation logic here based on msg.data
        console.log('-------------------------------------------------------------------');
    });

    messaging()
        .getInitialNotification()
        .then(msg => {
            if (msg) {
                console.log('--- App launched from quit by tapping notification (getInitialNotification) ---');
                console.log('Message:', JSON.stringify(msg, null, 2));
                notificationShown = false;
                // You can add navigation logic here based on msg.data
                console.log('---------------------------------------------------------------------');
            } else {
                console.log('No initial notification found (app launched normally).');
            }
        });

    notifee.onForegroundEvent(({ type, detail }) => {
        console.log('--- Notifee Foreground Event ---');
        console.log('Event Type:', type);
        console.log('Detail:', JSON.stringify(detail, null, 2));
        // if (type === notifee.EventType.PRESS) {
        //     console.log('User pressed Notifee notification in foreground.');
        // } else if (type === notifee.EventType.DISMISSED) {
        //     console.log('User dismissed Notifee notification in foreground.');
        // }
        console.log('-------------------------------');
    });

    notifee.onBackgroundEvent(async ({ type, detail }) => {
        console.log('--- Notifee Background Event ---');
        console.log('Event Type:', type);
        console.log('Detail:', JSON.stringify(detail, null, 2));
        // if (type === notifee.EventType.PRESS) {
        //     console.log('User pressed Notifee notification in background/quit.');
        // } else if (type === notifee.EventType.DISMISSED) {
        //     console.log('User dismissed Notifee notification in background/quit.');
        // }
        console.log('-------------------------------');
        return Promise.resolve();
    });
};

// Add method to manually reset the notification flag if needed
export const resetNotificationFlag = () => {
    notificationShown = false;
};
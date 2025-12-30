// zegoService.ts
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
import { navigationRef } from '../global/global.ref';

const ZEGO_APP_ID = 1806378884;
const ZEGO_APP_SIGN = '7e66a8d4611b0f8a910c0dea7146e7e967d4b10209cf845cf4d5c8d177ed62b0';

export interface ZegoLoginParams {
  userID: string;
  userName: string;
}

export const initializeZeegoService = async ({
  userID,
  userName,
}: ZegoLoginParams): Promise<void> => {
  try {
    await ZegoUIKitPrebuiltCallService.init(
      ZEGO_APP_ID,
      ZEGO_APP_SIGN,
      userID,
      userName,
      [ZIM, ZPNs],
      {
        ringtoneConfig: {
          incomingCallFileName: 'zego_incoming.mp3',
          outgoingCallFileName: 'zego_outgoing.mp3',
        },
        androidNotificationConfig: {
          channelID: 'ZegoUIKit',
          channelName: 'ZegoUIKit',
        },
      }
    );

    // 🔔 Ask for "Appear on top" permission
    ZegoUIKitPrebuiltCallService.requestSystemAlertWindow({
      message:
        'We need this permission so incoming calls can appear on top of other apps.',
      allow: 'Allow',
      deny: 'Deny',
    });

    console.log('✅ Zego Call Service initialized');
  } catch (error) {
    console.error('❌ Zego init failed:', error);
  }
};

export const startVideoCall = () => {
  const invitees = [
    {
      userID: 'TM2512UPDR23435',
      userName: 'Abhishek',
    },
  ];

  ZegoUIKitPrebuiltCallService.sendCallInvitation(
    invitees,           // 1️⃣ invitees
    true,               // 2️⃣ isVideoCall
    navigationRef,      // 3️⃣ navigation
    {
      resourceID: 'TruckMitr', // 4️⃣ options
    }
  );
};

export const onUserLogout = async () => {
  return ZegoUIKitPrebuiltCallService.uninit()
}
import { DeviceEventEmitter } from 'react-native';

// Event types
export const AUTH_EVENTS = {
  TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  LOGOUT: 'AUTH_LOGOUT',
};

// Helper function to emit token expiration
export const emitTokenExpired = () => {
  console.log('🔴 Emitting TOKEN_EXPIRED event');
  DeviceEventEmitter.emit(AUTH_EVENTS.TOKEN_EXPIRED);
};

// Helper function to emit logout
export const emitLogout = () => {
  console.log('🔴 Emitting LOGOUT event');
  DeviceEventEmitter.emit(AUTH_EVENTS.LOGOUT);
};

// Helper function to listen for token expiration
export const onTokenExpired = (callback: () => void) => {
  return DeviceEventEmitter.addListener(AUTH_EVENTS.TOKEN_EXPIRED, callback);
};

// Helper function to listen for logout
export const onLogout = (callback: () => void) => {
  return DeviceEventEmitter.addListener(AUTH_EVENTS.LOGOUT, callback);
};

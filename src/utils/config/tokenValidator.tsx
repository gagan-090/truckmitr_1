import { getUserData, deleteUserData } from './token';
import axiosInstance from './axiosInstance';
import { END_POINTS } from './index';

/**
 * Validates if the current token is still valid by making a profile request
 * @returns {Promise<boolean>} true if token is valid, false otherwise
 */
export const validateToken = async (): Promise<boolean> => {
  try {
    const token = await getUserData();
    
    if (!token) {
      return false;
    }

    const response: any = await axiosInstance.get(END_POINTS?.GET_PROFILE, {
      headers: {
        'X-Skip-Global-Logout': 'true'
      }
    });
    
    // Check if response indicates valid authentication
    if (response?.data?.status && response?.status === 200) {
      return true;
    }
    
    // If we get 401 or 403, token is invalid
    if (response?.status === 401 || response?.status === 403) {
      await deleteUserData();
      return false;
    }
    
    // For network errors or timeouts, assume token is still valid
    // Don't invalidate token just because of network issues
    return true;
  } catch (error: any) {
    console.error('Token validation error:', error);
    // If it's an auth error, token is invalid
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      await deleteUserData();
      return false;
    }
    // For network/timeout errors, assume token is still valid
    // Better to keep user logged in than logout due to network issues
    return true;
  }
};

/**
 * Checks if token exists in storage
 * @returns {Promise<boolean>} true if token exists, false otherwise
 */
export const hasToken = async (): Promise<boolean> => {
  const token = await getUserData();
  return !!token;
};

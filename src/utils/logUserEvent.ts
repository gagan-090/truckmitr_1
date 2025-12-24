import axiosInstance from './config/axiosInstance';
import { END_POINTS } from './config';
import { getUserData } from './config/token';

export const logUserEventBackend = async (eventType: string, description: string, userId?: string) => {
  try {
    const token = await getUserData();
    if (token) {
      const payload = { 
        event_type: eventType, 
        description,
        user_id: userId || 'unknown'
      };
      const response = await axiosInstance.post(END_POINTS.LOG_USER_EVENT, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('✅ Event logged:', payload, 'Response:', response.data);
    } else {
      console.log('⚠️ No user token found. Skipping backend log.');
    }
  } catch (error: any) {
    console.error('❌ Error logging event:', error.response?.data || error.message);
  }
};

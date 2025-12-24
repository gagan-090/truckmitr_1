// storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveUserData = async (token: string) => {
    try {
        await AsyncStorage.setItem('@user_token', token);
        console.log(`User data saved successfully. Token length: ${token.length}`);
    } catch (error) {
        console.log('Error saving data to AsyncStorage:', error);
    }
};

export const getUserData = async (): Promise<string | null> => {
    try {
        const token = await AsyncStorage.getItem('@user_token');
        return token;
    } catch (error) {
        console.log('Error retrieving data from AsyncStorage:', error);
        return null;
    }
};

export const deleteUserData = async () => {
    try {
        await AsyncStorage.removeItem('@user_token');
        await AsyncStorage.removeItem('subscription_modal_closed_count');
        console.log('User token deleted successfully.');
    } catch (error) {
        console.log('Error deleting data from AsyncStorage:', error);
    }
};
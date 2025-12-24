import Toast from 'react-native-simple-toast';

const useToast = () => {
    const showToast = (message: string) => {
        if (message) {
            Toast.show(message, Toast.SHORT);
        }
    };
    return showToast;
};

export const showToast = (message: string,) => {
    if (message) {
        Toast.show(message, Toast.SHORT);
    }
};

export default useToast;

import { StyleSheet, ViewStyle } from 'react-native';
import { useColor } from '@truckmitr/hooks/colors';
import { isIOS } from '@truckmitr/functions/index';

interface Styles {
    shadow: ViewStyle;
}

const useShadow = (): Styles => {
    const colors = useColor();

    return StyleSheet.create({
        shadow: {
            shadowColor: colors.blackOpacity(isIOS() ? .1 : .2),
            shadowOffset: { width: 2, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 14,
            elevation: 20
        },

    });
};

export default useShadow;

import { IMAGES } from '@truckmitr/src/res/images';
import React from 'react';
import {
    View,
    Image,
    ActivityIndicator,
    Text,
    StyleSheet,
} from 'react-native';
import { useResponsiveScale } from '../hooks';

type Props = {
    visible?: boolean;
    message?: string;
};

const FullScreenLoader: React.FC<Props> = ({ visible = true, message = 'Loading...', }) => {
    const { responsiveHeight, responsiveWidth, responsiveFontSize } = useResponsiveScale();
    if (!visible) return null;

    return (
        <View style={styles.container}>
            {/* TruckMitr Logo */}
            <Image
                source={IMAGES.TRUCKMITR_HORIZONTAL}
                style={{
                    height: responsiveHeight(15),
                    width: responsiveWidth(60),
                }}
                resizeMode="contain"
            />

            {/* Loader */}
            <ActivityIndicator size="large" color="#0C78F0" />

            {/* Optional Text */}
            {message ? <Text style={styles.text}>{message}</Text> : null}
        </View>
    );
};

export default FullScreenLoader;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        color: '#555',
        fontWeight: '500',
    },
});

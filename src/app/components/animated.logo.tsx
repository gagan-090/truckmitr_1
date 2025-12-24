import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, ImageStyle } from 'react-native';
import { useImage, useResponsiveScale } from '@ollnine/hooks/index';
import { useFocusEffect } from '@react-navigation/native';

interface AnimatedLogoProps {
    width?: number;
    height?: number;
    style?: ImageStyle; // Use ImageStyle specifically to avoid conflicts
    duration?: number
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ width, height, style, duration }) => {
    const images = useImage();
    const { responsiveHeight, responsiveFontSize } = useResponsiveScale();
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // Function to start the rotation animation
    const startRotation = () => {
        rotateAnim.setValue(0); // Reset the rotation
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: duration || 2000, // Duration of one full rotation in milliseconds
                easing: Easing.linear, // Use linear easing for smooth rotation
                useNativeDriver: true, // Use native driver for better performance
            })
        ).start();
    };

    // Use focus effect to start the animation based on screen focus
    useFocusEffect(
        React.useCallback(() => {
            startRotation(); // Start animation on focus

            // Return a cleanup function that does nothing since we can't stop a loop
            return () => {
                // You could reset the rotation value if needed
                rotateAnim.setValue(0);
            };
        }, [])
    );

    // Interpolate the rotateAnim value to create a rotation
    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    // Apply the interpolation to the transform style
    const animatedStyle = {
        transform: [{ rotate: rotateInterpolate }],
    };

    return (
        <Animated.Image
            source={images.TRANSPARENT_LOGO}
            style={[
                {
                    height: height || responsiveHeight(5),
                    width: width || responsiveHeight(5),
                    left: responsiveFontSize(0),
                },
                animatedStyle,
                style,
            ]}
        />
    );
};

export default memo(AnimatedLogo);

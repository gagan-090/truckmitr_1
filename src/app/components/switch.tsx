import React from 'react';
import {
    Pressable,
    StyleSheet,
} from 'react-native';
import Animated, {
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useColor } from '../hooks';

export const Switch = ({
    value,
    onPress,
    style,
    duration = 400,
    trackColors = { on: '#82cab2', off: '#fa7f7c' },
}: any) => {
    const colors = useColor();
    const height = useSharedValue(0);
    const width = useSharedValue(0);
    const animatedValue = useSharedValue(value ? 1 : 0);

    // Update animated value on prop change
    React.useEffect(() => {
        animatedValue.value = withTiming(value ? 1 : 0, { duration });
    }, [value]);

    const trackAnimatedStyle = useAnimatedStyle(() => {
        const color = interpolateColor(
            animatedValue.value,
            [0, 1],
            [trackColors.off, trackColors.on]
        );

        return {
            backgroundColor: color,
            borderRadius: height.value / 2,
        };
    });

    const thumbAnimatedStyle = useAnimatedStyle(() => {
        const moveValue = interpolate(
            animatedValue.value,
            [0, 1],
            [0, width.value - height.value]
        );

        return {
            transform: [{ translateX: moveValue }],
            borderRadius: height.value / 2,
        };
    });

    return (
        <Pressable onPress={onPress} style={{ backgroundColor: colors.transparent, borderRadius: 100, overflow: 'hidden' }}>
            <Animated.View
                onLayout={(e) => {
                    height.value = e.nativeEvent.layout.height;
                    width.value = e.nativeEvent.layout.width;
                }}
                style={[switchStyles.track, style, trackAnimatedStyle]}>
                <Animated.View
                    style={[switchStyles.thumb, thumbAnimatedStyle]}></Animated.View>
            </Animated.View>
        </Pressable>
    );
};

const switchStyles = StyleSheet.create({
    track: {
        alignItems: 'flex-start',
        width: 100,
        height: 40,
        padding: 5,
    },
    thumb: {
        height: '100%',
        aspectRatio: 1,
        backgroundColor: 'white',
    },
});


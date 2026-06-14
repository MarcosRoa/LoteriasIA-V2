import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';

interface Props {
    number: number;
    color?: string;
    delay?: number;
}

export const NumberBall: React.FC<Props> = ({ number, color = '#8b5cf6', delay = 0 }) => {
    const scale = useSharedValue(0);
    const rotate = useSharedValue(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            scale.value = withSpring(1, { damping: 10, stiffness: 100 });
            rotate.value = withSequence(
                withTiming(360, { duration: 400, easing: Easing.linear }),
                withTiming(0, { duration: 0 })
            );
        }, delay);
        return () => clearTimeout(timer);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
    }));

    return (
        <Animated.View style={[styles.ball, { backgroundColor: `${color}20`, borderColor: color }, animatedStyle]}>
            <Text style={[styles.number, { color }]}>{String(number).padStart(2, '0')}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    ball: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    number: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

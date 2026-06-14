import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

interface Props {
    size?: number;
    onComplete?: () => void;
}

export const TransformerLogo: React.FC<Props> = ({ size = 100, onComplete }) => {
    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);
    const soundRef = useRef<Audio.Sound>(null);

    const startTransform = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            Vibration.vibrate([100, 200, 100]);
            
            const { sound } = await Audio.Sound.createAsync(
                require('../../assets/sounds/transform-spin.mp3')
            );
            soundRef.current = sound;
            await sound.playAsync();
            
            scale.value = withSequence(
                withTiming(1.3, { duration: 300, easing: Easing.out(Easing.exp) }),
                withSpring(1, { damping: 10, stiffness: 100 })
            );
            
            rotate.value = withSequence(
                withTiming(360, { duration: 600, easing: Easing.linear }),
                withTiming(0, { duration: 0 })
            );
            
            setTimeout(() => {
                onComplete?.();
            }, 600);
            
        } catch (error) {
            console.error('Erro no efeito:', error);
            onComplete?.();
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
    }));

    return (
        <TouchableOpacity onPress={startTransform} activeOpacity={0.8}>
            <Animated.View style={[animatedStyle]}>
                <LottieView
                    source={require('../../assets/animations/transformer-splash.json')}
                    style={{ width: size, height: size }}
                    autoPlay={false}
                    loop={false}
                />
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({});

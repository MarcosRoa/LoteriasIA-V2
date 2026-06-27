// src/components/TransformerSplash.tsx 27/06/2026
// src/components/TransformerSplash.tsx
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface Props {
    onFinish: () => void;
    minDuration?: number;
}

export default function TransformerSplash({ onFinish, minDuration = 7000 }: Props) {
    const videoRef = useRef<Video>(null);
    const [videoFinished, setVideoFinished] = useState(false);
    const startTime = useRef(Date.now());
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handlePlaybackStatusUpdate = (status: any) => {
        console.log('🎬 Status do vídeo:', status);
        
        if (status.didJustFinish) {
            console.log('🎬 Vídeo terminou!');
            setVideoFinished(true);
            finishSplash();
        }
    };

    const finishSplash = () => {
        const elapsed = Date.now() - startTime.current;
        const remaining = minDuration - elapsed;

        console.log('🎬 Tempo decorrido:', elapsed, 'ms');
        console.log('🎬 Tempo restante:', remaining, 'ms');

        if (remaining <= 0) {
            console.log('🎬 Finalizando splash (tempo mínimo atingido)');
            onFinish();
        } else {
            console.log('🎬 Aguardando tempo mínimo...');
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                console.log('🎬 Finalizando splash (tempo mínimo completo)');
                onFinish();
            }, remaining);
        }
    };

    useEffect(() => {
        // Força o fim após o tempo mínimo + 2s (segurança)
        const timeout = setTimeout(() => {
            if (!videoFinished) {
                console.log('🎬 Forçando finalização do splash (timeout)');
                onFinish();
            }
        }, minDuration + 2000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <View style={styles.container}>
            <Video
                ref={videoRef}
                source={require('../../assets/videos/abertura.mp4')}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping={false}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: width,
        height: height,
    },
});

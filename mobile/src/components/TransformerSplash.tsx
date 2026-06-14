import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Props {
    onFinish: () => void;
    duration?: number;
}

export default function TransformerSplash({ onFinish, duration = 2000 }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, duration);
        
        return () => clearTimeout(timer);
    }, [onFinish, duration]);

    // Verificar se a imagem existe
    let imageSource;
    try {
        imageSource = require('../../assets/images/logo.png');
    } catch (e) {
        console.log('Imagem não encontrada, usando fallback');
        imageSource = null;
    }

    return (
        <View style={styles.container}>
            {imageSource ? (
                <Image
                    source={imageSource}
                    style={styles.logo}
                    resizeMode="contain"
                />
            ) : (
                <View style={styles.fallback}>
                    <Text style={styles.emoji}>🎰</Text>
                    <Text style={styles.text}>Loterias IA</Text>
                </View>
            )}
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
    logo: {
        width: width * 0.7,
        height: height * 0.3,
    },
    fallback: {
        alignItems: 'center',
    },
    emoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    text: {
        fontSize: 24,
        color: '#ffffff',
        fontWeight: 'bold',
    },
});
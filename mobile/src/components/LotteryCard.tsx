import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LotteryConfig } from '../constants/lotteries';

interface Props {
    lottery: LotteryConfig;
    onPress: () => void;
}

export const LotteryCard: React.FC<Props> = ({ lottery, onPress }) => {
    return (
        <TouchableOpacity
            style={[styles.card, { borderColor: lottery.cor }]}
            onPress={onPress}
        >
            <Text style={styles.icon}>{lottery.icone}</Text>
            <Text style={styles.name}>{lottery.nome}</Text>
            <Text style={styles.rules}>
                {lottery.numeros} números • 1 a {lottery.maxNumero}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        margin: 6,
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
    },
    icon: {
        fontSize: 32,
        marginBottom: 8,
    },
    name: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
    rules: {
        color: '#94a3b8',
        fontSize: 10,
        textAlign: 'center',
    },
});

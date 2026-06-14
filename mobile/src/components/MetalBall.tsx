import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';

interface MetalBallProps {
  number: number;
  size?: number;
}

export default function MetalBall({
  number,
  size = 70,
}: MetalBallProps) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <Image
        source={require('../../assets/images/ball-gold.png')}
        style={{
          width: size,
          height: size,
        }}
        resizeMode="cover"
      />

      <View style={styles.numberContainer}>
        <Text style={styles.number}>
          {number}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  numberContainer: {
    position: 'absolute',

    justifyContent: 'center',
    alignItems: 'center',
  },

  number: {
    fontSize: 22,
    fontWeight: '900',

    color: '#1f1a12',

    textShadowColor: 'rgba(255,255,255,0.25)',
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 2,
  },
});
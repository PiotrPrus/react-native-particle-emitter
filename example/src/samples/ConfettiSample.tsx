import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { MultiEmitter } from 'react-native-particle-emitter';
import { ActionButton } from '../ui';

/**
 * Port of ConfettiSample.kt — two element-particle MultiEmitters over a
 * dark rounded card: shopping-bag emoji that shrink away, and glowing stars
 * that pulse and animate green → red. Reset replays the burst.
 */
export default function ConfettiSample() {
  const [run, setRun] = useState(0);
  const [visible, setVisible] = useState(true);

  const reset = () => {
    setVisible(false);
    setTimeout(() => {
      setRun((n) => n + 1);
      setVisible(true);
    }, 100);
  };

  return (
    <View style={styles.root}>
      <View style={styles.card} />
      {visible && (
        <View style={styles.emitterArea}>
          <MultiEmitter
            key={`bags-${run}`}
            style={StyleSheet.absoluteFill}
            emitterCount={12}
            emitterDelay={150}
            emitterConfig={{
              particlesCount: 1,
              emitDurationMillis: 0,
              particleLifespanMillis: 3000,
              initialForce: 140,
              gravityStrength: 0.2,
              spread: [-30, 30],
              rotationMultiplier: 0,
              randomStartPoint: true,
            }}
          >
            <ShrinkingEmoji />
          </MultiEmitter>
          <MultiEmitter
            key={`stars-${run}`}
            style={StyleSheet.absoluteFill}
            emitterCount={15}
            emitterDelay={200}
            emitterConfig={{
              particlesCount: 10,
              emitDurationMillis: 200,
              particleLifespanMillis: 2000,
              initialForce: 80,
              gravityStrength: 0.1,
              spread: [-180, 180],
              rotationMultiplier: 1,
              randomStartPoint: true,
            }}
          >
            <GlowingStar />
          </MultiEmitter>
        </View>
      )}
      <View style={styles.resetRow}>
        <ActionButton label="Reset" onPress={reset} />
      </View>
    </View>
  );
}

/** 🛍️ emoji scaling and fading to zero over 3 s, like the Compose Animatable. */
function ShrinkingEmoji() {
  const progress = useSharedValue(1);
  useEffect(() => {
    progress.value = withTiming(0, { duration: 3000 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));
  return (
    <Animated.View style={style}>
      <Text style={{ fontSize: 30 }}>🛍️</Text>
    </Animated.View>
  );
}

/** Pulsing star that animates green → red while shrinking away over 2 s. */
function GlowingStar() {
  const life = useSharedValue(0); // 0 → 1 over the particle lifetime
  const glow = useSharedValue(0); // fast pulse, mirrored
  useEffect(() => {
    life.value = withTiming(1, { duration: 2000, easing: Easing.linear });
    glow.value = withRepeat(withTiming(1, { duration: 300 }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => {
    const color = interpolateColor(life.value, [0, 1], ['#34c759', '#ff3b30']);
    const fade = 1 - life.value;
    return {
      opacity: fade,
      transform: [{ scale: fade * (0.8 + 0.4 * glow.value) }],
      color,
      textShadowColor: color,
      textShadowRadius: 8 + 10 * glow.value,
    };
  });
  return <Animated.Text style={[{ fontSize: 14 }, style]}>★</Animated.Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    width: 300,
    height: 300,
    borderRadius: 30,
    backgroundColor: '#2c2c38',
  },
  emitterArea: {
    pointerEvents: 'none' as const,
    position: 'absolute',
    width: 300,
    height: 100,
    alignSelf: 'center',
  },
  resetRow: { position: 'absolute', bottom: 24, alignSelf: 'center' },
});

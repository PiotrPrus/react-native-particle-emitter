import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ParticlesEmitter } from 'react-particle-emitter';

/**
 * Port of GlowSample.kt — element particles drifting slowly from the center,
 * each a glowing orb whose halo pulses and whose color breathes between
 * white and red (two emitters with opposite color phases).
 */
export default function GlowSample() {
  return (
    <View style={styles.root}>
      <ParticlesEmitter
        style={StyleSheet.absoluteFill}
        config={{
          particlesCount: 100,
          emitDurationMillis: 20000,
          particleLifespanMillis: 5000,
          initialForce: 40,
          gravityStrength: 0,
          spread: [-180, 180],
          maxHorizontalDisplacement: 100,
          rotationMultiplier: 0.5,
          randomStartPoint: false,
        }}
      >
        <GlowOrb from="#ffffff" to="#ff3b30" />
      </ParticlesEmitter>
      <ParticlesEmitter
        style={StyleSheet.absoluteFill}
        config={{
          particlesCount: 20,
          emitDurationMillis: 20000,
          particleLifespanMillis: 5000,
          initialForce: 100,
          gravityStrength: 0,
          spread: [-180, 180],
          maxHorizontalDisplacement: 100,
          rotationMultiplier: 0.5,
          randomStartPoint: false,
        }}
      >
        <GlowOrb from="#ff3b30" to="#ffffff" />
      </ParticlesEmitter>
    </View>
  );
}

function GlowOrb({ from, to }: { from: string; to: string }) {
  const phase = useSharedValue(0);
  useEffect(() => {
    phase.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const haloStyle = useAnimatedStyle(() => {
    const color = interpolateColor(phase.value, [0, 1], [from, to]);
    const glow = 0.5 + 0.5 * phase.value;
    return {
      backgroundColor: color,
      opacity: 0.35,
      transform: [{ scale: glow }],
      boxShadow: `0 0 ${10 + 14 * glow}px ${6 * glow}px ${color}`,
    };
  });
  const coreStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(phase.value, [0, 1], [from, to]),
  }));

  return (
    <View style={styles.orb}>
      <Animated.View style={[styles.halo, haloStyle]} />
      <Animated.View style={[styles.core, coreStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1f1f29' },
  orb: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 30, height: 30, borderRadius: 15 },
  core: { width: 8, height: 8, borderRadius: 4 },
});

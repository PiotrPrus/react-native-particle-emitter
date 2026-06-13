import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { useImage } from '@shopify/react-native-skia';
import { CanvasParticleEmitter, easeOutCubic } from 'react-native-particle-emitter';
import type { CanvasEmitterConfig } from 'react-native-particle-emitter';
import { ControlPanel, LabeledSlider, MeasuredView, theme } from '../ui';

/**
 * Port of GravityPointSample.kt — a draggable gravity attractor. The gravity
 * vector (angle + strength) is recomputed from the emitter center to the
 * attractor position; farther attractor = stronger pull.
 */
export default function GravityPointSample() {
  const star = useImage(require('../../assets/star_four.png'));
  const [force, setForce] = useState(120);

  return (
    <MeasuredView>
      {(size) => (
        <GravityPointInner size={size} star={star} force={force} setForce={setForce} />
      )}
    </MeasuredView>
  );
}

function GravityPointInner({
  size,
  star,
  force,
  setForce,
}: {
  size: { width: number; height: number };
  star: ReturnType<typeof useImage>;
  force: number;
  setForce: (v: number) => void;
}) {
  const emitter = { x: size.width / 2, y: size.height / 2 };
  const [gravityPoint, setGravityPoint] = useState({
    x: size.width / 2,
    y: size.height * 0.3,
  });
  const dragStart = useRef(gravityPoint);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStart.current = gravityPointRef.current;
      },
      onPanResponderMove: (_evt, gesture) => {
        setGravityPoint({
          x: Math.min(Math.max(dragStart.current.x + gesture.dx, 0), size.width),
          y: Math.min(Math.max(dragStart.current.y + gesture.dy, 0), size.height),
        });
      },
    })
  ).current;
  // Keep a ref in sync so the long-lived PanResponder sees fresh positions.
  const gravityPointRef = useRef(gravityPoint);
  gravityPointRef.current = gravityPoint;

  // atan2(-dx, dy) maps: down=0, left=90, right=-90, up=180 (same as Compose).
  const dx = gravityPoint.x - emitter.x;
  const dy = gravityPoint.y - emitter.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const gravityAngle = Math.round((Math.atan2(-dx, dy) * 180) / Math.PI);
  const maxDistance = Math.sqrt(size.width * size.width + size.height * size.height);
  const gravityStrength = maxDistance > 0 ? (distance / maxDistance) * 300 : 0;

  const config: CanvasEmitterConfig | null = useMemo(() => {
    if (!star) return null;
    return {
      particlePerSecond: 60,
      emitterCenter: emitter,
      particleShapes: [{ type: 'circle' }, { type: 'image', image: star, tint: true }],
      lifespanRange: [3000, 5000],
      colors: ['#FF9A56', '#FF6B6B', '#FFE66D', '#FF4E8A', '#FFA726'],
      scaleEasing: easeOutCubic,
      particleSizes: [
        { width: 5, height: 5 },
        { width: 8, height: 8 },
        { width: 12, height: 12 },
      ],
      initialForce: [Math.round(force), Math.round(force * 1.3)],
      spread: [-45, 45],
      fadeOutTime: [2000, 3500],
      rotationRange: [-180, 180],
      scaleTime: [500, 1000],
      targetScaleRange: [0, 1],
      startScaleRange: [1, 3],
      gravityStrength,
      gravityAngle,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [star, force, gravityStrength, gravityAngle, emitter.x, emitter.y]);

  return (
    <View style={{ flex: 1 }}>
      {config && <CanvasParticleEmitter style={StyleSheet.absoluteFill} config={config} />}

      {/* Emitter source indicator */}
      <View
        style={[styles.source, { left: emitter.x - 8, top: emitter.y - 8 }]}
      />

      {/* Draggable gravity point */}
      <View
        style={[styles.attractor, { left: gravityPoint.x - 20, top: gravityPoint.y - 20 }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.attractorDot} />
      </View>

      <ControlPanel>
        <Text style={styles.hint}>Drag the circle to move the gravity point</Text>
        <Text style={styles.info}>
          Angle: {gravityAngle}°{'  '}Strength: {Math.round(gravityStrength)}
        </Text>
        <LabeledSlider
          label={`Initial force: ${Math.round(force)}`}
          value={force}
          min={20}
          max={400}
          onChange={setForce}
        />
      </ControlPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  source: {
    pointerEvents: 'none' as const,
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  attractor: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255,107,107,0.27)',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
  } as object,
  attractorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  hint: { color: theme.textDim, fontSize: 12 },
  info: { color: theme.text, fontSize: 13, marginBottom: 4 },
});

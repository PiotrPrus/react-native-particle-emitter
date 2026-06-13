import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { Canvas, Group, Path, Rect } from '@shopify/react-native-skia';
import { CanvasParticleEmitter, easeOutCubic } from 'react-native-particle-emitter';
import type { CanvasEmitterConfig, ParticleShape } from 'react-native-particle-emitter';
import { buildStarPath } from '../shapes';
import { ControlPanel, LabeledSlider, MeasuredView, theme } from '../ui';

const WAND_GOLD = '#FFC93C';
const STICK_BROWN = '#6B4A2B';
const MAGIC_COLORS = ['#FFFFFF', '#FFE066', '#FFC93C', '#B3E0FF'];
const MOVE_DEBOUNCE_MS = 120;
const STICK_TILT_DEG = 25;
const WAND_BOX = 160; // overlay canvas side; wand tip sits at its center

/**
 * Port of MagicWandSample.kt — drag the wand to leave a sparkling star
 * trail. While moving, the emission rate is multiplied; sliders control base
 * rate, particle lifespan, and the moving multiplier.
 */
export default function MagicWandSample() {
  const [baseRate, setBaseRate] = useState(25);
  const [lifespan, setLifespan] = useState(900);
  const [multiplier, setMultiplier] = useState(5);

  return (
    <MeasuredView>
      {(size) => (
        <WandInner
          size={size}
          baseRate={baseRate}
          setBaseRate={setBaseRate}
          lifespan={lifespan}
          setLifespan={setLifespan}
          multiplier={multiplier}
          setMultiplier={setMultiplier}
        />
      )}
    </MeasuredView>
  );
}

function WandInner({
  size,
  baseRate,
  setBaseRate,
  lifespan,
  setLifespan,
  multiplier,
  setMultiplier,
}: {
  size: { width: number; height: number };
  baseRate: number;
  setBaseRate: (v: number) => void;
  lifespan: number;
  setLifespan: (v: number) => void;
  multiplier: number;
  setMultiplier: (v: number) => void;
}) {
  const [wand, setWand] = useState({ x: size.width / 2, y: size.height / 2 });
  const [isMoving, setIsMoving] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (moveTimer.current) clearTimeout(moveTimer.current);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      // Claim a gesture that BEGINS on the stage, but don't grab an
      // in-progress one — otherwise this full-stage layer steals slider/
      // button drags happening in the control panel above it.
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderGrant: (evt) => {
        setHintVisible(false);
        moveWand(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
      onPanResponderMove: (evt) => {
        moveWand(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
    })
  ).current;

  const sizeRef = useRef(size);
  sizeRef.current = size;
  const moveWand = (x: number, y: number) => {
    setWand({
      x: Math.min(Math.max(x, 0), sizeRef.current.width),
      y: Math.min(Math.max(y, 0), sizeRef.current.height),
    });
    setIsMoving(true);
    if (moveTimer.current) clearTimeout(moveTimer.current);
    moveTimer.current = setTimeout(() => setIsMoving(false), MOVE_DEBOUNCE_MS);
  };

  const starShapes: ParticleShape[] = useMemo(
    () =>
      [8, 11, 14].map((d) => ({ type: 'path' as const, path: buildStarPath(d / 2) })),
    []
  );
  const wandTipPath = useMemo(() => buildStarPath(14), []);

  const baseRateInt = Math.round(baseRate);
  const rate = isMoving ? Math.round(baseRateInt * multiplier) : baseRateInt;
  const lifespanMax = Math.round(lifespan);
  const lifespanMin = Math.max(Math.round(lifespanMax * 0.7), 50);

  const config: CanvasEmitterConfig = useMemo(
    () => ({
      particlePerSecond: rate,
      emitterCenter: wand,
      particleShapes: starShapes,
      lifespanRange: [lifespanMin, lifespanMax],
      fadeOutTime: [
        Math.max(Math.round(lifespanMin * 0.6), 50),
        Math.max(Math.round(lifespanMax * 0.6), 50),
      ],
      scaleTime: [lifespanMin, lifespanMax],
      colors: MAGIC_COLORS,
      particleSizes: [
        { width: 8, height: 8 },
        { width: 11, height: 11 },
        { width: 14, height: 14 },
      ],
      spread: [0, 360],
      scaleEasing: easeOutCubic,
      alphaEasing: easeOutCubic,
      initialForce: [30, 50],
      startScaleRange: [1, 1],
      targetScaleRange: [0, 0],
      rotationRange: [-120, 120],
      gravityStrength: 0,
    }),
    [rate, wand.x, wand.y, starShapes, lifespanMin, lifespanMax] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <View style={{ flex: 1 }}>
      <CanvasParticleEmitter style={StyleSheet.absoluteFill} config={config} />

      {/* Wand: gold star tip at the touch point, tilted brown stick below. */}
      {/* Skia's Canvas (web) requires a plain style object, not an array */}
      <Canvas
        style={StyleSheet.flatten([
          styles.wand,
          { left: wand.x - WAND_BOX / 2, top: wand.y - WAND_BOX / 2 },
        ])}
      >
        <Group
          transform={[{ rotate: (STICK_TILT_DEG * Math.PI) / 180 }]}
          origin={{ x: WAND_BOX / 2, y: WAND_BOX / 2 }}
        >
          <Rect
            x={WAND_BOX / 2 - 2}
            y={WAND_BOX / 2}
            width={4}
            height={80}
            color={STICK_BROWN}
          />
        </Group>
        <Group transform={[{ translateX: WAND_BOX / 2 }, { translateY: WAND_BOX / 2 }]}>
          <Path path={wandTipPath} color={WAND_GOLD} />
        </Group>
      </Canvas>

      {/* Drag capture layer */}
      <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />

      {hintVisible && <Text style={styles.hint}>drag the wand</Text>}

      <ControlPanel>
        <LabeledSlider
          label={`Base rate: ${baseRateInt}/s`}
          value={baseRate}
          min={1}
          max={50}
          onChange={setBaseRate}
        />
        <LabeledSlider
          label={`Lifespan: ${lifespanMax}ms`}
          value={lifespan}
          min={200}
          max={3000}
          onChange={setLifespan}
        />
        <LabeledSlider
          label={`Multiplier: ${Math.round(multiplier)}×`}
          value={multiplier}
          min={1}
          max={10}
          step={1}
          onChange={setMultiplier}
        />
      </ControlPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  wand: {
    pointerEvents: 'none' as const,
    position: 'absolute',
    width: WAND_BOX,
    height: WAND_BOX,
  },
  hint: {
    position: 'absolute',
    top: 32,
    alignSelf: 'center',
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

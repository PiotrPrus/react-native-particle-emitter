import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { matchFont } from '@shopify/react-native-skia';
import { CanvasParticleEmitter } from 'react-native-particle-emitter';
import type { CanvasEmitterConfig, ParticleShape } from 'react-native-particle-emitter';
import { rasterizeEmoji } from '../shapes';
import { ActionButton, ControlPanel, LabeledSlider, MeasuredView, theme } from '../ui';

const EMOJI_SET = ['🎁', '🎉', '🥳', '🎊'];
const BURST_RATE = 80;
const BURST_DURATION_MS = 3000;
const RAIN_ENDED_VISIBLE_MS = 2000;

/**
 * Port of EmojiRainSample.kt — fullscreen emoji rain from a horizontal line
 * at the top, with a rate slider and a 3-second burst button.
 *
 * On web the emoji are rasterized through a DOM canvas (CanvasKit has no
 * emoji font); on native they use Skia text shapes via `matchFont`.
 */
export default function EmojiRainSample() {
  const [sliderRate, setSliderRate] = useState(30);
  const [isBursting, setIsBursting] = useState(false);
  const [showRainEnded, setShowRainEnded] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const emojiShapes: ParticleShape[] = useMemo(() => {
    if (Platform.OS === 'web') {
      return EMOJI_SET.flatMap((emoji) => {
        const image = rasterizeEmoji(emoji, 28);
        return image ? [{ type: 'image' as const, image, tint: false }] : [];
      });
    }
    const font = matchFont({ fontSize: 28 });
    return EMOJI_SET.map((emoji) => ({ type: 'text' as const, text: emoji, font }));
  }, []);

  const startBurst = () => {
    setIsBursting(true);
    timers.current.push(
      setTimeout(() => {
        setIsBursting(false);
        setShowRainEnded(true);
        timers.current.push(
          setTimeout(() => setShowRainEnded(false), RAIN_ENDED_VISIBLE_MS)
        );
      }, BURST_DURATION_MS)
    );
  };

  const rate = isBursting ? BURST_RATE : Math.round(sliderRate);

  return (
    <MeasuredView>
      {({ width }) => {
        const config: CanvasEmitterConfig = {
          particlePerSecond: rate,
          emitterCenter: { x: width / 2, y: 0 },
          startRegionShape: 'h-line',
          startRegionSize: { width, height: 20 },
          particleShapes: emojiShapes,
          lifespanRange: [3000, 5000],
          fadeOutTime: [100000, 100000],
          scaleTime: [500, 1000],
          colors: ['#ffffff'],
          particleSizes: [{ width: 28, height: 28 }],
          spread: [165, 195],
          initialForce: [60, 140],
          rotationRange: [-60, 30],
          startScaleRange: [1, 1],
          targetScaleRange: [1, 1],
          gravityStrength: 250,
          gravityAngle: 0,
        };
        return (
          <View style={{ flex: 1 }}>
            {emojiShapes.length > 0 && (
              <CanvasParticleEmitter style={StyleSheet.absoluteFill} config={config} />
            )}
            {showRainEnded && <Text style={styles.banner}>Rain ended</Text>}
            <ControlPanel>
              <LabeledSlider
                label={
                  isBursting
                    ? `Bursting: ${BURST_RATE}/s`
                    : `Particles/sec: ${Math.round(sliderRate)}`
                }
                value={sliderRate}
                min={0}
                max={80}
                disabled={isBursting}
                onChange={setSliderRate}
              />
              <View style={{ alignItems: 'center', marginTop: 4 }}>
                <ActionButton label="Burst 3s" onPress={startBurst} disabled={isBursting} />
              </View>
            </ControlPanel>
          </View>
        );
      }}
    </MeasuredView>
  );
}

const styles = StyleSheet.create({
  banner: {
    pointerEvents: 'none' as const,
    position: 'absolute',
    top: 32,
    alignSelf: 'center',
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

import React, { useState } from 'react';
import type { ComponentType } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { FpsCounter, theme } from './ui';

import BenchmarkSample from './samples/BenchmarkSample';
import CanvasSample from './samples/CanvasSample';
import ConfettiSample from './samples/ConfettiSample';
import EmojiRainSample from './samples/EmojiRainSample';
import GlowSample from './samples/GlowSample';
import GravityPointSample from './samples/GravityPointSample';
import GravitySample from './samples/GravitySample';
import MagicWandSample from './samples/MagicWandSample';
import RingEmitterSample from './samples/RingEmitterSample';
import SingleEmitterBenchmarkSample from './samples/SingleEmitterBenchmarkSample';
import StickyEdgesSample from './samples/StickyEdgesSample';

interface SampleEntry {
  key: string;
  title: string;
  description: string;
  component: ComponentType;
}

/** Same registry as SamplesNavigation.kt in the original repo. */
const SAMPLES: SampleEntry[] = [
  {
    key: 'canvas',
    title: 'Canvas Emitter',
    description: 'High-performance canvas-based particles with layered star effects',
    component: CanvasSample,
  },
  {
    key: 'confetti',
    title: 'Confetti',
    description: 'Multi-emitter confetti with emoji and glowing stars',
    component: ConfettiSample,
  },
  {
    key: 'glow',
    title: 'Glow Particles',
    description: 'Glowing particles with blur and color animations',
    component: GlowSample,
  },
  {
    key: 'gravity',
    title: 'Gravity',
    description: 'Canvas particles with configurable gravity — toggle on/off',
    component: GravitySample,
  },
  {
    key: 'gravity_point',
    title: 'Gravity Point',
    description: 'Drag a gravity attractor point to bend particle trajectories',
    component: GravityPointSample,
  },
  {
    key: 'magic_wand',
    title: 'Magic Wand',
    description: 'Drag to leave a sparkling trail of stars',
    component: MagicWandSample,
  },
  {
    key: 'emoji_rain',
    title: 'Emoji Rain',
    description: 'Fullscreen emoji particles using rasterized emoji shapes',
    component: EmojiRainSample,
  },
  {
    key: 'ring_emitter',
    title: 'Ring Emitter',
    description: 'Ring start region with 360° spread — toggle hideInStartRegion',
    component: RingEmitterSample,
  },
  {
    key: 'sticky_edges',
    title: 'Sticky Edges',
    description: 'Particles bounce, stick, or wrap at screen edges',
    component: StickyEdgesSample,
  },
  {
    key: 'benchmark',
    title: 'Benchmark',
    description: '10 emitters × 1000 particles/sec — toggle active count for profiling',
    component: BenchmarkSample,
  },
  {
    key: 'single_benchmark',
    title: 'Single Emitter Benchmark',
    description: '1 emitter, slider from 0 to 10,000 particles/sec in 1,000 steps',
    component: SingleEmitterBenchmarkSample,
  },
];

export default function SamplesApp() {
  const [selectedKey, setSelectedKey] = useState(SAMPLES[0].key);
  const { width } = useWindowDimensions();
  const compact = width < 760;

  const selected = SAMPLES.find((s) => s.key === selectedKey) ?? SAMPLES[0];
  const SampleComponent = selected.component;

  return (
    <View style={[styles.root, compact && { flexDirection: 'column' }]}>
      <View style={[styles.sidebar, compact && styles.sidebarCompact]}>
        <View style={styles.brand}>
          <Text style={styles.brandTitle}>Particle Emitter</Text>
          <Text style={styles.brandSubtitle}>react-native-skia samples</Text>
        </View>
        <ScrollView horizontal={compact} showsVerticalScrollIndicator={false}>
          {SAMPLES.map((sample) => {
            const active = sample.key === selectedKey;
            return (
              <Pressable
                key={sample.key}
                onPress={() => setSelectedKey(sample.key)}
                style={(state) => [
                  styles.item,
                  compact && styles.itemCompact,
                  // `hovered` exists on react-native-web's pressable state
                  (state as { hovered?: boolean }).hovered && !active && styles.itemHovered,
                  active && styles.itemActive,
                ]}
              >
                <Text style={[styles.itemTitle, active && styles.itemTitleActive]}>
                  {sample.title}
                </Text>
                {!compact && (
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {sample.description}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{selected.title}</Text>
          <Text style={styles.headerDescription}>{selected.description}</Text>
        </View>
        <View style={styles.stage}>
          {/* key remounts the sample on switch so each starts fresh */}
          <SampleComponent key={selected.key} />
          <FpsCounter />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: theme.bg },
  sidebar: {
    width: 280,
    backgroundColor: theme.panel,
    borderRightWidth: 1,
    borderRightColor: theme.panelBorder,
    paddingVertical: 16,
  },
  sidebarCompact: {
    width: '100%',
    paddingVertical: 8,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.panelBorder,
  },
  brand: { paddingHorizontal: 20, paddingBottom: 16 },
  brandTitle: { color: theme.text, fontSize: 18, fontWeight: '700' },
  brandSubtitle: { color: theme.textDim, fontSize: 12, marginTop: 2 },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 3,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  itemCompact: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderLeftWidth: 0,
  },
  itemHovered: { backgroundColor: 'rgba(124,108,255,0.08)' },
  itemActive: {
    backgroundColor: 'rgba(124,108,255,0.14)',
    borderLeftColor: theme.accent,
  },
  itemTitle: { color: theme.textDim, fontSize: 14, fontWeight: '600' },
  itemTitleActive: { color: theme.text },
  itemDescription: { color: theme.textDim, fontSize: 11.5, lineHeight: 15 },
  content: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.panelBorder,
  },
  headerTitle: { color: theme.text, fontSize: 16, fontWeight: '700' },
  headerDescription: { color: theme.textDim, fontSize: 12, marginTop: 2 },
  stage: { flex: 1, overflow: 'hidden' },
});

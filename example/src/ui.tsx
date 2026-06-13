import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import Slider from '@react-native-community/slider';

export const theme = {
  bg: '#0e0e16',
  panel: '#161622',
  panelBorder: '#26263a',
  accent: '#7c6cff',
  accentDim: '#4a3fae',
  text: '#e8e8f2',
  textDim: '#8d8da3',
};

/** Bottom overlay holding a sample's interactive controls. */
export function ControlPanel({ children }: { children: ReactNode }) {
  return <View style={panelStyles.panel}>{children}</View>;
}

const panelStyles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: 'rgba(22, 22, 34, 0.92)',
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 6,
  },
});

export function LabeledSlider({
  label,
  value,
  min,
  max,
  step = 0,
  disabled = false,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={sliderStyles.label}>{label}</Text>
      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        disabled={disabled}
        onValueChange={onChange}
        minimumTrackTintColor={theme.accent}
        maximumTrackTintColor={theme.panelBorder}
        thumbTintColor={theme.accent}
        style={{ width: '100%', height: 28 }}
      />
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  label: { color: theme.text, fontSize: 13 },
});

export function SwitchRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.panelBorder, true: theme.accentDim }}
        thumbColor={value ? theme.accent : '#666'}
      />
      <Text style={{ color: theme.text, fontSize: 13 }}>{label}</Text>
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[chipStyles.chip, selected && chipStyles.chipSelected]}
    >
      <Text style={[chipStyles.label, selected && chipStyles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.panelBorder,
    backgroundColor: 'transparent',
  },
  chipSelected: { backgroundColor: theme.accentDim, borderColor: theme.accent },
  label: { color: theme.textDim, fontSize: 13 },
  labelSelected: { color: theme.text, fontWeight: '600' },
});

export function ActionButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[buttonStyles.button, disabled && { opacity: 0.4 }]}
    >
      <Text style={buttonStyles.label}>{label}</Text>
    </Pressable>
  );
}

const buttonStyles = StyleSheet.create({
  button: {
    backgroundColor: theme.accent,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  label: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

/** Simple requestAnimationFrame-based FPS meter. */
export function FpsCounter() {
  const [fps, setFps] = useState(0);
  const frames = useRef(0);
  const last = useRef(0);

  useEffect(() => {
    let raf = 0;
    let mounted = true;
    const tick = (t: number) => {
      if (!mounted) return;
      frames.current++;
      if (last.current === 0) last.current = t;
      const elapsed = t - last.current;
      if (elapsed >= 500) {
        setFps(Math.round((frames.current * 1000) / elapsed));
        frames.current = 0;
        last.current = t;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <View style={fpsStyles.box}>
      <Text style={fpsStyles.text}>{fps} fps</Text>
    </View>
  );
}

const fpsStyles = StyleSheet.create({
  box: {
    pointerEvents: 'none' as const,
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(22,22,34,0.85)',
    borderColor: theme.panelBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: { color: theme.accent, fontSize: 12, fontVariant: ['tabular-nums'] },
});

/** Measures its children's layout size and passes it down once known. */
export function MeasuredView({
  style,
  children,
}: {
  style?: object;
  children: (size: { width: number; height: number }) => ReactNode;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  return (
    <View
      style={[{ flex: 1 }, style]}
      onLayout={(e) =>
        setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })
      }
    >
      {size.width > 0 && size.height > 0 ? children(size) : null}
    </View>
  );
}

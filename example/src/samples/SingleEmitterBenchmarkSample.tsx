import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CanvasParticleEmitter } from 'react-particle-emitter';
import type { CanvasEmitterConfig } from 'react-particle-emitter';
import { ControlPanel, LabeledSlider, MeasuredView } from '../ui';

const MAX_STEPS = 10;
const PARTICLES_PER_STEP = 1000;

/**
 * Port of SingleEmitterBenchmarkSample.kt — one emitter, slider from 0 to
 * 10 000 particles/sec in 1000-particle steps.
 */
export default function SingleEmitterBenchmarkSample() {
  const [step, setStep] = useState(0);

  return (
    <MeasuredView>
      {({ width, height }) => {
        const config: CanvasEmitterConfig = {
          particlePerSecond: step * PARTICLES_PER_STEP,
          emitterCenter: { x: width / 2, y: height / 2 },
          particleShapes: [{ type: 'circle' }],
          lifespanRange: [800, 1200],
          fadeOutTime: [400, 800],
          scaleTime: [400, 800],
          colors: ['#53FF00', '#E5FF5E', '#4AC2FF', '#FF6EC7'],
          particleSizes: [{ width: 4, height: 4 }],
          initialForce: [40, 120],
          spread: [-180, 180],
          startScaleRange: [1, 2],
          targetScaleRange: [0, 1],
        };
        return (
          <View style={{ flex: 1 }}>
            {step > 0 && (
              <CanvasParticleEmitter
                style={StyleSheet.absoluteFill}
                config={config}
                maxParticles={20000}
              />
            )}
            <ControlPanel>
              <LabeledSlider
                label={`${step * PARTICLES_PER_STEP} particles/sec (step ${step} / ${MAX_STEPS})`}
                value={step}
                min={0}
                max={MAX_STEPS}
                step={1}
                onChange={setStep}
              />
            </ControlPanel>
          </View>
        );
      }}
    </MeasuredView>
  );
}

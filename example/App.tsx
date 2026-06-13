import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

export default function App() {
  if (Platform.OS === 'web') {
    return (
      <WithSkiaWeb
        getComponent={() => import('./src/SamplesApp')}
        opts={{ locateFile: (file: string) => `/${file}` }}
        fallback={
          <View style={styles.loading}>
            <Text style={styles.loadingText}>Loading Skia…</Text>
          </View>
        }
      />
    );
  }
  const SamplesApp = require('./src/SamplesApp').default;
  return <SamplesApp />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e0e16' },
  loadingText: { color: '#8d8da3' },
});

/**
 * Disables React 19's dev-only "Component Performance Track".
 *
 * In dev mode React serializes component props into the Performance timeline
 * (`logComponentRender` → `addValueToProperties`). React Native Skia host
 * objects (SkImage, SkPath, SkFont) each hold a reference to the entire
 * CanvasKit module, so serializing a prop that contains one walks a
 * practically unbounded object graph and hard-locks the browser main thread.
 *
 * React gates the whole feature on `typeof performance.measure === 'function'`,
 * evaluated when react-dom loads — so removing it here (before any React
 * import) turns the track off. Dev + web only; production builds don't have
 * this instrumentation and are unaffected.
 *
 * This module MUST be the first import in index.ts.
 */
declare const __DEV__: boolean;

if (
  typeof __DEV__ !== 'undefined' &&
  __DEV__ &&
  typeof window !== 'undefined' &&
  typeof Performance !== 'undefined'
) {
  try {
    // @ts-expect-error intentional removal of an optional API
    delete Performance.prototype.measure;
  } catch {
    // ignore — worst case the perf track stays on
  }
}

export {};

import { Platform } from 'react-native';
import { Skia } from '@shopify/react-native-skia';
import type { SkImage, SkPath } from '@shopify/react-native-skia';

/**
 * 5-pointed star path, port of `buildStarPath` from MagicWandSample.kt:
 * alternate between outer and inner radius around the circle, starting at
 * the top and sweeping clockwise.
 */
export function buildStarPath(radius: number): SkPath {
  const points = 5;
  const outer = radius;
  const inner = radius * 0.45;
  const path = Skia.Path.Make();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / points;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  path.close();
  return path;
}

/**
 * Rasterizes an emoji into an SkImage.
 *
 * CanvasKit ships no emoji font, so on web we render the emoji with the
 * browser's native emoji support on a DOM canvas and decode the PNG into
 * Skia — the same rasterize-once strategy the Compose `ParticleShape.Text`
 * uses. Returns null on native (use a text shape with `matchFont` there).
 */
export function rasterizeEmoji(emoji: string, fontSize: number): SkImage | null {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return null;
  const pad = Math.ceil(fontSize * 0.25);
  const side = fontSize + pad * 2;
  const canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, side / 2, side / 2);
  const base64 = canvas.toDataURL('image/png').split(',')[1];
  const data = Skia.Data.fromBase64(base64);
  return Skia.Image.MakeImageFromEncoded(data);
}

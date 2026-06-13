// MUST come first — see the comment inside for why (Skia objects + React 19
// dev performance track hang the web main thread otherwise).
import './disableReactPerfTrack';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

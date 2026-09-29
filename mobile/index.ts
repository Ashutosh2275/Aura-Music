import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import { playbackService } from './src/audio/playbackService';

// Register native background playback service (for lock screen, bluetooth, notifications)
TrackPlayer.registerPlaybackService(() => playbackService);

// Register root application component
registerRootComponent(App);

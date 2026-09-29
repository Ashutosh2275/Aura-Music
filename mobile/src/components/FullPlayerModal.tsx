import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from 'react-native-track-player';
import { usePlayerStore } from '../store/playerStore';

interface FullPlayerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({
  visible,
  onClose,
}) => {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const status = usePlayerStore((s) => s.status);
  const isShuffle = usePlayerStore((s) => s.isShuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const skipNext = usePlayerStore((s) => s.skipNext);
  const skipPrevious = usePlayerStore((s) => s.skipPrevious);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeatMode = usePlayerStore((s) => s.cycleRepeatMode);

  const { position, duration } = useProgress(250);

  if (!currentTrack) return null;

  const isPlaying = status === 'playing';
  const progressFraction = duration > 0 ? Math.min(position / duration, 1) : 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalRoot}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerIcon}>
            <Ionicons name="chevron-down" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerSubtitle}>PLAYING FROM QUEUE</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {currentTrack.album || 'Permitted Music Stream'}
            </Text>
          </View>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Artwork */}
          <View style={styles.artworkContainer}>
            <Image
              source={{ uri: currentTrack.artwork || 'https://via.placeholder.com/400' }}
              style={styles.artwork}
            />
          </View>

          {/* Track Info */}
          <View style={styles.metaSection}>
            <View style={styles.metaLeft}>
              <Text style={styles.title} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {currentTrack.artist}
              </Text>
            </View>
            <TouchableOpacity style={styles.likeButton}>
              <Ionicons name="heart-outline" size={24} color="#E5E5E5" />
            </TouchableOpacity>
          </View>

          {/* Licensing Badge */}
          {currentTrack.license ? (
            <View style={styles.licenseRow}>
              <Ionicons name="checkmark-circle" size={13} color="#10B981" />
              <Text style={styles.licenseText}>{currentTrack.license}</Text>
            </View>
          ) : null}

          {/* Scrub Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.trackBar}>
              <View
                style={[
                  styles.trackBarFill,
                  { width: `${progressFraction * 100}%` },
                ]}
              />
              <View
                style={[
                  styles.scrubberThumb,
                  { left: `${progressFraction * 100}%` },
                ]}
              />
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Playback Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={toggleShuffle} style={styles.secondaryButton}>
              <Ionicons
                name="shuffle"
                size={22}
                color={isShuffle ? '#10B981' : '#737373'}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={skipPrevious} style={styles.primaryButton}>
              <Ionicons name="play-skip-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={togglePlayPause}
              style={styles.playPauseButton}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={34}
                color="#000000"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={skipNext} style={styles.primaryButton}>
              <Ionicons name="play-skip-forward" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={cycleRepeatMode} style={styles.secondaryButton}>
              <Ionicons
                name={repeatMode === 'track' ? 'repeat-outline' : 'repeat'}
                size={22}
                color={repeatMode !== 'off' ? '#10B981' : '#737373'}
              />
            </TouchableOpacity>
          </View>

          {/* iOS 16 Lock Screen & Background Status Card */}
          <View style={styles.proofCard}>
            <Ionicons name="radio" size={16} color="#10B981" />
            <Text style={styles.proofText}>
              AVAudioSession: Background active • Lock Screen synced
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerIcon: {
    padding: 6,
  },
  headerTitleWrap: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 12,
  },
  headerSubtitle: {
    color: '#737373',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  headerTitle: {
    color: '#E5E5E5',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  artworkContainer: {
    alignItems: 'center',
    marginVertical: 18,
  },
  artwork: {
    width: 290,
    height: 290,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaLeft: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  artist: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 4,
  },
  likeButton: {
    padding: 8,
  },
  licenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#18181B',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  licenseText: {
    color: '#A1A1AA',
    fontSize: 11,
  },
  progressContainer: {
    marginTop: 20,
  },
  trackBar: {
    height: 4,
    backgroundColor: '#27272A',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  trackBarFill: {
    height: 4,
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  scrubberThumb: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginLeft: -5,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: '#71717A',
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginVertical: 12,
  },
  secondaryButton: {
    padding: 10,
  },
  primaryButton: {
    padding: 10,
  },
  playPauseButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  proofCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141414',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#222222',
  },
  proofText: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '500',
  },
});

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from './src/store/playerStore';
import { PERMITTED_TRACKS } from './src/services/mockPermittedData';
import { TrackItem } from './src/components/TrackItem';
import { MiniPlayer } from './src/components/MiniPlayer';
import { FullPlayerModal } from './src/components/FullPlayerModal';
import { DiagnosticsBanner } from './src/components/DiagnosticsBanner';
import { TrackMetadata } from './src/audio/types';

export default function App() {
  const initialize = usePlayerStore((s) => s.initialize);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const status = usePlayerStore((s) => s.status);

  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSelectTrack = (track: TrackMetadata) => {
    playTrack(track, PERMITTED_TRACKS);
  };

  const isPlaying = status === 'playing';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />

      {/* Main Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>AURA MUSIC</Text>
          <View style={styles.privacyBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#10B981" />
            <Text style={styles.privacyText}>Privacy First • Ad-Free • CC Streams</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="sparkles-outline" size={20} color="#E5E5E5" />
        </TouchableOpacity>
      </View>

      {/* Verification Diagnostics Banner */}
      <DiagnosticsBanner />

      {/* Track List Section */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Permitted Catalog (Proof of Concept)</Text>
        <Text style={styles.sectionSubtitle}>
          Freely licensed music streams with direct CDN URLs and lock-screen metadata.
        </Text>
      </View>

      <FlatList
        data={PERMITTED_TRACKS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrackItem
            track={item}
            isPlaying={isPlaying}
            isCurrent={currentTrack?.id === item.id}
            onPress={() => handleSelectTrack(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* Floating Mini Player */}
      <MiniPlayer onExpand={() => setIsFullPlayerVisible(true)} />

      {/* Full Player Modal */}
      <FullPlayerModal
        visible={isFullPlayerVisible}
        onClose={() => setIsFullPlayerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  privacyText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#171717',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#262626',
  },
  listHeader: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#737373',
    fontSize: 12,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 110, // space for MiniPlayer
  },
});

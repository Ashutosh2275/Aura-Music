import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../store/playerStore';

export const DiagnosticsBanner: React.FC = () => {
  const isEngineReady = usePlayerStore((s) => s.isEngineReady);
  const status = usePlayerStore((s) => s.status);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const queue = usePlayerStore((s) => s.queue);
  const error = usePlayerStore((s) => s.error);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="shield-checkmark" size={16} color="#10B981" />
        <Text style={styles.headerTitle}>iOS 16 Verification & Diagnostics</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.badge}>
          <View style={[styles.dot, isEngineReady ? styles.dotGreen : styles.dotAmber]} />
          <Text style={styles.badgeText}>
            Audio Engine: {isEngineReady ? 'Active' : 'Initializing'}
          </Text>
        </View>

        <View style={styles.badge}>
          <View style={[styles.dot, styles.dotGreen]} />
          <Text style={styles.badgeText}>Background: UIBackgroundModes (Audio)</Text>
        </View>

        <View style={styles.badge}>
          <View style={[styles.dot, currentTrack ? styles.dotGreen : styles.dotGray]} />
          <Text style={styles.badgeText}>
            Lock Screen: {currentTrack ? 'Synced' : 'Waiting Track'}
          </Text>
        </View>

        <View style={styles.badge}>
          <View style={[styles.dot, queue.length > 0 ? styles.dotGreen : styles.dotGray]} />
          <Text style={styles.badgeText}>Queue: {queue.length} Tracks Loaded</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#171717',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#262626',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  headerTitle: {
    color: '#E5E5E5',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'column',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotGreen: {
    backgroundColor: '#10B981',
  },
  dotAmber: {
    backgroundColor: '#F59E0B',
  },
  dotGray: {
    backgroundColor: '#525252',
  },
  badgeText: {
    color: '#A3A3A3',
    fontSize: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#450A0A',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    flex: 1,
  },
});

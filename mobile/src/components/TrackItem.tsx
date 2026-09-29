import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrackMetadata } from '../audio/types';

interface TrackItemProps {
  track: TrackMetadata;
  isPlaying: boolean;
  isCurrent: boolean;
  onPress: () => void;
}

export const TrackItem: React.FC<TrackItemProps> = ({
  track,
  isPlaying,
  isCurrent,
  onPress,
}) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, isCurrent && styles.activeContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: track.artwork || 'https://via.placeholder.com/150' }}
        style={styles.artwork}
      />
      <View style={styles.infoCol}>
        <Text style={[styles.title, isCurrent && styles.activeText]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist}
        </Text>
        {track.license ? (
          <Text style={styles.licenseBadge} numberOfLines={1}>
            {track.license}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightCol}>
        <Text style={styles.duration}>{formatDuration(track.duration)}</Text>
        {isCurrent ? (
          <Ionicons
            name={isPlaying ? 'volume-high' : 'pause'}
            size={18}
            color="#10B981"
            style={styles.playIcon}
          />
        ) : (
          <Ionicons
            name="play"
            size={16}
            color="#737373"
            style={styles.playIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 4,
    backgroundColor: '#121212',
  },
  activeContainer: {
    backgroundColor: '#1C1C1E',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#262626',
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    color: '#F5F5F5',
    fontSize: 15,
    fontWeight: '600',
  },
  activeText: {
    color: '#10B981',
  },
  artist: {
    color: '#A3A3A3',
    fontSize: 13,
    marginTop: 2,
  },
  licenseBadge: {
    color: '#737373',
    fontSize: 10,
    marginTop: 3,
    fontStyle: 'italic',
  },
  rightCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  duration: {
    color: '#737373',
    fontSize: 12,
  },
  playIcon: {
    marginTop: 4,
  },
});

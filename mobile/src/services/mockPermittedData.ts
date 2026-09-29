import { TrackMetadata } from '../audio/types';

/**
 * Permitted, freely licensed music tracks (Creative Commons / Royalty Free).
 * Complying strictly with rule #1: Never scrape or proxy copyrighted services.
 */
export const PERMITTED_TRACKS: TrackMetadata[] = [
  {
    id: 'trk_cc_01',
    title: 'Aura of Serenity',
    artist: 'Kai Engel',
    album: 'Sustained Motion',
    duration: 226,
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    license: 'Pixabay Content License (Permitted Free Streaming)',
    sourceProvider: 'custom',
  },
  {
    id: 'trk_cc_02',
    title: 'Nocturne Drift',
    artist: 'Ghostrifter Official',
    album: 'Afternoon Breeze',
    duration: 168,
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=smoke-143172.mp3',
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    license: 'Creative Commons CC-BY 4.0',
    sourceProvider: 'custom',
  },
  {
    id: 'trk_cc_03',
    title: 'Deep Horizon',
    artist: 'Purrple Cat',
    album: 'Distant Stars',
    duration: 194,
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=chill-abstract-intention-12099.mp3',
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    license: 'Creative Commons CC-BY-SA 4.0',
    sourceProvider: 'custom',
  },
  {
    id: 'trk_cc_04',
    title: 'Ethereal Voyage',
    artist: 'Aerøhead',
    album: 'Atmospheres',
    duration: 210,
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=ambient-piano-amp-strings-10711.mp3',
    artwork: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80',
    license: 'Creative Commons CC-BY 3.0',
    sourceProvider: 'custom',
  }
];

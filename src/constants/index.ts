import { Dimensions, Platform, UIManager } from 'react-native';

export const { width } = Dimensions.get('window');

export const GENRES = [
  { id: '1', name: 'Pop', color: '#ff6b6b', icon: 'music-note' },
  { id: '2', name: 'Hip Hop', color: '#4ecdc4', icon: 'microphone-variant' },
  { id: '3', name: 'Rock', color: '#45b7d1', icon: 'guitar-electric' },
  { id: '4', name: 'R&B', color: '#f9ca24', icon: 'heart' },
  { id: '5', name: 'Jazz', color: '#eb4d4b', icon: 'saxophone' },
  { id: '6', name: 'Classical', color: '#6ab04c', icon: 'piano' },
  { id: '7', name: 'EDM', color: '#be2edd', icon: 'headphones' },
  { id: '8', name: 'Country', color: '#f0932b', icon: 'guitar-acoustic' },
];

export const PLAYLIST: any[] = [];

export const ALBUMS: any[] = [];

export const TABS = ['Discover', 'Albums', 'Artist', 'Genre', 'Top Tracks', 'Download', 'Favourites', 'History'];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
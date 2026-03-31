import { Dimensions, Platform, UIManager } from 'react-native';

export const { width } = Dimensions.get('window');

export const GENRES: any[] = [];

export const PLAYLIST: any[] = [];

export const ALBUMS: any[] = [];

export const TABS = ['Discover', 'Albums', 'Artist', 'Genre', 'Top Tracks', 'Download', 'Favourites', 'History'];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
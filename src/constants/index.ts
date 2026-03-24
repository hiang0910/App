import { Dimensions, Platform, UIManager } from 'react-native';

export const { width } = Dimensions.get('window');

export const PLAYLIST = [
     {
    id: '1',
    title: 'Death Bed',
    artist: 'Powfu',
    duration: '6:12',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
  },
  {
    id: '2',
    title: 'Bad Liar',
    artist: 'Imagine Dragons',
    duration: '7:05',
    artwork: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: '3',
    title: 'Faded',
    artist: 'Alan Walker',
    duration: '5:44',
    artwork: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: '4',
    title: 'Hate Me',
    artist: 'Ellie Goulding',
    duration: '5:02',
    artwork: 'https://images.unsplash.com/photo-1521566652839-697aa473761a?q=80&w=2071&auto=format&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: '5',
    title: 'Solo',
    artist: 'Clean Bandit',
    duration: '5:53',
    artwork: 'https://images.unsplash.com/photo-1458560871784-56d23406c091?w=800&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: '6',
    title: 'Without Me',
    artist: 'Halsey',
    duration: '4:39',
    artwork: 'https://images.unsplash.com/photo-1516280440502-12ef2bbb5f27?w=800&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
  {
    id: '7',
    title: 'Starboy',
    artist: 'The Weeknd',
    duration: '5:35',
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  },
  {
    id: '8',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    duration: '4:12',
    artwork: 'https://images.unsplash.com/photo-1493225457124-a1a2a5e560ee?w=800&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
  {
    id: '9',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    duration: '6:40',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  },
  {
    id: '10',
    title: 'Dance Monkey',
    artist: 'Tones and I',
    duration: '5:15',
    artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
  },
  {
    id: '11',
    title: 'Closer',
    artist: 'The Chainsmokers',
    duration: '4:51',
    artwork: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
  },
  {
    id: '12',
    title: 'Sunflower',
    artist: 'Post Malone',
    duration: '5:48',
    artwork: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
  },
  {
    id: '13',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    duration: '4:47',
    artwork: 'https://images.unsplash.com/photo-1516280440502-12ef2bbb5f27?w=800&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
  },
  {
    id: '14',
    title: 'Believer',
    artist: 'Imagine Dragons',
    duration: '6:02',
    artwork: 'https://images.unsplash.com/photo-1458560871784-56d23406c091?w=800&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
  },
  {
    id: '15',
    title: 'Shallow',
    artist: 'Lady Gaga',
    duration: '4:49',
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
  },
  {
    id: '16',
    title: 'Someone You Loved',
    artist: 'Lewis Capaldi',
    duration: '5:29',
    artwork: 'https://images.unsplash.com/photo-1521566652839-697aa473761a?q=80&w=2071&auto=format&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
  }
  // ... Paste toàn bộ mảng PLAYLIST của em vào đây
];

export const TABS = ['Discover', 'Albums', 'Artist', 'Genre', 'Top Tracks', 'Download', 'Favourites', 'History'];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
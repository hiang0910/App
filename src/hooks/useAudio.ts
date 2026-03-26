import { useState, useEffect, useRef } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { PLAYLIST } from '../constants';
import { Alert } from 'react-native';

const formatAudioUrl = (url: string) => {
  if (!url) return '';
  // Convert Google Drive share links to direct download links
  if (url.includes('drive.google.com')) {
    const id = url.split('/d/')[1]?.split('/')[0] || url.split('id=')[1]?.split('&')[0];
    if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
  }
  // Convert Dropbox share links
  if (url.includes('dropbox.com')) {
    return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
  }
  return url;
};

export const useAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [currentQueue, setCurrentQueue] = useState<any[]>(PLAYLIST);
  const [originalQueue, setOriginalQueue] = useState<any[]>(PLAYLIST);
  const [isShuffle, setIsShuffle] = useState(false);
  
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const isSeekingRef = useRef(false);

  const [volume, setVolume] = useState(1.0);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  useEffect(() => {
    if (!hasStartedPlaying && !isPlaying) return; 
    let currentSound: Audio.Sound | null = null;
    const loadAudio = async () => {
      const track = currentQueue[currentIndex];
      if (!track || !track.url) {
        console.log("Invalid track data:", track);
        return;
      }

      try {
        if (sound) {
          await sound.unloadAsync();
          setSound(null);
        }

        const formattedUrl = formatAudioUrl(track.url);
        console.log("Loading audio from:", formattedUrl);

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: formattedUrl },
          { shouldPlay: isPlaying, volume: volume },
          status => {
            if (status.isLoaded) {
              setDuration(status.durationMillis || 0);
              if (!isSeekingRef.current) setPosition(Math.floor(status.positionMillis || 0));
              setIsPlaying(status.isPlaying);
              if (status.didJustFinish) handleNext();
            } else if (status.error) {
              console.log("Playback error status:", status.error);
            }
          }
        );
        currentSound = newSound;
        setSound(newSound);
      } catch (e: any) { 
        console.log('Error loading audio:', e);
        Alert.alert("Lỗi phát nhạc", `Không thể phát bài hát này. Lỗi: ${e.message || 'Lỗi mạng hoặc Link không hợp lệ'}`);
        setIsPlaying(false);
      }
    };
    loadAudio();
    return () => { if (currentSound) currentSound.unloadAsync(); };
  }, [currentIndex, hasStartedPlaying]);

  useEffect(() => {
    if (sound) {
      sound.setVolumeAsync(volume);
    }
  }, [volume, sound]);

  const handlePlayPause = async () => {
    if (!hasStartedPlaying) { setHasStartedPlaying(true); setIsPlaying(true); return; }
    if (!sound) return;
    isPlaying ? await sound.pauseAsync() : await sound.playAsync();
  };

  const handlePlayTrack = (index: number, newQueue: any[] = PLAYLIST, forceShuffle: boolean = false) => {
    if (!hasStartedPlaying) setHasStartedPlaying(true);
    let targetIndex = index;

    if (newQueue !== currentQueue || forceShuffle) {
      if (isShuffle || forceShuffle) {
        if (forceShuffle && !isShuffle) setIsShuffle(true);
        const selectedTrack = newQueue[index] || currentQueue[index];
        const baseQueue = newQueue !== currentQueue ? newQueue : currentQueue;
        const shuffled = [...baseQueue].filter(t => t.id !== selectedTrack.id).sort(() => Math.random() - 0.5);
        setCurrentQueue([selectedTrack, ...shuffled]);
        setOriginalQueue(baseQueue);
        targetIndex = 0;
      } else {
        setCurrentQueue(newQueue);
        setOriginalQueue(newQueue);
      }
    }

    if (currentIndex === targetIndex && hasStartedPlaying && (!newQueue || newQueue === currentQueue) && !forceShuffle) {
       if (isPlaying) { sound?.pauseAsync(); setIsPlaying(false); }
       else { sound?.playAsync(); setIsPlaying(true); }
    } else { 
       setIsPlaying(true); 
       setCurrentIndex(targetIndex); 
    }
  };

  const handleNext = () => setCurrentIndex(prev => (prev < currentQueue.length - 1 ? prev + 1 : 0));
  const handlePrev = () => setCurrentIndex(prev => (prev > 0 ? prev - 1 : currentQueue.length - 1));

  const toggleShuffle = () => {
    const nextShuffle = !isShuffle;
    setIsShuffle(nextShuffle);
    if (nextShuffle) {
      const currentTrack = currentQueue[currentIndex];
      const remaining = [...currentQueue].filter(t => t.id !== currentTrack.id).sort(() => Math.random() - 0.5);
      setCurrentQueue([currentTrack, ...remaining]);
      setCurrentIndex(0);
    } else {
      const currentTrack = currentQueue[currentIndex];
      const newIndex = originalQueue.findIndex(t => t.id === currentTrack.id);
      setCurrentQueue(originalQueue);
      setCurrentIndex(Math.max(0, newIndex));
    }
  };

  const handleSlidingStart = () => { isSeekingRef.current = true; };
  const handleSlidingComplete = async (value: number) => {
    if (sound) { await sound.setPositionAsync(value); setPosition(value); }
    isSeekingRef.current = false;
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
  };

  return {
    isPlaying, position, duration, currentIndex, hasStartedPlaying, volume,
    currentTrack: currentQueue[currentIndex], currentQueue, isShuffle, toggleShuffle,
    handlePlayPause, handlePlayTrack, handleNext, handlePrev,
    handleSlidingStart, handleSlidingComplete, setPosition, handleVolumeChange
  };
};
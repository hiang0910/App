import { useState, useEffect, useRef } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { PLAYLIST } from '../constants';

export const useAudio = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const isSeekingRef = useRef(false);

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
      try {
        if (sound) await sound.unloadAsync();
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: PLAYLIST[currentIndex].url },
          { shouldPlay: isPlaying },
          status => {
            if (status.isLoaded) {
              setDuration(status.durationMillis || 0);
              if (!isSeekingRef.current) setPosition(Math.floor(status.positionMillis || 0));
              setIsPlaying(status.isPlaying);
              if (status.didJustFinish) handleNext();
            }
          }
        );
        currentSound = newSound;
        setSound(newSound);
      } catch (e) { console.log('Error loading audio', e); }
    };
    loadAudio();
    return () => { if (currentSound) currentSound.unloadAsync(); };
  }, [currentIndex, hasStartedPlaying]);

  const handlePlayPause = async () => {
    if (!hasStartedPlaying) { setHasStartedPlaying(true); setIsPlaying(true); return; }
    if (!sound) return;
    isPlaying ? await sound.pauseAsync() : await sound.playAsync();
  };

  const handlePlayTrack = (index: number) => {
    if (!hasStartedPlaying) setHasStartedPlaying(true);
    if (currentIndex === index && hasStartedPlaying) handlePlayPause();
    else { setIsPlaying(true); setCurrentIndex(index); }
  };

  const handleNext = () => setCurrentIndex(prev => (prev < PLAYLIST.length - 1 ? prev + 1 : 0));
  const handlePrev = () => setCurrentIndex(prev => (prev > 0 ? prev - 1 : PLAYLIST.length - 1));

  const handleSlidingStart = () => { isSeekingRef.current = true; };
  const handleSlidingComplete = async (value: number) => {
    if (sound) { await sound.setPositionAsync(value); setPosition(value); }
    isSeekingRef.current = false;
  };

  return {
    isPlaying, position, duration, currentIndex, hasStartedPlaying,
    currentTrack: PLAYLIST[currentIndex],
    handlePlayPause, handlePlayTrack, handleNext, handlePrev,
    handleSlidingStart, handleSlidingComplete, setPosition
  };
};
/**
 * Audio and Haptic Feedback Utilities
 * Handles sound effects and haptic feedback for the game
 */

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Initialize audio session
 */
export async function initializeAudio() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch (error) {
    console.log('Error initializing audio:', error);
  }
}

/**
 * Play sound effect with haptic feedback
 * @param {string} soundType - Type of sound to play
 */
export async function playSound(soundType) {
  try {
    // Add haptic feedback for mobile devices
    if (Platform.OS !== 'web') {
      switch (soundType) {
        case 'move':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'win':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'draw':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'click':
          await Haptics.selectionAsync();
          break;
      }
    }
    
    // Play audio
    if (Platform.OS === 'web') {
      await playWebAudio(soundType);
    } else {
      await playMobileAudio(soundType);
    }
    
  } catch (error) {
    console.log(`Audio/haptic feedback unavailable for ${soundType}:`, error);
  }
}

/**
 * Play audio on web using Web Audio API
 * @param {string} soundType - Type of sound to play
 */
async function playWebAudio(soundType) {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    let frequency, duration;
    
    switch (soundType) {
      case 'move':
        frequency = 800;
        duration = 0.1;
        break;
      case 'win':
        frequency = 1200;
        duration = 0.3;
        break;
      case 'draw':
        frequency = 400;
        duration = 0.2;
        break;
      case 'click':
        frequency = 600;
        duration = 0.05;
        break;
      default:
        frequency = 600;
        duration = 0.1;
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    
  } catch (error) {
    console.log('Web audio not supported:', error);
  }
}

/**
 * Play audio on mobile using Expo Audio
 * @param {string} soundType - Type of sound to play
 */
async function playMobileAudio(soundType) {
  try {
    const sound = new Audio.Sound();
    
    // Use a simple data URI for a beep
    const beepData = `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LPeB4Ib27E7NqGMwgSdP9IjmP9Hn+p+t7t3Pq/7/6+8P9v8v/F9P/U9f/X9f/V9f/Q9P/E8v/U9f/o9v////9P`;
    
    await sound.loadAsync({ uri: beepData }, { shouldPlay: false });
    await sound.setVolumeAsync(0.2);
    await sound.playAsync();
    
    // Cleanup
    setTimeout(async () => {
      try {
        await sound.unloadAsync();
      } catch (cleanupError) {
        console.log('Error cleaning up sound:', cleanupError);
      }
    }, 500);
    
  } catch (error) {
    console.log('Mobile audio not supported:', error);
  }
}

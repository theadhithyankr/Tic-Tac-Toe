import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Modal,
  Image,
  Platform,
  BackHandler,
  ScrollView,
} from "react-native";
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

export default function App() {
  // Game states
  const [gameMode, setGameMode] = useState('selection'); // 'selection', 'config', or 'playing'
  const [numPlayers, setNumPlayers] = useState(2);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [board, setBoard] = useState([]);
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  
  // Player configurations with AI settings
  const [playerSettings, setPlayerSettings] = useState({});
  
  // Sound objects
  const [sounds, setSounds] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  
  // Initialize sounds
  useEffect(() => {
    const initializeSounds = async () => {
      try {
        // Enable audio session
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
    };

    initializeSounds();
  }, []);

  // Handle Android hardware back button
  useEffect(() => {
    const backAction = () => {
      if (showGameOverModal) {
        // Don't allow back when modal is open
        return true;
      }
      
      if (gameMode === 'playing') {
        playSound('click');
        setGameMode('config');
        setWinnerInfo(null);
        setShowGameOverModal(false);
        return true;
      } else if (gameMode === 'config') {
        playSound('click');
        setGameMode('selection');
        setWinnerInfo(null);
        setShowGameOverModal(false);
        return true;
      }
      
      // Let the system handle back button on selection screen (exit app)
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [gameMode, showGameOverModal]);

  // Play sound function using system sounds or simple beeps
  const playSound = async (soundType) => {
    if (isMuted) return; // Skip sound if muted
    
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
      
      // Simple beep implementation for different actions
      if (Platform.OS === 'web') {
        // For web, create audio context beeps
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          let frequency;
          let duration;
          
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
          
        } catch (webError) {
          console.log('Web audio not supported:', webError);
        }
      } else {
        // For mobile, try to use expo-av with simple tones
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
          
        } catch (mobileError) {
          console.log('Mobile audio not supported:', mobileError);
        }
      }
      
    } catch (error) {
      // Completely silent fallback - just log
      console.log(`Audio/haptic feedback unavailable for ${soundType}:`, error);
    }
  };
  
  // Base player configurations
  const basePlayerConfigs = {
    2: [
      { symbol: 'X', color: '#3F7FBF', name: 'Player 1', image: require('./assets/images/x.png') },
      { symbol: 'O', color: '#BF3F3F', name: 'Player 2', image: require('./assets/images/o.png') }
    ],
    3: [
      { symbol: 'X', color: '#3F7FBF', name: 'Player 1', image: require('./assets/images/x.png') },
      { symbol: 'O', color: '#BF3F3F', name: 'Player 2', image: require('./assets/images/o.png') },
      { symbol: '□', color: '#2D5A2D', name: 'Player 3', image: require('./assets/images/square.png') }
    ],
    4: [
      { symbol: 'X', color: '#3F7FBF', name: 'Player 1', image: require('./assets/images/x.png') },
      { symbol: 'O', color: '#BF3F3F', name: 'Player 2', image: require('./assets/images/o.png') },
      { symbol: '□', color: '#2D5A2D', name: 'Player 3', image: require('./assets/images/square.png') },
      { symbol: '△', color: '#D4AF37', name: 'Player 4', image: require('./assets/images/triangle.png') }
    ]
  };

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Get current players and grid size
  const currentPlayers = basePlayerConfigs[numPlayers].map((player, index) => ({
    ...player,
    isAI: playerSettings[index]?.isAI || false,
    aiDifficulty: playerSettings[index]?.aiDifficulty || 'medium',
    name: playerSettings[index]?.isAI 
      ? `AI ${player.name.split(' ')[1]} (${playerSettings[index]?.aiDifficulty})` 
      : player.name
  }));
  
  const gridSize = numPlayers === 2 ? 3 : 4;
  const totalCells = gridSize * gridSize;

  // Initialize board when game starts
  useEffect(() => {
    if (gameMode === 'playing') {
      setBoard(Array(totalCells).fill(null));
      setCurrentPlayerIndex(0);
      setWinnerInfo(null);
      setShowGameOverModal(false);
    }
  }, [gameMode, numPlayers]);

  // Initialize player settings when number of players changes
  useEffect(() => {
    const initialSettings = {};
    for (let i = 0; i < numPlayers; i++) {
      if (!playerSettings[i]) {
        initialSettings[i] = { isAI: false, aiDifficulty: 'medium' };
      }
    }
    if (Object.keys(initialSettings).length > 0) {
      setPlayerSettings(prev => ({ ...prev, ...initialSettings }));
    }
  }, [numPlayers]);

  // AI Move Logic
  const makeAIMove = (board, playerSymbol, difficulty) => {
    const emptyCells = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null);
    
    if (emptyCells.length === 0) return null;

    switch (difficulty) {
      case 'easy':
        // Random move
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
      case 'medium':
        // Try to win, then try to block, then random
        const winMove = findWinningMove(board, playerSymbol);
        if (winMove !== null) return winMove;
        
        const blockMove = findBlockingMove(board, playerSymbol);
        if (blockMove !== null) return blockMove;
        
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
      case 'hard':
        // Advanced strategy: win > block > center > corner > random
        const winMoveHard = findWinningMove(board, playerSymbol);
        if (winMoveHard !== null) return winMoveHard;
        
        const blockMoveHard = findBlockingMove(board, playerSymbol);
        if (blockMoveHard !== null) return blockMoveHard;
        
        // Try center (for 3x3) or middle cells (for 4x4)
        const centerCells = gridSize === 3 ? [4] : [5, 6, 9, 10];
        const availableCenters = centerCells.filter(cell => emptyCells.includes(cell));
        if (availableCenters.length > 0) {
          return availableCenters[Math.floor(Math.random() * availableCenters.length)];
        }
        
        // Try corners
        const corners = gridSize === 3 ? [0, 2, 6, 8] : [0, 3, 12, 15];
        const availableCorners = corners.filter(cell => emptyCells.includes(cell));
        if (availableCorners.length > 0) {
          return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
      default:
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
  };

  // Find winning move
  const findWinningMove = (board, playerSymbol) => {
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        const testBoard = [...board];
        testBoard[i] = playerSymbol;
        if (calculateWinner(testBoard, gridSize)?.winner === playerSymbol) {
          return i;
        }
      }
    }
    return null;
  };

  // Find blocking move
  const findBlockingMove = (board, playerSymbol) => {
    const opponents = currentPlayers.filter(p => p.symbol !== playerSymbol);
    
    for (const opponent of opponents) {
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          const testBoard = [...board];
          testBoard[i] = opponent.symbol;
          if (calculateWinner(testBoard, gridSize)?.winner === opponent.symbol) {
            return i;
          }
        }
      }
    }
    return null;
  };

  // Handle AI move with delay
  useEffect(() => {
    if (gameMode === 'playing' && !winnerInfo) {
      const currentPlayer = currentPlayers[currentPlayerIndex];
      if (currentPlayer?.isAI) {
        const aiMoveTimer = setTimeout(() => {
          const aiMove = makeAIMove(board, currentPlayer.symbol, currentPlayer.aiDifficulty);
          if (aiMove !== null) {
            handleMove(aiMove);
          }
        }, 1000); // 1 second delay for AI moves

        return () => clearTimeout(aiMoveTimer);
      }
    }
  }, [currentPlayerIndex, board, gameMode, winnerInfo]);

  // Navigate to player configuration
  const goToPlayerConfig = (players) => {
    playSound('click');
    setNumPlayers(players);
    setGameMode('config');
  };

  // Toggle player type (Human/AI)
  const togglePlayerType = (playerIndex) => {
    playSound('click');
    setPlayerSettings(prev => ({
      ...prev,
      [playerIndex]: {
        ...prev[playerIndex],
        isAI: !prev[playerIndex]?.isAI,
        aiDifficulty: prev[playerIndex]?.aiDifficulty || 'medium'
      }
    }));
  };

  // Change AI difficulty
  const changeAIDifficulty = (playerIndex, difficulty) => {
    playSound('click');
    setPlayerSettings(prev => ({
      ...prev,
      [playerIndex]: {
        ...prev[playerIndex],
        aiDifficulty: difficulty
      }
    }));
  };

  // Start game with configured players
  const startGame = () => {
    playSound('click');
    setGameMode('playing');
  };

  // Go back to selection
  const backToSelection = () => {
    playSound('click');
    setGameMode('selection');
    setWinnerInfo(null);
    setShowGameOverModal(false);
  };

  // Go back to config
  const backToConfig = () => {
    playSound('click');
    setGameMode('config');
    setWinnerInfo(null);
    setShowGameOverModal(false);
  };

  // Toggle mute function
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      // Play a confirmation sound when unmuting
      playSound('click');
    }
  };

  // Handle move
  const handleMove = (index) => {
    if (board[index] || winnerInfo) return;

    // Play move sound
    playSound('move');

    const newBoard = [...board];
    const currentPlayer = currentPlayers[currentPlayerIndex];
    newBoard[index] = currentPlayer.symbol;
    setBoard(newBoard);

    const gameResult = calculateWinner(newBoard, gridSize);
    if (gameResult) {
      setWinnerInfo(gameResult);
      // Play appropriate game end sound
      setTimeout(() => {
        if (gameResult.winner) {
          playSound('win');
        } else {
          playSound('draw');
        }
      }, 300);
      setTimeout(() => {
        setShowGameOverModal(true);
        animateModal();
      }, 500);
    } else {
      // Move to next player
      setCurrentPlayerIndex((currentPlayerIndex + 1) % numPlayers);
    }
  };

  // Animate modal entrance
  const animateModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Close modal
  const closeModal = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    setShowGameOverModal(false);
  };

  // Restart game
  const restartGame = () => {
    playSound('click');
    setBoard(Array(totalCells).fill(null));
    setCurrentPlayerIndex(0);
    setWinnerInfo(null);
    closeModal();
  };

  // Player Selection Screen
  if (gameMode === 'selection') {
    return (
      <View style={styles.selectionContainer}>
        <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
          <Text style={styles.muteButtonText}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
        
        <Text style={styles.selectionTitle}>Select Players</Text>
        
        <View style={styles.playerOptionsContainer}>
          {[2, 3, 4].map((playerCount) => (
            <TouchableOpacity
              key={playerCount}
              style={styles.playerOption}
              onPress={() => goToPlayerConfig(playerCount)}
            >
              <Text style={styles.playerOptionText}>{playerCount} Players</Text>
              <View style={styles.playerPreview}>
                {basePlayerConfigs[playerCount].map((player, index) => (
                  <View key={index} style={styles.previewPlayer}>
                    <Image source={player.image} style={[styles.previewImage, { tintColor: player.color }]} />
                    <Text style={[styles.previewText, { color: player.color }]}>{player.symbol}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.gridSizeText}>
                {playerCount === 2 ? '3×3 Grid' : '4×4 Grid'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // Player Configuration Screen
  if (gameMode === 'config') {
    return (
      <View style={styles.configScreenContainer}>
        <TouchableOpacity style={styles.backButton} onPress={backToSelection}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
          <Text style={styles.muteButtonText}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
        
        <Text style={styles.selectionTitle}>Configure Players</Text>
        
        <ScrollView style={styles.configScrollContainer} showsVerticalScrollIndicator={true}>
          <View style={styles.configContainer}>
            {basePlayerConfigs[numPlayers].map((player, index) => (
              <View key={index} style={styles.playerConfigCard}>
                <View style={styles.playerConfigHeader}>
                  <Image source={player.image} style={[styles.configPlayerImage, { tintColor: player.color }]} />
                  <Text style={[styles.configPlayerText, { color: player.color }]}>
                    {player.name}
                  </Text>
                </View>
                
                <View style={styles.playerTypeContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.playerTypeButton,
                      !playerSettings[index]?.isAI && styles.playerTypeButtonActive
                    ]}
                    onPress={() => togglePlayerType(index)}
                  >
                    <Text style={[
                      styles.playerTypeText,
                      !playerSettings[index]?.isAI && styles.playerTypeTextActive
                    ]}>
                      Human
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.playerTypeButton,
                      playerSettings[index]?.isAI && styles.playerTypeButtonActive
                    ]}
                    onPress={() => togglePlayerType(index)}
                  >
                    <Text style={[
                      styles.playerTypeText,
                      playerSettings[index]?.isAI && styles.playerTypeTextActive
                    ]}>
                      AI
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {playerSettings[index]?.isAI && (
                  <View style={styles.aiDifficultyContainer}>
                    <Text style={styles.difficultyLabel}>AI Difficulty:</Text>
                    <View style={styles.difficultyButtons}>
                      {['easy', 'medium', 'hard'].map((difficulty) => (
                        <TouchableOpacity
                          key={difficulty}
                          style={[
                            styles.difficultyButton,
                            playerSettings[index]?.aiDifficulty === difficulty && styles.difficultyButtonActive
                          ]}
                          onPress={() => changeAIDifficulty(index, difficulty)}
                        >
                          <Text style={[
                            styles.difficultyText,
                            playerSettings[index]?.aiDifficulty === difficulty && styles.difficultyTextActive
                          ]}>
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
        
        <TouchableOpacity style={styles.startGameButton} onPress={startGame}>
          <Text style={styles.startGameText}>Start Game</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Game Screen
  const currentPlayer = currentPlayers[currentPlayerIndex];
  const status = winnerInfo
    ? winnerInfo.winner
      ? `${winnerInfo.winner} Wins!`
      : "It's a Draw!"
    : `${currentPlayer.name}'s Turn`;

  return (
    <View style={styles.container}>
      {/* Back Button - Hidden when modal is showing */}
      {!showGameOverModal && (
        <TouchableOpacity style={styles.backButton} onPress={backToConfig}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}

      {/* Mute Button - Hidden when modal is showing */}
      {!showGameOverModal && (
        <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
          <Text style={styles.muteButtonText}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
      )}

      {/* Current Player Indicator */}
      {!winnerInfo && (
        <View style={[styles.currentPlayerContainer, { borderColor: currentPlayer.color }]}>
          <Image source={currentPlayer.image} style={[styles.currentPlayerImage, { tintColor: currentPlayer.color }]} />
          <Text style={[styles.currentPlayerText, { color: currentPlayer.color }]}>
            {currentPlayer.name}
          </Text>
        </View>
      )}

      {/* Status Text */}
      {status && <Text style={styles.status}>{status}</Text>}

      {/* Game Grid */}
      <View style={[styles.grid, { width: gridSize === 3 ? 360 : 400, height: gridSize === 3 ? 360 : 400 }]}>
        {board.map((val, i) => {
          const isWinning = winnerInfo && winnerInfo.line && winnerInfo.line.includes(i);
          const cellPlayer = currentPlayers.find(p => p.symbol === val);
          
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.cell,
                { 
                  width: `${(100 - (gridSize + 1) * 2) / gridSize}%`,
                  height: `${(100 - (gridSize + 1) * 2) / gridSize}%`,
                },
                isWinning && styles.winCell,
                !val && !winnerInfo && { borderColor: currentPlayer.color, borderWidth: 2 }
              ]}
              onPress={() => handleMove(i)}
              activeOpacity={0.7}
            >
              {val && cellPlayer && (
                <Image 
                  source={cellPlayer.image} 
                  style={[styles.cellImage, { tintColor: cellPlayer.color }]} 
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Restart Button */}
      <TouchableOpacity style={styles.restartBtn} onPress={restartGame}>
        <Text style={styles.restartBtnText}>Restart Game</Text>
      </TouchableOpacity>

      {/* Game Over Modal */}
      <Modal
        visible={showGameOverModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
            <Text style={styles.modalTitle}>Game Over!</Text>
            
            {winnerInfo?.winner ? (
              <View style={styles.winnerContainer}>
                <Text style={styles.modalSubtitle}>Winner:</Text>
                <View style={styles.winnerDisplay}>
                  {(() => {
                    const winner = currentPlayers.find(p => p.symbol === winnerInfo.winner);
                    return winner ? (
                      <>
                        <Image source={winner.image} style={[styles.winnerIcon, { tintColor: winner.color }]} />
                        <Text style={[styles.winnerText, { color: winner.color }]}>
                          {winner.name}
                        </Text>
                      </>
                    ) : null;
                  })()}
                </View>
              </View>
            ) : (
              <View style={styles.drawContainer}>
                <Text style={styles.modalSubtitle}>It's a Draw!</Text>
                <View style={styles.drawIcons}>
                  {currentPlayers.map((player, index) => (
                    <React.Fragment key={index}>
                      <Image source={player.image} style={[styles.drawIcon, { tintColor: player.color }]} />
                      {index < currentPlayers.length - 1 && (
                        <Text style={styles.drawVersus}>vs</Text>
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalRestartBtn} onPress={restartGame}>
                <Text style={styles.modalRestartText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={backToSelection}>
                <Text style={styles.modalCloseText}>New Game</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// Calculate winner for any grid size
function calculateWinner(squares, gridSize) {
  const lines = [];
  
  // Generate all possible winning lines for any grid size
  // Horizontal lines
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col <= gridSize - 3; col++) {
      const line = [];
      for (let i = 0; i < 3; i++) {
        line.push(row * gridSize + col + i);
      }
      lines.push(line);
    }
  }
  
  // Vertical lines
  for (let col = 0; col < gridSize; col++) {
    for (let row = 0; row <= gridSize - 3; row++) {
      const line = [];
      for (let i = 0; i < 3; i++) {
        line.push((row + i) * gridSize + col);
      }
      lines.push(line);
    }
  }
  
  // Diagonal lines (top-left to bottom-right)
  for (let row = 0; row <= gridSize - 3; row++) {
    for (let col = 0; col <= gridSize - 3; col++) {
      const line = [];
      for (let i = 0; i < 3; i++) {
        line.push((row + i) * gridSize + col + i);
      }
      lines.push(line);
    }
  }
  
  // Diagonal lines (top-right to bottom-left)
  for (let row = 0; row <= gridSize - 3; row++) {
    for (let col = 2; col < gridSize; col++) {
      const line = [];
      for (let i = 0; i < 3; i++) {
        line.push((row + i) * gridSize + col - i);
      }
      lines.push(line);
    }
  }

  // Check for winner
  for (let [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c], type: 'winner' };
    }
  }
  
  // Check for draw
  if (squares.every(Boolean)) return { winner: null, line: null, type: 'draw' };
  
  return null;
}

const styles = StyleSheet.create({
  // Selection Screen Styles
  selectionContainer: {
    flex: 1,
    backgroundColor: "#4A4A4A",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  configScreenContainer: {
    flex: 1,
    backgroundColor: "#4A4A4A",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 100 : 80, // Extra padding for back button
  },
  selectionTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 48,
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  playerOptionsContainer: {
    width: "100%",
    alignItems: "center",
  },
  playerOption: {
    backgroundColor: "#2F2F2F",
    borderWidth: 6,
    borderTopColor: "#5A5A5A",
    borderLeftColor: "#5A5A5A",
    borderRightColor: "#1A1A1A",
    borderBottomColor: "#1A1A1A",
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    width: "90%",
    maxWidth: 300,
  },
  playerOptionText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  playerPreview: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  previewPlayer: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  previewImage: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    fontWeight: "900",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  gridSizeText: {
    fontSize: 16,
    color: "#CCCCCC",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },

  // Game Screen Styles
  container: {
    flex: 1,
    backgroundColor: "#4A4A4A",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 100 : 80, // Extra padding for back button
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    backgroundColor: "#8B4513",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 4,
    borderTopColor: "#B8762A",
    borderLeftColor: "#B8762A",
    borderRightColor: "#5A3300",
    borderBottomColor: "#5A3300",
    zIndex: 1000, // Ensure it's above other elements
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  muteButton: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    backgroundColor: "#8B4513",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 4,
    borderTopColor: "#B8762A",
    borderLeftColor: "#B8762A",
    borderRightColor: "#5A3300",
    borderBottomColor: "#5A3300",
    zIndex: 1000, // Ensure it's above other elements
  },
  muteButtonText: {
    fontSize: 18,
    textAlign: "center",
  },
  currentPlayerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2F2F2F",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 4,
    marginBottom: 20,
  },
  currentPlayerImage: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  currentPlayerText: {
    fontSize: 18,
    fontWeight: "900",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "transparent", // Remove dark background
    borderWidth: 0, // Remove border completely
    padding: 0, // Removed padding for uniform spacing
    marginBottom: 30,
    alignSelf: "center", // Center the grid horizontally
    justifyContent: "center", // Center content within grid
  },
  cell: {
    backgroundColor: "#4A4A4A",
    borderWidth: 2, // Made uniform and thinner
    borderColor: "#6A6A6A", // Single uniform border
    justifyContent: "center",
    alignItems: "center",
    margin: 0, // Removed margin for uniform spacing
  },
  winCell: {
    backgroundColor: "#D4AF37",
    borderWidth: 3, // Uniform border for winning cells
    borderColor: "#F4CF57", // Single uniform gold border
  },
  cellImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  restartBtn: {
    backgroundColor: "#2D5A2D",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 6,
    borderTopColor: "#4A8A4A",
    borderLeftColor: "#4A8A4A",
    borderRightColor: "#1A3A1A",
    borderBottomColor: "#1A3A1A",
  },
  restartBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#2F2F2F",
    borderWidth: 8,
    borderTopColor: "#5A5A5A",
    borderLeftColor: "#5A5A5A",
    borderRightColor: "#1A1A1A",
    borderBottomColor: "#1A1A1A",
    padding: 24,
    alignItems: "center",
    maxWidth: 320,
    width: "100%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#CCCCCC",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  winnerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  winnerDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A4A4A",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 4,
    borderTopColor: "#6A6A6A",
    borderLeftColor: "#6A6A6A",
    borderRightColor: "#2A2A2A",
    borderBottomColor: "#2A2A2A",
  },
  winnerIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  winnerText: {
    fontSize: 20,
    fontWeight: "900",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  drawContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  drawIcons: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A4A4A",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 4,
    borderTopColor: "#6A6A6A",
    borderLeftColor: "#6A6A6A",
    borderRightColor: "#2A2A2A",
    borderBottomColor: "#2A2A2A",
  },
  drawIcon: {
    width: 24,
    height: 24,
    marginHorizontal: 4,
  },
  drawVersus: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginHorizontal: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  modalRestartBtn: {
    flex: 1,
    backgroundColor: "#2D5A2D",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 4,
    borderTopColor: "#4A8A4A",
    borderLeftColor: "#4A8A4A",
    borderRightColor: "#1A3A1A",
    borderBottomColor: "#1A3A1A",
  },
  modalRestartText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  modalCloseBtn: {
    flex: 1,
    backgroundColor: "#8B4513",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 4,
    borderTopColor: "#B8762A",
    borderLeftColor: "#B8762A",
    borderRightColor: "#5A3300",
    borderBottomColor: "#5A3300",
  },
  modalCloseText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },

  // Player Configuration Styles
  configScrollContainer: {
    flex: 1,
    width: "100%",
    marginBottom: 20,
  },
  configContainer: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  playerConfigCard: {
    backgroundColor: "#2F2F2F",
    borderWidth: 4,
    borderColor: "#5A5A5A",
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  playerConfigHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  configPlayerImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  configPlayerText: {
    fontSize: 20,
    fontWeight: "900",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  playerTypeContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  playerTypeButton: {
    backgroundColor: "#4A4A4A",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: "#6A6A6A",
  },
  playerTypeButtonActive: {
    backgroundColor: "#D4AF37",
    borderColor: "#F4CF57",
  },
  playerTypeText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  playerTypeTextActive: {
    color: "#000000",
  },
  aiDifficultyContainer: {
    alignItems: "center",
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#CCCCCC",
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  difficultyButtons: {
    flexDirection: "row",
  },
  difficultyButton: {
    backgroundColor: "#4A4A4A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    borderWidth: 2,
    borderColor: "#6A6A6A",
  },
  difficultyButtonActive: {
    backgroundColor: "#3F7FBF",
    borderColor: "#5F9FDF",
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  difficultyTextActive: {
    color: "#000000",
  },
  startGameButton: {
    backgroundColor: "#2D5A2D",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 6,
    borderTopColor: "#4A8A4A",
    borderLeftColor: "#4A8A4A",
    borderRightColor: "#1A3A1A",
    borderBottomColor: "#1A3A1A",
    marginTop: 20,
  },
  startGameText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});

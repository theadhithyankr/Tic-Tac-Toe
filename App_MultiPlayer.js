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
} from "react-native";

export default function App() {
  // Game states
  const [gameMode, setGameMode] = useState('selection'); // 'selection' or 'playing'
  const [numPlayers, setNumPlayers] = useState(2);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [board, setBoard] = useState([]);
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  
  // Player configurations
  const playerConfigs = {
    2: [
      { symbol: 'X', color: '#3F7FBF', name: 'Player 1', image: require('./x.png') },
      { symbol: 'O', color: '#BF3F3F', name: 'Player 2', image: require('./o.png') }
    ],
    3: [
      { symbol: 'X', color: '#3F7FBF', name: 'Player 1', image: require('./x.png') },
      { symbol: 'O', color: '#BF3F3F', name: 'Player 2', image: require('./o.png') },
      { symbol: '□', color: '#2D5A2D', name: 'Player 3', image: require('./square.png') }
    ],
    4: [
      { symbol: 'X', color: '#3F7FBF', name: 'Player 1', image: require('./x.png') },
      { symbol: 'O', color: '#BF3F3F', name: 'Player 2', image: require('./o.png') },
      { symbol: '□', color: '#2D5A2D', name: 'Player 3', image: require('./square.png') },
      { symbol: '△', color: '#D4AF37', name: 'Player 4', image: require('./triangle.png') }
    ]
  };

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Get current players and grid size
  const currentPlayers = playerConfigs[numPlayers];
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

  // Start game with selected number of players
  const startGame = (players) => {
    setNumPlayers(players);
    setGameMode('playing');
  };

  // Go back to selection
  const backToSelection = () => {
    setGameMode('selection');
    setWinnerInfo(null);
    setShowGameOverModal(false);
  };

  // Handle move
  const handleMove = (index) => {
    if (board[index] || winnerInfo) return;

    const newBoard = [...board];
    const currentPlayer = currentPlayers[currentPlayerIndex];
    newBoard[index] = currentPlayer.symbol;
    setBoard(newBoard);

    const gameResult = calculateWinner(newBoard, gridSize);
    if (gameResult) {
      setWinnerInfo(gameResult);
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
    setBoard(Array(totalCells).fill(null));
    setCurrentPlayerIndex(0);
    setWinnerInfo(null);
    closeModal();
  };

  // Player Selection Screen
  if (gameMode === 'selection') {
    return (
      <View style={styles.selectionContainer}>
        <Text style={styles.selectionTitle}>Select Players</Text>
        
        <View style={styles.playerOptionsContainer}>
          {[2, 3, 4].map((playerCount) => (
            <TouchableOpacity
              key={playerCount}
              style={styles.playerOption}
              onPress={() => startGame(playerCount)}
            >
              <Text style={styles.playerOptionText}>{playerCount} Players</Text>
              <View style={styles.playerPreview}>
                {playerConfigs[playerCount].map((player, index) => (
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

  // Game Screen
  const currentPlayer = currentPlayers[currentPlayerIndex];
  const status = winnerInfo
    ? winnerInfo.winner
      ? `${winnerInfo.winner} Wins!`
      : "It's a Draw!"
    : `${currentPlayer.name}'s Turn`;

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={backToSelection}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

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
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    backgroundColor: "#8B4513",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 4,
    borderTopColor: "#B8762A",
    borderLeftColor: "#B8762A",
    borderRightColor: "#5A3300",
    borderBottomColor: "#5A3300",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
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
    backgroundColor: "#2F2F2F",
    borderWidth: 8,
    borderTopColor: "#5A5A5A",
    borderLeftColor: "#5A5A5A",
    borderRightColor: "#1A1A1A",
    borderBottomColor: "#1A1A1A",
    padding: 8,
    marginBottom: 30,
  },
  cell: {
    backgroundColor: "#4A4A4A",
    borderWidth: 4,
    borderTopColor: "#6A6A6A",
    borderLeftColor: "#6A6A6A",
    borderRightColor: "#2A2A2A",
    borderBottomColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
  },
  winCell: {
    backgroundColor: "#D4AF37",
    borderTopColor: "#F4CF57",
    borderLeftColor: "#F4CF57",
    borderRightColor: "#B48F17",
    borderBottomColor: "#B48F17",
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
});

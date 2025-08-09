import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform, Image, Animated, Modal } from "react-native";

export default function App() {
  const EMPTY = Array(9).fill(null);
  const [board, setBoard] = useState(EMPTY);
  const [xIsNext, setXIsNext] = useState(true);
  const [winnerInfo, setWinnerInfo] = useState(null); // {winner: 'X'|'O', line: [i,i,i]}
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  
  // Animation values for the toggle switch
  const toggleAnimation = useRef(new Animated.Value(0)).current;
  const backgroundColorAnimation = useRef(new Animated.Value(0)).current;
  const modalAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const info = calculateWinner(board);
    
    setWinnerInfo(info);
    
    if (info) {
      setShowGameOverModal(true);
      // Animate modal entrance
      Animated.spring(modalAnimation, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [board]);

  // Animate toggle switch when player changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(toggleAnimation, {
        toValue: xIsNext ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(backgroundColorAnimation, {
        toValue: xIsNext ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  }, [xIsNext]);

  function handleMove(i) {
    if (winnerInfo || board[i]) return; // game over or occupied
    const newBoard = board.slice();
    newBoard[i] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  function restart() {
    setBoard(EMPTY);
    setXIsNext(true);
    setWinnerInfo(null);
    setShowGameOverModal(false);
    modalAnimation.setValue(0);
  }

  function closeModal() {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowGameOverModal(false);
    });
  }

  // Animated background color based on current player - 8-bit colors
  const animatedBackgroundColor = backgroundColorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 136, 252, 0.1)', 'rgba(248, 56, 0, 0.1)'] // NES blue to NES red
  });

  // Toggle switch position animation for 8-bit sized track
  const togglePosition = toggleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 48] // Adjusted for smaller 8-bit track
  });

  const status = winnerInfo
    ? winnerInfo.winner
      ? `Winner: ${winnerInfo.winner}`
      : "Draw"
    : "";

  return (
    <Animated.View style={[styles.container, { backgroundColor: animatedBackgroundColor }]}>
      {/* Animated Toggle Switch for Next Player */}
      {!winnerInfo && (
        <View style={styles.toggleContainer}>
          <Text style={styles.nextPlayerText}>Next Player</Text>
          <View style={styles.toggleTrack}>
            <Animated.View style={[styles.toggleThumb, { left: togglePosition }]}>
              <Image 
                source={xIsNext ? require('./x.png') : require('./o.png')} 
                style={styles.toggleIcon}
              />
            </Animated.View>
            
            {/* Background images for X and O */}
            <View style={styles.toggleBackground}>
              <Image source={require('./x.png')} style={[styles.toggleBgIcon, { opacity: xIsNext ? 0.3 : 0.1 }]} />
              <Image source={require('./o.png')} style={[styles.toggleBgIcon, { opacity: !xIsNext ? 0.3 : 0.1 }]} />
            </View>
          </View>
        </View>
      )}
      
      {/* Status Text (Winner or Draw) */}
      {status && <Text style={styles.status}>{status}</Text>}

      <View style={styles.grid}>
        {board.map((val, i) => {
          const isWinning = winnerInfo && winnerInfo.line && winnerInfo.line.includes(i);
          
          // Dynamic cell styling based on current player's turn
          const getTurnBasedStyle = () => {
            if (isWinning) return styles.winCell;
            if (val) return styles.cell; // Occupied cells keep default style
            
            // Empty cells get highlighted based on current player's turn
            return xIsNext ? styles.xTurnCell : styles.oTurnCell;
          };
          
          return (
            <TouchableOpacity
              key={i}
              style={[styles.cell, getTurnBasedStyle()]}
              onPress={() => handleMove(i)}
              activeOpacity={0.7}
            >
              {/* Using x.png and o.png images */}
              {val === "X" && (
                <Image source={require('./x.png')} style={styles.cellImage} />
              )}
              {val === "O" && (
                <Image source={require('./o.png')} style={styles.cellImage} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.restartBtn} onPress={restart}>
        <Text style={styles.restartText}>Restart</Text>
      </TouchableOpacity>

      {/* Custom Game Over Modal */}
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
              transform: [
                {
                  scale: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  })
                },
                {
                  translateY: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  })
                }
              ],
              opacity: modalAnimation,
            }
          ]}>
            {/* Modal Content */}
            <Text style={styles.modalTitle}>Game Over!</Text>
            
            {winnerInfo && winnerInfo.winner ? (
              <View style={styles.winnerContainer}>
                <Text style={styles.modalSubtitle}>Winner:</Text>
                <View style={styles.winnerDisplay}>
                  <Image 
                    source={winnerInfo.winner === 'X' ? require('./x.png') : require('./o.png')} 
                    style={styles.winnerIcon}
                  />
                  <Text style={[
                    styles.winnerText,
                    winnerInfo.winner === 'X' ? styles.xWinnerText : styles.oWinnerText
                  ]}>
                    {winnerInfo.winner}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.drawContainer}>
                <Text style={styles.modalSubtitle}>It's a Draw!</Text>
                <View style={styles.drawIcons}>
                  <Image source={require('./x.png')} style={styles.drawIcon} />
                  <Text style={styles.drawVersus}>vs</Text>
                  <Image source={require('./o.png')} style={styles.drawIcon} />
                </View>
              </View>
            )}
            
            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalRestartBtn} onPress={restart}>
                <Text style={styles.modalRestartText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={closeModal}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </Animated.View>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  
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
  container: {
    flex: 1,
    backgroundColor: "#4A4A4A", // Minecraft stone gray
    alignItems: "center",
    justifyContent: "center",
    padding: 24, // Increased padding
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
  },
  // Minecraft-style pixelated X and O for title
  pixelTitleX: {
    fontSize: 40, // Increased from 32
    fontWeight: "900",
    color: "#3F7FBF", // Minecraft blue
    marginHorizontal: 12, // Increased spacing
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#1A1A1A",
    textShadowOffset: { width: 3, height: 3 }, // Bigger shadow
    textShadowRadius: 0,
  },
  pixelTitleO: {
    fontSize: 40, // Increased from 32
    fontWeight: "900", 
    color: "#BF3F3F", // Minecraft red
    marginHorizontal: 12, // Increased spacing
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#1A1A1A",
    textShadowOffset: { width: 3, height: 3 }, // Bigger shadow
    textShadowRadius: 0,
  },
  toggleContainer: {
    alignItems: "center",
    marginBottom: 32, // Increased margin
    backgroundColor: "#2F2F2F", // Dark stone
    paddingVertical: 16, // Increased padding
    paddingHorizontal: 24, // Increased padding
    borderWidth: 8, // Thicker border
    borderTopColor: "#5A5A5A",
    borderLeftColor: "#5A5A5A",
    borderRightColor: "#1A1A1A",
    borderBottomColor: "#1A1A1A",
  },
  nextPlayerText: {
    fontSize: 16, // Increased from 14
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12, // Increased margin
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 3 }, // Bigger shadow
    textShadowRadius: 0,
  },
  toggleTrack: {
    width: 120, // Expanded from 88
    height: 56, // Expanded from 40
    backgroundColor: "#1A1A1A", // Very dark
    borderRadius: 0,
    borderWidth: 6, // Thicker border
    borderTopColor: "#0A0A0A", // Inset shadow
    borderLeftColor: "#0A0A0A",
    borderRightColor: "#3A3A3A", // Highlight
    borderBottomColor: "#3A3A3A",
    position: "relative",
    justifyContent: "center",
  },
  toggleThumb: {
    width: 44, // Expanded from 32
    height: 44, // Expanded from 32
    backgroundColor: "#CCCCCC", // Light stone
    borderRadius: 0,
    borderWidth: 6, // Thicker border
    borderTopColor: "#FFFFFF", // 3D highlight
    borderLeftColor: "#FFFFFF",
    borderRightColor: "#888888", // 3D shadow
    borderBottomColor: "#888888",
    position: "absolute",
    top: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  // Pixelated toggle icons
  pixelToggleX: {
    fontSize: 20,
    fontWeight: "900",
    color: "#3F7FBF", // Minecraft blue
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#1A1A1A",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  pixelToggleO: {
    fontSize: 20,
    fontWeight: "900",
    color: "#BF3F3F", // Minecraft red
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#1A1A1A",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  toggleBackground: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    height: "100%",
  },
  toggleBgIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },
  status: {
    fontSize: 18, // Increased from 16
    marginBottom: 20, // Increased margin
    color: "#FCFCFC",
    fontWeight: "400",
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 360, // Expanded from 288
    height: 360, // Expanded from 288
    backgroundColor: "#2F2F2F", // Dark stone
    borderRadius: 0,
    borderWidth: 8,
    borderTopColor: "#5A5A5A",
    borderLeftColor: "#5A5A5A",
    borderRightColor: "#1A1A1A",
    borderBottomColor: "#1A1A1A",
    padding: 12, // Increased padding
  },
  cell: {
    width: "31.11%",
    height: "31.11%",
    margin: "1.11%",
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A4A4A", // Stone cell
    borderWidth: 6, // Thicker borders
    borderTopColor: "#6A6A6A",
    borderLeftColor: "#6A6A6A",
    borderRightColor: "#2A2A2A",
    borderBottomColor: "#2A2A2A",
  },
  winCell: {
    backgroundColor: "#7D4C0A", // Minecraft gold/orange
    borderTopColor: "#A66D00",
    borderLeftColor: "#A66D00",
    borderRightColor: "#5A3300",
    borderBottomColor: "#5A3300",
  },
  xTurnCell: {
    backgroundColor: "#3F7FBF", // Minecraft blue
    borderTopColor: "#5F9FDF",
    borderLeftColor: "#5F9FDF",
    borderRightColor: "#1F4F7F",
    borderBottomColor: "#1F4F7F",
  },
  oTurnCell: {
    backgroundColor: "#BF3F3F", // Minecraft red
    borderTopColor: "#DF5F5F",
    borderLeftColor: "#DF5F5F",
    borderRightColor: "#7F1F1F",
    borderBottomColor: "#7F1F1F",
  },
  cellText: {
    fontSize: 40,
    fontWeight: "900", // Bold for pixel look
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  xMark: {
    color: "#3F7FBF", // Minecraft blue
  },
  oMark: {
    color: "#BF3F3F", // Minecraft red
  },
  cellImage: {
    width: 56, // Increased from 44
    height: 56, // Increased from 44
    resizeMode: "contain",
  },
  toggleIcon: {
    width: 28, // Increased from 20
    height: 28, // Increased from 20
    resizeMode: "contain",
  },
  toggleBgIcon: {
    width: 20, // Increased from 16
    height: 20, // Increased from 16
    resizeMode: "contain",
  },
  titleIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginHorizontal: 4,
  },
  restartBtn: {
    marginTop: 40, // Increased margin
    backgroundColor: "#2D5A2D", // Minecraft green
    paddingVertical: 16, // Increased padding
    paddingHorizontal: 32, // Increased padding
    borderRadius: 0,
    borderWidth: 8, // Thicker border
    borderTopColor: "#4A8A4A",
    borderLeftColor: "#4A8A4A",
    borderRightColor: "#1A3A1A",
    borderBottomColor: "#1A3A1A",
    alignItems: "center",
  },
  restartBtnText: {
    color: "#FFFFFF",
    fontSize: 18, // Increased font size
    fontWeight: "900",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 3 }, // Bigger shadow
    textShadowRadius: 0,
  },
  // Style for custom images - 8-bit pixel art
  iconImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  xImageTint: {
    tintColor: "#0088FC", // NES blue
  },
  oImageTint: {
    tintColor: "#F83800", // NES red
  },
  
  // Minecraft Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContainer: {
    backgroundColor: "#2F2F2F", // Dark stone
    borderRadius: 0,
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
    backgroundColor: "#4A4A4A", // Stone gray
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 4,
    borderTopColor: "#6A6A6A",
    borderLeftColor: "#6A6A6A",
    borderRightColor: "#2A2A2A",
    borderBottomColor: "#2A2A2A",
  },
  winnerIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginRight: 8,
  },
  winnerText: {
    fontSize: 28,
    fontWeight: "900",
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  xWinnerText: {
    color: "#3F7FBF", // Minecraft blue
  },
  oWinnerText: {
    color: "#BF3F3F", // Minecraft red
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
    borderRadius: 0,
    borderWidth: 4,
    borderTopColor: "#6A6A6A",
    borderLeftColor: "#6A6A6A",
    borderRightColor: "#2A2A2A",
    borderBottomColor: "#2A2A2A",
  },
  drawIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  drawVersus: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginHorizontal: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  modalRestartBtn: {
    flex: 1,
    backgroundColor: "#2D5A2D", // Minecraft green
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 0,
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
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  modalCloseBtn: {
    flex: 1,
    backgroundColor: "#8B4513", // Minecraft brown/wood
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 0,
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
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});

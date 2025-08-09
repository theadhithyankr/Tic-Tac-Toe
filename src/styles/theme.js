/**
 * Global Styles and Theme
 * Minecraft-inspired pixelated theme with consistent styling
 */

import { StyleSheet, Platform } from 'react-native';

// Theme colors
export const COLORS = {
  background: '#4A4A4A',
  cardBackground: '#2F2F2F',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  border: '#6A6A6A',
  borderLight: '#5A5A5A',
  borderDark: '#1A1A1A',
  buttonGreen: '#2D5A2D',
  buttonGreenLight: '#4A8A4A',
  buttonGreenDark: '#1A3A1A',
  buttonBrown: '#8B4513',
  buttonBrownLight: '#B8762A',
  buttonBrownDark: '#5A3300',
  gold: '#D4AF37',
  goldLight: '#F4CF57',
};

// Typography
export const FONTS = {
  pixel: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

// Common styles
export const styles = StyleSheet.create({
  // Containers
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  
  card: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 6,
    borderTopColor: COLORS.borderLight,
    borderLeftColor: COLORS.borderLight,
    borderRightColor: COLORS.borderDark,
    borderBottomColor: COLORS.borderDark,
    padding: 20,
    alignItems: 'center',
  },
  
  // Typography
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    fontFamily: FONTS.pixel,
    textShadowColor: '#000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  
  subtitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    fontFamily: FONTS.pixel,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  
  bodyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontFamily: FONTS.pixel,
  },
  
  // Buttons
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 4,
    alignItems: 'center',
  },
  
  buttonGreen: {
    backgroundColor: COLORS.buttonGreen,
    borderTopColor: COLORS.buttonGreenLight,
    borderLeftColor: COLORS.buttonGreenLight,
    borderRightColor: COLORS.buttonGreenDark,
    borderBottomColor: COLORS.buttonGreenDark,
  },
  
  buttonBrown: {
    backgroundColor: COLORS.buttonBrown,
    borderTopColor: COLORS.buttonBrownLight,
    borderLeftColor: COLORS.buttonBrownLight,
    borderRightColor: COLORS.buttonBrownDark,
    borderBottomColor: COLORS.buttonBrownDark,
  },
  
  buttonText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    fontFamily: FONTS.pixel,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  
  // Game grid
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    marginBottom: 30,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  
  gameCell: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  
  winningCell: {
    backgroundColor: COLORS.gold,
    borderWidth: 3,
    borderColor: COLORS.goldLight,
  },
  
  cellImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  
  modalContainer: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 8,
    borderTopColor: COLORS.borderLight,
    borderLeftColor: COLORS.borderLight,
    borderRightColor: COLORS.borderDark,
    borderBottomColor: COLORS.borderDark,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  
  // Utility styles
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  flexRowSpaced: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  marginBottom: {
    marginBottom: 16,
  },
  
  marginTop: {
    marginTop: 16,
  },
});

// Responsive sizing functions
export function getResponsiveSize(baseSize, screenWidth) {
  const scale = screenWidth > 400 ? 1.2 : 1;
  return baseSize * scale;
}

export function getGridCellSize(gridSize, screenWidth) {
  const availableSpace = Math.min(screenWidth - 48, 400); // 24px padding on each side
  const cellSize = availableSpace / gridSize;
  return Math.floor(cellSize);
}

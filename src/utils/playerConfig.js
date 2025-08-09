/**
 * Player Configurations
 * Defines player symbols, colors, and game settings
 */

// Base player configurations for different player counts
export const BASE_PLAYER_CONFIGS = {
  2: [
    { 
      symbol: 'X', 
      color: '#3F7FBF', 
      name: 'Player 1', 
      image: require('../../assets/images/x.png') 
    },
    { 
      symbol: 'O', 
      color: '#BF3F3F', 
      name: 'Player 2', 
      image: require('../../assets/images/o.png') 
    }
  ],
  3: [
    { 
      symbol: 'X', 
      color: '#3F7FBF', 
      name: 'Player 1', 
      image: require('../../assets/images/x.png') 
    },
    { 
      symbol: 'O', 
      color: '#BF3F3F', 
      name: 'Player 2', 
      image: require('../../assets/images/o.png') 
    },
    { 
      symbol: '□', 
      color: '#2D5A2D', 
      name: 'Player 3', 
      image: require('../../assets/images/square.png') 
    }
  ],
  4: [
    { 
      symbol: 'X', 
      color: '#3F7FBF', 
      name: 'Player 1', 
      image: require('../../assets/images/x.png') 
    },
    { 
      symbol: 'O', 
      color: '#BF3F3F', 
      name: 'Player 2', 
      image: require('../../assets/images/o.png') 
    },
    { 
      symbol: '□', 
      color: '#2D5A2D', 
      name: 'Player 3', 
      image: require('../../assets/images/square.png') 
    },
    { 
      symbol: '△', 
      color: '#D4AF37', 
      name: 'Player 4', 
      image: require('../../assets/images/triangle.png') 
    }
  ]
};

/**
 * Get grid size based on number of players
 * @param {number} numPlayers - Number of players
 * @returns {number} Grid size
 */
export function getGridSize(numPlayers) {
  return numPlayers === 2 ? 3 : 4;
}

/**
 * Get total cells based on grid size
 * @param {number} gridSize - Grid size
 * @returns {number} Total number of cells
 */
export function getTotalCells(gridSize) {
  return gridSize * gridSize;
}

/**
 * Create player configuration with AI settings
 * @param {Array} basePlayers - Base player configurations
 * @param {Object} playerSettings - AI settings for each player
 * @returns {Array} Complete player configurations
 */
export function createPlayerConfig(basePlayers, playerSettings) {
  return basePlayers.map((player, index) => ({
    ...player,
    isAI: playerSettings[index]?.isAI || false,
    aiDifficulty: playerSettings[index]?.aiDifficulty || 'medium',
    name: playerSettings[index]?.isAI 
      ? `AI ${player.name.split(' ')[1]} (${playerSettings[index]?.aiDifficulty})` 
      : player.name
  }));
}

/**
 * Initialize default player settings
 * @param {number} numPlayers - Number of players
 * @returns {Object} Default player settings
 */
export function initializePlayerSettings(numPlayers) {
  const settings = {};
  for (let i = 0; i < numPlayers; i++) {
    settings[i] = { isAI: false, aiDifficulty: 'medium' };
  }
  return settings;
}

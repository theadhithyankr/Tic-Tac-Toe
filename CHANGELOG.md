# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-09

### Added
- Multi-player Tic-Tac-Toe support (2, 3, or 4 players)
- Dynamic grid sizing (3×3 for 2 players, 4×4 for 3-4 players)
- AI opponents with three difficulty levels (Easy, Medium, Hard)
- Minecraft-inspired pixelated theme
- Custom player symbols (X, O, □, △) with unique colors
- Sound effects and haptic feedback
- Smooth animations and modal transitions
- Player configuration system
- Win detection for all grid sizes
- Game state management
- Professional project structure

### Features
- **Game Modes**: Support for 2-4 players with mixed human/AI gameplay
- **AI System**: Strategic AI with win/block detection and positional preferences
- **Audio/Haptics**: Sound effects for moves, wins, and interactions with haptic feedback
- **Responsive Design**: Optimized for mobile devices with touch interactions
- **Visual Feedback**: Winning combinations highlighted with animations

### Technical
- React Native with Expo framework
- Expo Audio for sound effects
- Expo Haptics for tactile feedback
- Modular code architecture
- Comprehensive game logic utilities
- Cross-platform compatibility (iOS, Android, Web)

### Game Logic
- Dynamic win detection algorithm for any grid size
- AI move calculation with multiple difficulty levels
- Turn-based gameplay with visual indicators
- Draw detection and game over handling

## [Unreleased]

### Planned Features
- Online multiplayer support
- Statistics tracking and player profiles
- Additional themes and customization options
- Tournament mode
- Power-ups and special moves
- Larger grid sizes (5×5, 6×6)

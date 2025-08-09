# 🎮 Minecraft-Style Tic Tac Toe

A modern, multi-player Tic-Tac-Toe game built with React Native and Expo, featuring Minecraft-inspired pixelated design, AI opponents, and immersive sound effects.

## ✨ Features

### 🎯 Game Modes
- **2-4 Players**: Support for 2, 3, or 4 players
- **Dynamic Grid**: 3×3 grid for 2 players, 4×4 grid for 3-4 players
- **AI Opponents**: Three difficulty levels (Easy, Medium, Hard)
- **Mixed Play**: Combine human and AI players in the same game

### 🎨 Design & UX
- **Minecraft Theme**: Pixelated, retro-style interface
- **Custom Symbols**: X, O, □, △ with unique colors
- **Smooth Animations**: Modal transitions and UI feedback
- **Responsive Design**: Optimized for mobile devices

### 🔊 Audio & Feedback
- **Sound Effects**: Move placement, victory, and button sounds
- **Haptic Feedback**: Tactile responses on mobile devices
- **Visual Feedback**: Winning combinations highlighted

### 🤖 AI System
- **Easy**: Random move selection
- **Medium**: Basic strategy with win/block detection
- **Hard**: Advanced strategy including center and corner preferences

## 📱 Screenshots

*Add screenshots here when available*

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/theadhithyankr/Tic-Tac-Toe.git
   cd Tic-Tac-Toe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Install the Expo Go app on your mobile device
   - Scan the QR code displayed in your terminal
   - Or run on an emulator

### Building for Production

To create a standalone app:

```bash
npx expo build:android
# or
npx expo build:ios
```

## 🎮 How to Play

1. **Select Players**: Choose 2, 3, or 4 players
2. **Configure Players**: Set each player as Human or AI with difficulty
3. **Play**: Take turns placing your symbol on the grid
4. **Win**: Get three symbols in a row (horizontally, vertically, or diagonally)

## 🏗️ Project Structure

```
TicTacToe/
├── assets/
│   ├── images/          # Game symbols and icons
│   └── sounds/          # Audio files
├── src/
│   ├── components/      # Reusable components
│   ├── utils/           # Game logic and helpers
│   └── styles/          # Styling constants
├── App.js               # Main application component
├── app.json             # Expo configuration
└── package.json         # Dependencies and scripts
```

## 🛠️ Technologies Used

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **Expo Audio**: Sound effects and audio management
- **Expo Haptics**: Tactile feedback
- **JavaScript ES6+**: Modern JavaScript features

## 🎯 Game Logic

### Win Detection
- Supports dynamic grid sizes (3×3 and 4×4)
- Detects horizontal, vertical, and diagonal wins
- Handles multiple player scenarios

### AI Strategy
- **Easy**: Random valid moves
- **Medium**: Win if possible, block opponent wins, then random
- **Hard**: Win > Block > Center > Corner > Random

## 📈 Future Enhancements

- [ ] Online multiplayer support
- [ ] Tournament mode
- [ ] Statistics tracking
- [ ] Additional themes
- [ ] Power-ups and special moves
- [ ] Larger grid sizes (5×5, 6×6)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Adhithyan K R**
- GitHub: [@theadhithyankr](https://github.com/theadhithyankr)

## 🙏 Acknowledgments

- Minecraft for design inspiration
- React Native and Expo communities
- Contributors and testers

---

*Built with ❤️ using React Native and Expo*

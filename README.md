# TaskQuest

A gamified task management application that combines productivity with RPG elements. Complete tasks, earn rewards, and level up your character while staying organized.

## Features

- 🎮 RPG-style character progression
- ✅ Task management with rewards
- 🏆 Achievement system
- 🎯 Combat visualization
- 💰 Reward distribution
- 🎵 Sound effects and animations
- 📱 Offline support
- 🔄 Automatic data synchronization
- 👥 Party system for collaboration

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (comes with Node.js)
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development) or Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Snicertenu/TaskQuest.git
cd TaskQuest
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Running the App

- **Physical Device**: Scan the QR code with the Expo Go app
- **Android Emulator**: Press 'a' in the terminal
- **iOS Simulator** (macOS only): Press 'i' in the terminal
- **Web Browser**: Press 'w' in the terminal

### Development

- Press 'r' to reload the app
- Press 'm' to toggle the menu
- Press 'j' to open the debugger
- Press 'c' to show the QR code again

## Building for Production

```bash
# For Android
expo build:android

# For iOS (requires macOS)
expo build:ios

# For web
expo build:web
```

## Project Structure

```
TaskQuest/
├── src/
│   ├── components/     # React components
│   ├── screens/        # Screen components
│   ├── services/       # Business logic and API calls
│   ├── contexts/       # React contexts
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── config/         # Configuration files
├── assets/            # Static assets
└── tests/             # Test files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- React Native
- Expo
- Firebase
- TypeScript 
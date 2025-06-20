# SRT Stream Manager

A modern, cross-platform desktop application for managing SRT (Secure Reliable Transport) streams with a beautiful macOS-inspired interface.

![SRT Stream Manager](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-blue)
![Electron](https://img.shields.io/badge/Built%20with-Electron-47848F)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)

## ✨ Features

### 🎯 Core Functionality
- **Stream Management**: Start, stop, and monitor multiple SRT streams simultaneously
- **Bulk Operations**: Start/stop all streams with a single click
- **Real-time Logs**: View live stream logs with expandable sections
- **URL Copying**: Copy SRT URLs with one click for easy sharing
- **Dynamic Streams**: Add and remove streams on the fly

### 🎨 User Interface
- **macOS Design**: Native macOS appearance with proper theming
- **Dark/Light Mode**: Beautiful theme switching with CSS variables
- **Sticky Header**: Always accessible controls while scrolling
- **Responsive Layout**: Works perfectly on different screen sizes
- **Cupertino Icons**: Professional Lucide React icons throughout

### ⚙️ Configuration
- **Server IP Management**: Save and load server IP addresses
- **Public IPv4 Support**: Separate configuration for public IP
- **Settings Dialog**: Comprehensive settings with macOS-style toggles
- **Persistent Storage**: Settings saved between app sessions

### 🔧 Technical Features
- **SRT Integration**: Built-in `srt-live-transmit` binary support
- **Process Management**: Proper stream process handling and cleanup
- **Error Handling**: Robust error handling and user feedback
- **Cross-platform**: Works on macOS, Windows, and Linux

## 🚀 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- SRT tools (optional, for development)

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd streaming

# Install dependencies
npm install

# Install SRT tools (macOS)
brew install srt

# Start development server
npm run dev
```

### Building for Production
```bash
# Build the application
npm run build

# Create distributable packages
npm run dist
```

## 📖 Usage

### Getting Started
1. **Launch the Application**: Start SRT Stream Manager
2. **Configure Server IP**: Enter your server IP in the header
3. **Add Streams**: Use the "Add New Stream" section to create streams
4. **Start Streaming**: Click the play button to start individual streams or "Start All"

### Stream Configuration
Each stream requires:
- **Local IP**: Source IP address
- **Local Port**: Source port number
- **Server Port**: Destination port on your server
- **Passphrase**: Optional encryption passphrase

### Features Overview

#### Header Controls
- **Server IP**: Configure your streaming server IP
- **Public IPv4**: Set public IP for external access
- **Start All**: Start all configured streams
- **Stop All**: Stop all running streams
- **Settings**: Access application settings

#### Stream Management
- **Individual Control**: Start/stop each stream independently
- **Status Monitoring**: Real-time status indicators
- **Log Viewing**: Expand rows to view detailed logs
- **URL Copying**: Copy SRT URLs for external players
- **Stream Removal**: Delete streams when no longer needed

#### Settings
- **Theme Selection**: Light, Dark, or System theme
- **Auto-start**: Automatically start streams on app launch
- **Notifications**: Enable/disable system notifications
- **Logging**: Configure log retention and levels
- **Default Passphrase**: Set default encryption for new streams

## 🛠️ Development

### Project Structure
```
streaming/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # Main window creation
│   │   ├── preload.ts  # Preload script
│   │   └── streamManager.ts  # SRT stream management
│   └── renderer/       # React frontend
│       ├── App.tsx     # Main application component
│       └── main.tsx    # React entry point
├── dist/               # Built application
├── release/            # Distribution packages
└── package.json        # Project configuration
```

### Key Technologies
- **Electron**: Cross-platform desktop framework
- **React**: Frontend UI library
- **TypeScript**: Type-safe JavaScript
- **Material-UI**: React component library
- **Lucide React**: Professional icon set
- **SRT**: Secure Reliable Transport protocol

### Development Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run dist         # Create distributables

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🔧 Configuration

### SRT Tools Installation
The application includes bundled SRT tools, but for development you may need to install them locally:

**macOS:**
```bash
brew install srt
```

**Ubuntu/Debian:**
```bash
sudo apt-get install srt-tools
```

**Windows:**
Download from the [SRT GitHub releases](https://github.com/Haivision/srt/releases)

### Environment Variables
- `NODE_ENV`: Set to 'development' for dev tools
- `SRT_PATH`: Custom path to srt-live-transmit binary

## 🎨 Theming

The application supports dynamic theming with CSS variables:

### Light Theme Colors
- Background: `#f5f5f7`
- Paper: `#ffffff`
- Text: `#1d1d1f`
- Secondary: `#6e6e73`
- Borders: `#e5e5e7`

### Dark Theme Colors
- Background: `#1e1e1e`
- Paper: `#2d2d2d`
- Text: `#ffffff`
- Secondary: `#8e8e93`
- Borders: `#404040`

## 📱 Platform Support

- ✅ **macOS**: Full native support with proper theming
- ✅ **Windows**: Cross-platform compatibility
- ✅ **Linux**: Full functionality with proper packaging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Haivision**: SRT protocol and tools
- **Electron**: Cross-platform desktop framework
- **React**: Frontend library
- **Material-UI**: Component library
- **Lucide**: Beautiful icon set

## 📞 Support

- **Telegram**: [@vermino](https://t.me/vermino)
- **Website**: [vermino.uz](https://vermino.uz)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

---

**Made with ❤️ by [@vermino](https://t.me/vermino) | [vermino.uz](https://vermino.uz) | © 2026 est.** # srt-transmitter

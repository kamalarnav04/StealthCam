# StealthCam 🕵️‍♂️

**StealthCam is a lightweight remote monitoring tool that turns your computer into a live surveillance device. It captures video and audio streams from your system and securely transmits them to your connected phone in real-time via a web interface.**

Perfect for discrete monitoring, security purposes, or remote surveillance when you need to keep an eye on your space from anywhere.

## ✨ Key Features

### 🎥 **Real-time Surveillance**
- Live video and audio streaming from computer to mobile device
- High-quality WebRTC streaming with minimal latency
- Adaptive quality settings (Low/Medium/High) based on connection
- Real-time peer-to-peer connection for maximum security

### 🔐 **Security & Privacy**
- JWT-based authentication system
- Secure WebRTC connections with STUN servers
- No data persistence - streams are not recorded or stored
- Password-protected access to prevent unauthorized viewing

### 📱 **Cross-Platform Access**
- **Computer Client**: Acts as the surveillance camera (streams video/audio)
- **Mobile Client**: Remote viewing device with touch controls
- Responsive web interface works on any device with a browser
- No app installation required

### 👻 **Stealth Features**
- **Ghost Mode**: Instantly black out the computer screen (ESC to exit)
- Discrete interface that doesn't draw attention
- Silent operation with minimal system footprint
- Quick activation and deactivation controls

### 🎛️ **Remote Controls**
- Start/stop streaming remotely from mobile device
- Request live feeds on-demand
- Volume control and mute functionality
- Fullscreen viewing for better monitoring
- Real-time connection status indicators

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- Modern web browser with WebRTC support
- Camera and microphone on the computer to monitor
- Stable internet connection

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stealthcam.git
   cd stealthcam
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-here
   NEXTAUTH_SECRET=your-nextauth-secret-here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open `http://localhost:3000` in your browser
   - Set up your surveillance system in minutes!

## 📖 How to Use

### Setting Up the Surveillance Computer

1. **Login on the target computer**
   - Open StealthCam in a web browser
   - Create an account with username/password
   - Select **"Computer"** as device type
   - Grant camera and microphone permissions

2. **Configure stream settings**
   - Choose quality: Low (640x480), Medium (720p), or High (1080p)
   - Test camera and microphone functionality
   - Use **Ghost Mode** to hide the interface when needed

3. **Start surveillance**
   - Click "Start Stream" to begin broadcasting
   - The computer is now ready for remote monitoring

### Remote Monitoring from Mobile

1. **Connect from your phone**
   - Open the same URL on your mobile device
   - Login with the same username/password
   - Select **"Mobile"** as device type

2. **View live feed**
   - Tap "Request Stream" to connect to the surveillance feed
   - Use touch controls for volume, mute, and fullscreen
   - Monitor in real-time from anywhere

### Stealth Operation

- **Quick Hide**: Use the Ghost Mode button to instantly black out the computer screen
- **Emergency Exit**: Press ESC key to exit Ghost Mode quickly
- **Discrete Access**: Login appears as a normal web application
- **Silent Running**: Minimal system impact during operation

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Real-time**: Socket.IO, WebRTC for P2P streaming
- **Authentication**: JWT tokens, bcryptjs encryption
- **Styling**: Tailwind CSS with responsive design
- **Streaming**: MediaStream API, RTCPeerConnection

## 🏗️ Project Structure

```
stealthcam/
├── src/
│   ├── app/                # Next.js app router
│   │   ├── api/           # Authentication APIs
│   │   └── globals.css    # Global styling
│   ├── components/        # React components
│   │   ├── ComputerClient.tsx  # Surveillance computer interface
│   │   ├── MobileClient.tsx    # Mobile viewing interface
│   │   └── LoginForm.tsx       # Authentication form
│   ├── contexts/          # React contexts
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── StreamContext.tsx   # Streaming state
│   └── lib/               # Utility libraries
│       ├── socket.ts      # Socket.IO configuration
│       └── webrtc.ts      # WebRTC utilities
├── public/                # Static assets
└── package.json           # Project dependencies
```

## 🔒 Security Considerations

### Authentication
- All sessions are protected with JWT tokens
- Passwords are hashed using bcryptjs
- No sensitive data is stored permanently

### Network Security
- WebRTC provides encrypted P2P connections
- Use HTTPS in production environments
- STUN servers handle NAT traversal securely

### Privacy
- No video or audio data is recorded or stored
- Streams are live-only and disappear when disconnected
- No analytics or tracking implemented

## 📋 System Requirements

### Computer (Surveillance Device)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Working camera and microphone
- Stable internet connection
- Minimum 2GB RAM recommended

### Mobile Device (Monitoring)
- Any smartphone or tablet with a web browser
- Internet connection (WiFi or cellular)
- Modern browser with WebRTC support

## 🚨 Legal Notice

**Important**: This software is intended for legitimate surveillance and monitoring purposes only. Users are responsible for:

- Complying with local privacy and surveillance laws
- Obtaining proper consent when monitoring spaces with people
- Using the software ethically and legally
- Ensuring they have permission to monitor the location

The developers are not responsible for misuse of this software.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
```bash
# Clone the repo
git clone https://github.com/yourusername/stealthcam.git

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/stealthcam/issues) page
2. Create a new issue with detailed information
3. Include browser version, OS, and error messages

## 🔄 Version History

- **v0.1.0** - Initial release
  - Basic streaming functionality
  - Authentication system
  - Ghost mode for stealth operation
  - Mobile and computer clients

---

**⚠️ Use Responsibly**: StealthCam is a powerful surveillance tool. Always ensure you have proper authorization before monitoring any location or individuals.

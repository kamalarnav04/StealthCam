# Stream Connect - Real-time Video Streaming Application

A secure, real-time video and audio streaming application built with Next.js, WebRTC, and Socket.IO. This application enables seamless streaming from a computer to mobile devices with authentication and connection management.

## Features

### 🎥 Real-time Video Streaming
- High-quality video streaming using WebRTC
- Adaptive streaming quality (Low, Medium, High)
- Real-time audio transmission
- Minimal latency peer-to-peer connections

### 🔐 Security & Authentication
- JWT-based authentication
- Secure WebRTC connections with STUN servers
- User session management
- Protected streams with authorization

### 📱 Cross-Device Support
- **Computer Client**: Stream video/audio from webcam and microphone
- **Mobile Client**: View streams with touch-friendly controls
- Responsive design for all screen sizes

### 🎛️ Stream Controls
- Start/stop streaming from computer
- Request streams from mobile device
- Volume control and mute functionality
- Fullscreen video playback
- Real-time connection status monitoring

### 🔗 Connection Management
- Real-time device discovery
- Connection state monitoring
- Automatic reconnection handling
- Multiple device support per user

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Real-time Communication**: Socket.IO, WebRTC
- **Authentication**: JWT, bcryptjs
- **Streaming**: MediaStream API, RTCPeerConnection
- **Styling**: Tailwind CSS with responsive design

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern web browser with WebRTC support
- Camera and microphone access for streaming

### Installation

1. **The project is already set up in your current directory**

2. **Install additional dependencies if needed:**
   ```bash
   npm install
   ```

3. **Environment variables are already configured in `.env.local`**
   - In production, change the secrets to secure random strings

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   - Navigate to `http://localhost:3000`
   - The application will automatically detect your device type

## Usage Guide

### Step 1: Authentication
1. Open the application in your browser
2. Enter a username and password (new users are automatically registered)
3. Select your device type:
   - **Computer**: For streaming (captures video/audio)
   - **Mobile**: For viewing (receives video/audio)

### Step 2: Computer Setup (Streaming)
1. Login with device type set to "Computer"
2. Grant camera and microphone permissions when prompted
3. Select your preferred stream quality
4. Click "Start Stream" to begin broadcasting
5. Your mobile devices will be notified

### Step 3: Mobile Setup (Viewing)
1. Login with the same username on your mobile device
2. Set device type to "Mobile"
3. Tap "Request Stream" to start receiving video
4. Use the controls to adjust volume, mute, or go fullscreen

### Stream Quality Options
- **Low**: 640x480 @ 15fps - Good for slow connections
- **Medium**: 1280x720 @ 30fps - Balanced quality and performance
- **High**: 1920x1080 @ 30fps - Best quality, requires good connection

## Architecture

### Client-Server Communication
```
Computer (Streamer) ←→ Server (Socket.IO) ←→ Mobile (Viewer)
                   ↓
              WebRTC P2P Connection
```

## Security Features

### Authentication & Authorization
- JWT tokens with expiration
- Password hashing with bcryptjs
- Session-based authentication
- Device-specific access control

### Network Security
- HTTPS recommended for production
- Secure WebSocket connections
- STUN servers for NAT traversal
- No data persistence (privacy-focused)

## Troubleshooting

### Common Issues

#### Camera/Microphone Not Working
- Check browser permissions
- Ensure HTTPS in production
- Verify device availability

#### Connection Issues
- Check firewall settings
- Verify STUN server connectivity
- Try different network connections

#### Stream Quality Problems
- Reduce stream quality setting
- Check network bandwidth
- Monitor browser console for errors

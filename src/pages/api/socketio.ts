import { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';
import { Server as NetServer } from 'http';
import jwt from 'jsonwebtoken';

type SocketServer = NetServer & {
  io?: IOServer;
};

type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: SocketServer;
  };
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  const socketRes = res as NextApiResponseServerIO;
  
  if (!socketRes.socket?.server) {
    console.error('Server socket not available');
    res.status(500).json({ error: 'Server socket not available' });
    return;
  }

  if (socketRes.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  } else {
    console.log('Socket is initializing');
    const io = new IOServer(socketRes.socket.server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Middleware for authentication
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        console.log('Socket connection rejected: No token provided');
        return next(new Error('Authentication token required'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; deviceType: string };
        (socket as unknown as { userId: string; deviceType: string }).userId = decoded.userId;
        (socket as unknown as { userId: string; deviceType: string }).deviceType = decoded.deviceType;
        console.log(`Socket authenticated: ${decoded.userId} (${decoded.deviceType})`);
        next();
      } catch (error) {
        console.log('Socket authentication failed:', error);
        next(new Error('Invalid token'));
      }
    });io.on('connection', (socket) => {
      const authSocket = socket as unknown as { userId: string; deviceType: string };
      console.log(`User ${authSocket.userId} connected from ${authSocket.deviceType}`);      // Join room based on user ID
      socket.join(authSocket.userId);

      // Notify other devices of this connection
      socket.to(authSocket.userId).emit('device-connected', {
        deviceType: authSocket.deviceType,
        userId: authSocket.userId,
        socketId: socket.id
      });

      // Handle WebRTC signaling
      socket.on('offer', (data) => {
        console.log(`Forwarding offer from ${authSocket.deviceType} to room ${authSocket.userId}`);
        socket.to(authSocket.userId).emit('offer', {
          offer: data.offer,
          fromUserId: authSocket.userId,
          fromDeviceType: authSocket.deviceType
        });
      });

      socket.on('answer', (data) => {
        console.log(`Forwarding answer from ${authSocket.deviceType} to room ${authSocket.userId}`);
        socket.to(authSocket.userId).emit('answer', {
          answer: data.answer,
          fromUserId: authSocket.userId,
          fromDeviceType: authSocket.deviceType
        });
      });      socket.on('ice-candidate', (data) => {
        console.log(`Forwarding ICE candidate from ${authSocket.deviceType} to room ${authSocket.userId}`);
        socket.to(authSocket.userId).emit('ice-candidate', {
          candidate: data.candidate,
          fromUserId: authSocket.userId,
          fromDeviceType: authSocket.deviceType
        });
      });

      // Stream control events
      socket.on('start-stream', (data) => {
        console.log(`Stream started by ${authSocket.deviceType}`);
        socket.to(authSocket.userId).emit('stream-started', {
          fromUserId: authSocket.userId,
          streamId: data.streamId
        });
      });      socket.on('stop-stream', () => {
        console.log(`Stream stopped by ${authSocket.deviceType}`);
        socket.to(authSocket.userId).emit('stream-stopped', {
          fromUserId: authSocket.userId
        });
      });

      socket.on('request-stream', () => {
        console.log(`Stream requested by ${authSocket.deviceType}`);
        socket.to(authSocket.userId).emit('stream-requested', {
          fromUserId: authSocket.userId,
          fromDeviceType: authSocket.deviceType
        });
      });      // Connection management
      socket.on('get-online-devices', () => {
        const clients = Array.from(io.sockets.sockets.values())          .filter((s) => {
            const clientUserId = (s as unknown as { userId: string }).userId;
            return clientUserId === authSocket.userId && s.id !== socket.id;
          })
          .map((s) => ({
            socketId: s.id,
            deviceType: (s as unknown as { deviceType: string }).deviceType,
            connected: true
          }));
        
        console.log(`User ${authSocket.userId} (${authSocket.deviceType}) found ${clients.length} other devices:`, clients);
        socket.emit('online-devices', clients);
      });

      socket.on('disconnect', () => {
        console.log(`User ${authSocket.userId} disconnected`);
        // Notify other devices of disconnection
        socket.to(authSocket.userId).emit('device-disconnected', {
          deviceType: authSocket.deviceType,
          userId: authSocket.userId
        });
      });
    });

    socketRes.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;

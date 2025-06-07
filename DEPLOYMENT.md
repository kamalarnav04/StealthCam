# Deployment Guide

## Quick Production Setup

### 1. Environment Configuration
Update `.env.local` with secure values:
```env
NEXTAUTH_SECRET=your-production-secret-here-make-it-long-and-random
NEXTAUTH_URL=https://yourdomain.com
JWT_SECRET=another-long-random-secret-for-jwt-tokens
```

### 2. Build and Start
```bash
npm run build
npm start
```

### 3. Docker Deployment (Optional)
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t stealthcam .
docker run -p 3000:3000 stealthcam
```

### 4. Production Considerations

#### Security
- Use HTTPS in production (required for WebRTC)
- Add rate limiting
- Implement proper CORS policies
- Add input validation

#### Performance
- Consider using TURN servers for better connectivity
- Implement Redis for Socket.IO scaling
- Add monitoring and logging
- Optimize bundle size

#### Infrastructure
- Use a reverse proxy (nginx)
- Set up SSL certificates
- Configure firewall rules
- Add health checks

## Testing the Application

### Local Testing
1. Open two browser windows/tabs
2. In first window: Login as "Computer" device type
3. In second window: Login as "Mobile" device type (same username)
4. Start streaming from computer, view on mobile

### Mobile Testing
1. Get your computer's local IP from the terminal output
2. Connect your mobile device to the same network
3. Navigate to `http://[your-ip]:3000` on mobile
4. Login with device type "Mobile"

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify camera/microphone permissions
3. Ensure both devices are on the same network (for local testing)
4. Check firewall settings

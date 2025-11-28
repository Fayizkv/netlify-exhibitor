# Live Transcription System - Hosting Guide

## 🚀 System Architecture Overview

The live transcription system consists of three main components:

1. **CMS LiveTest Component** (`liveTest/index.jsx`) - Sender/Broadcaster
2. **Transcription Server** (`transcription-broadcaster-deepgram`) - Socket Server
3. **Receiver Client** (`live-transcription-receiver`) - Receiver/Viewer

## 🔧 Implementation Changes Made

### 1. Interim Results Handling

- **Before**: Interim results were overwriting each other
- **After**: Interim results are displayed continuously and updated in real-time (like recapLive)
- **Implementation**: Modified `addTranscriptionResult` to update `interimText` state for non-final results

### 2. Transcription Display

- **Before**: Single section showing all results
- **After**: Separate sections for live interim results and final transcriptions
- **Implementation**: Added live interim display with pulsing indicator and separate final transcriptions section

### 3. Socket Communication

- **Before**: Only final transcriptions sent to server
- **After**: Only final transcriptions sent to server (interim results stay local)
- **Implementation**: Maintained existing socket emission for final transcriptions only

## 🌐 Hosting Considerations

### 1. Socket Server Deployment

#### Environment Variables Required:

```bash
# For transcription-broadcaster-deepgram server
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

#### Production Deployment Checklist:

- [ ] **Load Balancer**: Use nginx or similar for SSL termination
- [ ] **WebSocket Support**: Ensure proxy supports WebSocket upgrades
- [ ] **CORS Configuration**: Update CORS origins for production domains
- [ ] **Environment Variables**: Set all required environment variables
- [ ] **Process Management**: Use PM2 or similar for process management
- [ ] **Logging**: Implement proper logging for debugging
- [ ] **Monitoring**: Set up health checks and monitoring

#### Nginx Configuration Example:

```nginx
# WebSocket support for Socket.IO
location /socket.io/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# Regular HTTP requests
location / {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 2. Socket Connection Management

#### Critical Issues to Address:

1. **Socket Not Closing from Receivers**
   - **Problem**: Receivers may not properly disconnect, leaving zombie connections
   - **Solution**: Implement heartbeat mechanism and connection timeouts
   - **Implementation**:

   ```javascript
   // Add to transcription server
   const HEARTBEAT_INTERVAL = 30000; // 30 seconds
   const CONNECTION_TIMEOUT = 60000; // 60 seconds

   socket.on("heartbeat", () => {
     socket.lastHeartbeat = Date.now();
   });

   // Check for stale connections
   setInterval(() => {
     const now = Date.now();
     io.sockets.sockets.forEach((socket) => {
       if (now - socket.lastHeartbeat > CONNECTION_TIMEOUT) {
         socket.disconnect(true);
       }
     });
   }, HEARTBEAT_INTERVAL);
   ```

2. **Memory Leaks from Room Management**
   - **Problem**: Rooms accumulate transcriptions and never get cleaned up
   - **Solution**: Implement room cleanup and transcription limits
   - **Implementation**:

   ```javascript
   // Limit transcriptions per room
   const MAX_TRANSCRIPTIONS_PER_ROOM = 100;
   const ROOM_CLEANUP_INTERVAL = 300000; // 5 minutes

   // Clean up old rooms
   setInterval(() => {
     const now = Date.now();
     rooms.forEach((room, roomId) => {
       if (room.participants.length === 0 && now - room.lastActivity > ROOM_CLEANUP_INTERVAL) {
         rooms.delete(roomId);
       }
     });
   }, ROOM_CLEANUP_INTERVAL);
   ```

3. **Connection Limits**
   - **Problem**: Too many concurrent connections can overwhelm the server
   - **Solution**: Implement connection limits and rate limiting
   - **Implementation**:

   ```javascript
   const MAX_CONNECTIONS_PER_IP = 10;
   const connectionCounts = new Map();

   io.on("connection", (socket) => {
     const clientIP = socket.handshake.address;
     const currentCount = connectionCounts.get(clientIP) || 0;

     if (currentCount >= MAX_CONNECTIONS_PER_IP) {
       socket.emit("error", "Too many connections from this IP");
       socket.disconnect(true);
       return;
     }

     connectionCounts.set(clientIP, currentCount + 1);

     socket.on("disconnect", () => {
       const newCount = connectionCounts.get(clientIP) - 1;
       if (newCount <= 0) {
         connectionCounts.delete(clientIP);
       } else {
         connectionCounts.set(clientIP, newCount);
       }
     });
   });
   ```

### 3. Scaling Considerations

#### Horizontal Scaling:

- **Redis Adapter**: Use Socket.IO Redis adapter for multiple server instances
- **Load Balancer**: Use sticky sessions for WebSocket connections
- **Database**: Store transcriptions in database for persistence across restarts

#### Vertical Scaling:

- **Memory**: Monitor memory usage, especially for long-running rooms
- **CPU**: Transcription processing can be CPU-intensive
- **Network**: WebSocket connections consume bandwidth

### 4. Security Considerations

#### Authentication & Authorization:

```javascript
// Implement room-based authentication
socket.on("join-room", (roomId, token) => {
  if (!validateToken(token, roomId)) {
    socket.emit("error", "Unauthorized access to room");
    socket.disconnect(true);
    return;
  }
  // Allow join
});
```

#### Rate Limiting:

```javascript
const rateLimit = require("express-rate-limit");
const socketRateLimit = require("socket.io-rate-limiter");

// HTTP rate limiting
app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

// Socket.IO rate limiting
io.use(
  socketRateLimit({
    points: 10, // Number of points
    duration: 1, // Per second
    errorMessage: "Too many requests",
  })
);
```

### 5. Monitoring & Logging

#### Health Checks:

```javascript
// Add comprehensive health check endpoint
app.get("/api/health", (req, res) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    activeRooms: rooms.size,
    totalConnections: io.engine.clientsCount,
    activeConnections: io.sockets.sockets.size,
  };

  res.json(health);
});
```

#### Logging:

```javascript
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.File({ filename: "error.log", level: "error" }), new winston.transports.File({ filename: "combined.log" })],
});

// Log important events
io.on("connection", (socket) => {
  logger.info("User connected", { socketId: socket.id });

  socket.on("join-room", (roomId) => {
    logger.info("User joined room", { socketId: socket.id, roomId });
  });

  socket.on("transcription", (data) => {
    logger.info("Transcription received", {
      socketId: socket.id,
      roomId: data.roomId,
      textLength: data.text.length,
    });
  });
});
```

### 6. Environment-Specific Configurations

#### Development:

```bash
# .env.development
VITE_LIVE_TRANSCRIPTION_SERVER_URL=http://localhost:3001
VITE_DEEPGRAM_API_KEY=your_dev_key
```

#### Production:

```bash
# .env.production
VITE_LIVE_TRANSCRIPTION_SERVER_URL=https://your-transcription-server.com
VITE_DEEPGRAM_API_KEY=your_prod_key
```

### 7. Deployment Checklist

#### Pre-Deployment:

- [ ] Test WebSocket connections in staging environment
- [ ] Verify CORS settings for production domains
- [ ] Set up monitoring and alerting
- [ ] Configure SSL certificates
- [ ] Set up database for transcription storage (if needed)
- [ ] Test with multiple concurrent users

#### Post-Deployment:

- [ ] Monitor server resources (CPU, memory, network)
- [ ] Check WebSocket connection stability
- [ ] Verify transcription delivery to receivers
- [ ] Monitor error rates and logs
- [ ] Test room cleanup mechanisms
- [ ] Verify heartbeat and timeout mechanisms

### 8. Troubleshooting Common Issues

#### Connection Issues:

```javascript
// Add detailed error logging
socket.on("connect_error", (error) => {
  logger.error("Socket connection error", {
    error: error.message,
    code: error.code,
    socketId: socket.id,
  });
});
```

#### Memory Issues:

```javascript
// Monitor memory usage
setInterval(() => {
  const memUsage = process.memoryUsage();
  if (memUsage.heapUsed > 500 * 1024 * 1024) {
    // 500MB
    logger.warn("High memory usage", memUsage);
  }
}, 60000);
```

#### Performance Issues:

```javascript
// Monitor transcription processing time
const startTime = Date.now();
// Process transcription
const processingTime = Date.now() - startTime;
if (processingTime > 1000) {
  // 1 second
  logger.warn("Slow transcription processing", { processingTime });
}
```

## 🎯 Best Practices Summary

1. **Always implement heartbeat mechanisms** for WebSocket connections
2. **Set reasonable limits** on connections, rooms, and transcriptions
3. **Monitor resource usage** continuously
4. **Implement proper error handling** and logging
5. **Use sticky sessions** when scaling horizontally
6. **Test thoroughly** with multiple concurrent users
7. **Implement graceful shutdown** procedures
8. **Set up automated health checks** and monitoring
9. **Use environment-specific configurations**
10. **Implement proper security measures** (authentication, rate limiting)

This hosting guide ensures your live transcription system will be robust, scalable, and production-ready.

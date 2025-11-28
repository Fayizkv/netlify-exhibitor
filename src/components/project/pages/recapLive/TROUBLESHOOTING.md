# AudioTranscriber Troubleshooting Guide

## Issue: Google Service Working, Deepgram Not Working

### 🔍 **Root Cause Analysis**

The issue is likely related to **environment variable configuration** and **WebSocket URL construction**. The working transcription client uses different environment variable names than our implementation.

### 🔧 **Quick Fixes**

#### 1. **Environment Variables**

Make sure you have these environment variables set in your `.env` file:

```env
# For Vite (our implementation)
VITE_DEEPGRAM_URL=wss://your-deepgram-server.com
VITE_GOOGLE_URL=wss://your-google-server.com

# For React (working client)
REACT_APP_DEEPGRAM_URL=wss://your-deepgram-server.com
REACT_APP_GOOGLE_URL=wss://your-google-server.com
```

#### 2. **Server URLs**

Ensure your transcription servers are running:

```bash
# Deepgram Server (Port 3000)
cd test_transcription/deepgram-socket
npm start

# Google Server (Port 3001)
cd test_transcription/gc-transcription-socket
npm start
```

#### 3. **Deepgram API Key**

Make sure your Deepgram API key is set:

```env
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

### 🧪 **Testing Steps**

#### Step 1: Check Environment Variables

Look at the debug information in the UI to see which environment variables are set.

#### Step 2: Test Direct Connection

Open browser console and run:

```javascript
// Test Deepgram connection
const ws = new WebSocket("ws://localhost:3000?roomId=test&language=en-US&provider=deepgram");
ws.onopen = () => console.log("Deepgram connected");
ws.onerror = (e) => console.error("Deepgram error:", e);
```

#### Step 3: Check Server Logs

Look at the server console output for:

- Connection attempts
- Deepgram API errors
- WebSocket errors

### 🔍 **Common Issues**

#### Issue 1: Environment Variables Not Set

**Symptoms**: "Environment variable is not set" error
**Solution**: Add environment variables to `.env` file

#### Issue 2: Deepgram Server Not Running

**Symptoms**: Connection timeout or refused
**Solution**: Start the Deepgram server

#### Issue 3: Deepgram API Key Invalid

**Symptoms**: Deepgram connection fails
**Solution**: Check API key in server environment

#### Issue 4: Wrong URL Format

**Symptoms**: WebSocket connection fails
**Solution**: Ensure URLs start with `ws://` or `wss://`

### 🛠️ **Debugging Tools**

#### 1. **Browser Console**

Check for WebSocket connection errors:

```javascript
// Monitor WebSocket connections
const originalWebSocket = window.WebSocket;
window.WebSocket = function (url, protocols) {
  console.log("WebSocket connecting to:", url);
  const ws = new originalWebSocket(url, protocols);
  ws.addEventListener("open", () => console.log("WebSocket opened:", url));
  ws.addEventListener("error", (e) => console.error("WebSocket error:", e));
  return ws;
};
```

#### 2. **Server Logs**

Monitor server console for:

- Client connections
- Deepgram API responses
- Error messages

#### 3. **Network Tab**

Check browser Network tab for:

- WebSocket connection attempts
- Failed requests
- Response codes

### 🔧 **Implementation Differences**

#### Working Client vs Our Implementation

| Aspect           | Working Client           | Our Implementation     |
| ---------------- | ------------------------ | ---------------------- |
| Environment      | `REACT_APP_*`            | `VITE_*`               |
| Connection       | Separate connect/record  | Combined               |
| Message Handling | Direct transcript update | Custom result handling |

### 🚀 **Quick Test Script**

Add this to browser console to test:

```javascript
// Test environment variables
console.log("REACT_APP_DEEPGRAM_URL:", process.env.REACT_APP_DEEPGRAM_URL);
console.log("VITE_DEEPGRAM_URL:", import.meta.env.VITE_DEEPGRAM_URL);

// Test WebSocket connection
function testConnection(provider) {
  const url = provider === "deepgram" ? "ws://localhost:3000?roomId=test&language=en-US&provider=deepgram" : "ws://localhost:3001?roomId=test&language=en-US&provider=google";

  const ws = new WebSocket(url);
  ws.onopen = () => console.log(`${provider} connected`);
  ws.onerror = (e) => console.error(`${provider} error:`, e);
  ws.onclose = () => console.log(`${provider} closed`);

  return ws;
}

// Test both services
const deepgramWs = testConnection("deepgram");
const googleWs = testConnection("google");
```

### 📋 **Checklist**

- [ ] Environment variables set correctly
- [ ] Deepgram server running on port 3000
- [ ] Google server running on port 3001
- [ ] Deepgram API key configured
- [ ] WebSocket URLs accessible
- [ ] Browser permissions granted
- [ ] No firewall blocking connections

### 🔄 **Fallback Strategy**

If Deepgram continues to fail:

1. **Use Google for all languages**: Modify the service selection logic
2. **Check Deepgram API status**: Verify API is working
3. **Use different Deepgram server**: Try alternative server URL
4. **Debug step by step**: Follow the testing steps above

### 📞 **Next Steps**

1. Check the debug information in the UI
2. Verify environment variables are set
3. Test direct WebSocket connections
4. Check server logs for errors
5. Compare with working transcription client

This should resolve the Deepgram connection issues and get both services working properly.

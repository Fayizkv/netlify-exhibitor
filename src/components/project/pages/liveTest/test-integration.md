# Live Transcription Integration Test Guide

## Overview

This guide helps you test the integration between the LiveTest component and the live-transcription-server/receiver system.

## Prerequisites

### 1. Start the Live Transcription Server

```bash
cd test_transcription/live-transcription-server
npm install
npm start
```

Server should start on `http://localhost:3001`

### 2. Start the Live Transcription Receiver (Optional)

```bash
cd test_transcription/live-transcription-receiver
npm install
npm run dev
```

Receiver should start on `http://localhost:5174`

### 3. Ensure EventHex CMS is Running

```bash
cd eventhex-saas-cms
npm run dev
```

CMS should be running on `http://localhost:3000`

## Testing Steps

### Step 1: Verify Server Connection

1. Open the LiveTest page in EventHex CMS
2. Check the "Socket" status indicator
3. Should show "Connected" in green if server is running
4. Should show "Disconnected" in red if server is not running

### Step 2: Test Room Creation

1. Note the "Room ID" displayed in the interface
2. This room ID will be used by receivers to join the same transcription session
3. Room ID is based on session ID or event ID

### Step 3: Test Language Selection

1. Select a language from the dropdown
2. Check the "Service" indicator:
   - Green "Nova Supported" for supported languages
   - Red "Not Supported" for unsupported languages
3. Only Nova-supported languages will work for transcription

### Step 4: Test Recording and Broadcasting

1. Click "Start Recording" button
2. Speak into the microphone
3. Watch for:
   - Interim results appearing in real-time
   - Final transcriptions being added to history
   - "✓ Sent to server" indicator on transcriptions
4. Check the receiver (if running) to see transcriptions appear

### Step 5: Test Receiver Integration

1. Open the live-transcription-receiver in another browser tab
2. Enter the same Room ID as shown in LiveTest
3. Click "Connect" in the receiver
4. Start recording in LiveTest
5. Verify transcriptions appear in the receiver in real-time

## Expected Behavior

### Connection Status

- **Connected**: Green indicator, ready for transcription
- **Disconnected**: Red indicator, check server status
- **Connecting**: Yellow indicator, establishing connection

### Transcription Flow

1. **Interim Results**: Gray text showing live transcription
2. **Final Results**: Saved transcriptions with timestamps
3. **Server Broadcast**: "✓ Sent to server" indicator
4. **Receiver Display**: Real-time updates in receiver

### Error Handling

- **Microphone Access**: Browser permission dialog
- **Server Unavailable**: Graceful fallback with local storage
- **Language Not Supported**: Warning message before recording
- **Network Issues**: Connection status indicators

## Troubleshooting

### Common Issues

#### 1. Socket Connection Failed

**Problem**: Socket status shows "Disconnected"
**Solution**:

- Check if live-transcription-server is running on port 3001
- Verify no firewall blocking the connection
- Check browser console for error messages

#### 2. Microphone Not Working

**Problem**: No audio being captured
**Solution**:

- Check browser microphone permissions
- Ensure HTTPS is used (required for microphone)
- Try refreshing the page

#### 3. Transcriptions Not Appearing in Receiver

**Problem**: LiveTest working but receiver not showing transcriptions
**Solution**:

- Verify both are using the same Room ID
- Check receiver connection status
- Ensure receiver is connected to the same server

#### 4. Language Not Supported

**Problem**: Can't start recording with selected language
**Solution**:

- Select a Nova-supported language
- Check the "Service" indicator for support status
- Use English as fallback if needed

### Debug Information

#### Console Logs

Check browser console for:

- Socket connection status
- Transcription events
- Error messages
- Server communication

#### Network Tab

Monitor:

- Socket.IO WebSocket connection
- API calls to backend
- Real-time data transmission

## Performance Testing

### Load Testing

1. **Multiple Senders**: Test with multiple LiveTest instances
2. **Multiple Receivers**: Test with multiple receiver instances
3. **Long Sessions**: Test extended transcription sessions
4. **High Volume**: Test rapid speech and transcription

### Memory Testing

1. **Extended Use**: Monitor memory usage over time
2. **Cleanup**: Verify proper cleanup when stopping recording
3. **Reconnection**: Test automatic reconnection after network issues

## Integration Verification

### Success Criteria

- ✅ Socket connection established
- ✅ Room ID properly generated
- ✅ Language selection working
- ✅ Recording starts/stops correctly
- ✅ Transcriptions appear in history
- ✅ Server broadcasting working
- ✅ Receiver receiving transcriptions
- ✅ Error handling working
- ✅ UI responsive and intuitive

### Performance Criteria

- ✅ Low latency transcription (< 2 seconds)
- ✅ Stable connection over time
- ✅ Proper cleanup on component unmount
- ✅ Graceful error handling
- ✅ Responsive UI during transcription

## Next Steps

After successful testing:

1. **Production Deployment**: Configure for production environment
2. **Security Review**: Implement proper authentication
3. **Monitoring**: Add logging and monitoring
4. **Scaling**: Plan for multiple concurrent sessions
5. **Features**: Add additional features like speaker identification

This integration provides a complete real-time transcription solution with live broadcasting capabilities, making it ideal for events, meetings, and presentations.

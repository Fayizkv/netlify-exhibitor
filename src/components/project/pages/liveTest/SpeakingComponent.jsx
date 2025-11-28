import React, { useState, useEffect, useRef } from "react";
import { eventHexspeaking } from "../../../../images";

const Waveform = ({ isRecording }) => {
  const canvasRef = useRef(null);
  const audioLevelsRef = useRef([]);
  const timeRef = useRef(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const dataArrayRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const [audioError, setAudioError] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let frameId;

    const initializeAudio = async () => {
      try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });

        // Store media stream reference for cleanup
        mediaStreamRef.current = stream;

        // Create audio context
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();

        // Configure analyser
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;

        // Connect microphone to analyser
        microphoneRef.current =
          audioContextRef.current.createMediaStreamSource(stream);
        microphoneRef.current.connect(analyserRef.current);

        // Create data array for frequency data
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        setAudioError(null);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        setAudioError(
          "Microphone access denied. Please allow microphone access to see real-time audio visualization."
        );
      }
    };

    const stopMicrophone = () => {
      // Stop all tracks in the media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        mediaStreamRef.current = null;
      }

      // Disconnect microphone from analyser
      if (microphoneRef.current) {
        microphoneRef.current.disconnect();
        microphoneRef.current = null;
      }

      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // Clear analyser reference
      analyserRef.current = null;
      dataArrayRef.current = null;
    };

    const generateAudioLevels = () => {
      if (!isRecording || !analyserRef.current || !dataArrayRef.current) {
        // When not recording, keep audio levels at minimum
        audioLevelsRef.current = Array(64).fill(0.02);
        return;
      }

      // Get frequency data from microphone
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      const levels = [];
      const dataLength = dataArrayRef.current.length;
      const targetBars = 64;

      // Downsample frequency data to 64 bars with enhanced processing
      for (let i = 0; i < targetBars; i++) {
        const start = Math.floor((i / targetBars) * dataLength);
        const end = Math.floor(((i + 1) / targetBars) * dataLength);

        let sum = 0;
        let count = 0;
        let max = 0;
        
        for (let j = start; j < end; j++) {
          const value = dataArrayRef.current[j];
          sum += value;
          max = Math.max(max, value);
          count++;
        }

        // Enhanced processing for more dynamic response
        const avgLevel = count > 0 ? sum / count / 255 : 0;
        const peakLevel = max / 255;
        
        // Combine average and peak for more responsive animation
        const combinedLevel = (avgLevel * 0.7 + peakLevel * 0.3);
        
        // Apply dynamic amplification based on overall volume
        const overallVolume = dataArrayRef.current.reduce((sum, val) => sum + val, 0) / dataLength / 255;
        const dynamicMultiplier = 1 + (overallVolume * 1.5); // Amplify more when volume is higher
        
        // Add some randomness for more organic movement
        const randomVariation = (Math.random() - 0.5) * 0.1 * overallVolume;
        const smoothedLevel = Math.max(0.02, (combinedLevel * dynamicMultiplier + randomVariation) * 2);
        
        levels.push(smoothedLevel);
      }

      audioLevelsRef.current = levels;
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.offsetWidth * window.devicePixelRatio;
      canvas.height = parent.offsetHeight * window.devicePixelRatio;
      canvas.style.width = `${parent.offsetWidth}px`;
      canvas.style.height = `${parent.offsetHeight}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const drawWave = (color, yOffset = 0, phaseShift = 0, waveIndex = 0) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const centerY = height / 2 + yOffset;
      const pointsPerLevel = width / audioLevelsRef.current.length;

      // Calculate overall volume level for random seed
      const avgVolume = audioLevelsRef.current.reduce((sum, level) => sum + level, 0) / audioLevelsRef.current.length;
      const volumeIntensity = Math.min(avgVolume * 2, 1); // Amplify and cap at 1

      // Create unique wave characteristics for each wave line
      const waveConfigs = [
        { speed: 1.0, amplitude: 1.0, frequency: 0.15, randomness: 0.8, sideBias: 0.3 },
        { speed: 1.3, amplitude: 0.8, frequency: 0.12, randomness: 1.2, sideBias: -0.4 },
        { speed: 0.7, amplitude: 1.2, frequency: 0.18, randomness: 0.6, sideBias: 0.6 }
      ];
      
      const config = waveConfigs[waveIndex] || waveConfigs[0];

      for (let i = 0; i < audioLevelsRef.current.length; i++) {
        const x = i * pointsPerLevel;
        const level = audioLevelsRef.current[i];
        const nextLevel = audioLevelsRef.current[i + 1] || level;
        const smoothLevel = level + (nextLevel - level) * 0.3;
        
        // Create unique wave components for each wave line
        const basePhase = timeRef.current * config.speed + phaseShift;
        const phase1 = basePhase + i * config.frequency;
        const phase2 = basePhase * 1.5 + i * (config.frequency * 0.7);
        const phase3 = basePhase * 0.8 + i * (config.frequency * 1.3);
        
        // Generate unique random movement for each wave
        const randomSeed = (i + timeRef.current * 0.1 + waveIndex * 100) % 1000;
        const randomFactor1 = Math.sin(randomSeed) * config.randomness;
        const randomFactor2 = Math.cos(randomSeed * 1.7 + waveIndex * 50) * config.randomness;
        
        // Create independent wave patterns
        const wave1 = Math.sin(phase1) * smoothLevel * 25 * config.amplitude;
        const wave2 = Math.cos(phase2) * smoothLevel * 15 * config.amplitude;
        const wave3 = Math.sin(phase3) * smoothLevel * 10 * config.amplitude;
        
        // Add unique randomness for each wave
        const randomWave1 = randomFactor1 * volumeIntensity * 20 * config.randomness;
        const randomWave2 = randomFactor2 * volumeIntensity * 15 * config.randomness;
        
        // Create asymmetric movement with unique side bias for each wave
        const isLeftSide = i < audioLevelsRef.current.length / 2;
        const sideMultiplier = isLeftSide ? (1 + config.sideBias) : (1 - config.sideBias);
        const sidePhase = isLeftSide ? phase1 : phase2;
        
        const sideWave = Math.sin(sidePhase) * smoothLevel * 18 * sideMultiplier * config.amplitude;
        
        // Add volume-based random spikes for more dynamic movement
        const volumeSpike = volumeIntensity > 0.3 ? 
          (Math.random() - 0.5) * volumeIntensity * 30 * config.amplitude : 0;
        
        // Combine all wave components with unique characteristics
        const totalWaveOffset = wave1 + wave2 + wave3 + randomWave1 + randomWave2 + sideWave + volumeSpike;
        const y = centerY + totalWaveOffset;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = (i - 1) * pointsPerLevel;
          const controlX = prevX + pointsPerLevel / 2;
          ctx.quadraticCurveTo(controlX, y, x, y);
        }
      }
      ctx.stroke();
    };

    const animate = () => {
      // Only animate when recording
      if (isRecording) {
        timeRef.current += 0.08;
        generateAudioLevels();

        const width = canvas.width / window.devicePixelRatio;
        const height = canvas.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, width, height);

        drawWave("rgba(99, 102, 241, 0.8)", 0, 0, 0);
        drawWave("rgba(236, 72, 153, 0.6)", 2, Math.PI / 3, 1);
        drawWave("rgba(139, 92, 246, 0.4)", -1, Math.PI / 2, 2);
      } else {
        // When not recording, stop microphone and clear the canvas
        stopMicrophone();
        const width = canvas.width / window.devicePixelRatio;
        const height = canvas.height / window.devicePixelRatio;
        ctx.clearRect(0, 0, width, height);
      }

      frameId = requestAnimationFrame(animate);
    };

    // Initialize with quiet state
    audioLevelsRef.current = Array(64).fill(0.02);
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animate();

    // Initialize audio when component mounts
    initializeAudio();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resizeCanvas);

      // Cleanup audio resources
      stopMicrophone();
    };
  }, [isRecording]);

  return (
    <div className="h-32 w-full absolute top-1/2 left-0 -translate-y-1/2 z-0">
      <canvas ref={canvasRef} className="absolute inset-0" />
      {audioError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50/90 backdrop-blur-sm rounded-lg">
          <div className="text-center p-4">
            <div className="text-red-600 text-sm font-medium mb-2">
              🎤 Microphone Required
            </div>
            <div className="text-red-500 text-xs">{audioError}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const SpeakingComponent = ({ 
  isRecording = false, 
  interimText = "", 
  transcriptionResults = [],
  // Sound check mode props
  isSoundCheckMode = false,
  soundCheckInterimText = "",
  soundCheckResults = []
}) => {
  const [timer, setTimer] = useState(0);
  const [isToggled, setIsToggled] = useState(false);
  const [recordingState, setRecordingState] = useState('idle'); // 'idle', 'soundcheck', 'live'

  // Use sound check data when in sound check mode, otherwise use live recording data
  const currentInterimText = isSoundCheckMode ? soundCheckInterimText : interimText;
  const currentTranscriptionResults = isSoundCheckMode ? soundCheckResults : transcriptionResults;
  const currentIsRecording = isSoundCheckMode ? isSoundCheckMode : isRecording;

  // Filter out test data and meaningless content
  const meaningfulTranscriptionResults = currentTranscriptionResults.filter(result => 
    result?.text && 
    result.text.trim() !== "" && 
    result.text.trim().toLowerCase() !== "hello" &&
    result.text.trim().toLowerCase() !== "test" &&
    result.text.trim().length > 2
  );

  useEffect(() => {
    let interval;
    if (currentIsRecording) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [currentIsRecording]);

  // Update recording state based on props
  useEffect(() => {
    if (isSoundCheckMode) {
      setRecordingState('soundcheck');
    } else if (isRecording) {
      setRecordingState('live');
    } else {
      setRecordingState('idle');
    }
  }, [isSoundCheckMode, isRecording]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="bg-white flex items-center justify-center p-2 sm:p-4 font-sans">
      <div className="w-full max-w-7xl mx-auto">
        <div 
          className={`bg-gradient-to-r rounded-xl sm:rounded-2xl border relative overflow-hidden h-80 sm:h-96 flex flex-col justify-end p-4 sm:p-8 transition-all duration-500 ${
            recordingState === 'live' 
              ? 'border-gray-300 bg-gradient-to-r from-blue-100 to-white' 
              : recordingState === 'soundcheck'
              ? 'from-blue-50 to-blue-100 border-blue-200'
              : 'from-gray-50 to-white border-gray-200'
          }`}
          role="region"
          aria-label={`Recording interface - ${recordingState === 'live' ? 'Live recording active' : recordingState === 'soundcheck' ? 'Sound check active' : 'Ready to record'}`}
        >
          {/* Recording Status Indicator */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20">
            <div 
              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium ${
                recordingState === 'live' 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : recordingState === 'soundcheck'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
              role="status"
              aria-live="polite"
              aria-label={`Recording status: ${recordingState === 'live' ? 'Live recording active' : recordingState === 'soundcheck' ? 'Sound check active' : 'Ready to record'}`}
            >
              <div 
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  recordingState === 'live' 
                    ? 'bg-red-500 animate-pulse' 
                    : recordingState === 'soundcheck'
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-gray-400'
                }`}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">
                {recordingState === 'live' 
                  ? 'LIVE RECORDING' 
                  : recordingState === 'soundcheck'
                  ? 'SOUND CHECK'
                  : 'READY'
                }
              </span>
              <span className="sm:hidden">
                {recordingState === 'live' 
                  ? 'LIVE' 
                  : recordingState === 'soundcheck'
                  ? 'CHECK'
                  : 'READY'
                }
              </span>
            </div>
          </div>

          {/* Waveform and Image Container */}
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <Waveform isRecording={currentIsRecording} />
            <div 
              className="p-[16px] rounded-full bg-white z-50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer focus:outline-none  focus:ring-opacity-50"
              onClick={() => setIsToggled(!isToggled)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsToggled(!isToggled);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={isToggled ? 'Deactivate microphone' : 'Activate microphone'}
              aria-pressed={isToggled}
            >
              <div className={`relative z-10 rounded-full backdrop-blur-sm p-[24px] shadow-lg transition-all duration-300 cursor-pointer group ${
                currentIsRecording 
                  ? 'bg-gradient-to-r from-[#f1f7ff] to-[#f1f8ff] shadow-blue-100 shadow-2xl scale-105' 
                  : isToggled 
                    ? 'bg-gradient-to-r from-[#f1f7ff] to-[#f1f8ff] shadow-blue-100 shadow-2xl scale-105' 
                    : 'bg-[#EFECFF] hover:shadow-2xl hover:bg-[#E8E2FF]'
              }`}>
                {/* Recording indicator ring */}
                <div className={`absolute inset-0 rounded-full  transition-all duration-300 ${
                  currentIsRecording 
                    ? '' 
                    : isToggled 
                      ? '' 
                      : 'border-transparent'
                }`}></div>
                
                <img
                  alt="EventHex Logo"
                  width={100}
                  height={100}
                  className={`w-[92px] relative z-10 transition-all duration-300 ${
                    currentIsRecording 
                      ? 'scale-110 brightness-110' 
                      : isToggled 
                        ? 'scale-110 brightness-110' 
                        : 'group-hover:scale-110'
                  }`}
                  src={eventHexspeaking}
                />
                
                {/* Recording pulse effect */}
                {currentIsRecording && (
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
                )}
                
                {/* Click ripple effect */}
                <div className="absolute inset-0 rounded-full bg-white/30 scale-0 group-active:scale-100 transition-transform duration-150 ease-out"></div>
              </div>
            </div>
          </div>

          <div className="text-center relative z-10">
            {/* Timer Display */}
            <div className="flex items-center  mt-10 justify-center gap-2 mb-2">
              <span 
                className="text-gray-600 font-mono text-xl  sm:text-2xl font-bold"
                role="timer"
                aria-live="polite"
                aria-label={`Recording time: ${formatTime(timer)}`}
              >
                {formatTime(timer)}
              </span>
              {currentIsRecording && (
                <div className="flex items-center gap-1" aria-hidden="true">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2  rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
              )}
            </div>
            
            {/* Transcription Display */}
            <div className="mt-3 sm:mt-4 px-2 sm:px-4">
              <div className="text-center">
                {(currentInterimText || meaningfulTranscriptionResults.length > 0) && (
                  <div 
                    className="text-sm sm:text-lg leading-relaxed"
                    role="log"
                    aria-live="polite"
                    aria-label="Transcription results"
                  >
                    {/* Show final text in darker blue, bold style - only if it's meaningful content */}
                    {meaningfulTranscriptionResults.length > 0 && (
                      <span className="text-blue-600 font-[400]">{meaningfulTranscriptionResults[0].text}</span>
                    )}
                    {/* Show interim text in lighter gray, italic style */}
                    {currentInterimText && (
                      <span className="text-gray-500 italic">{currentInterimText}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
   
      </div>
    </div>
  );
};

export default SpeakingComponent;

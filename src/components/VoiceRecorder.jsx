"use client";

import { useState, useRef, useEffect } from "react";
import {
  FiMic,
  FiStopCircle,
  FiPlay,
  FiPause,
  FiSend,
  FiX,
} from "react-icons/fi";
import { FaMicrophone } from "react-icons/fa";

const VoiceRecorder = ({ onRecordingComplete, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(audioURL);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("ማይክሮፎን መጠቀም አልተቻለም። ፈቃድ ይስጡ።");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // Play/pause audio
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Send voice message
  const sendVoiceMessage = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
      if (audioURL) URL.revokeObjectURL(audioURL);
      onClose();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [audioURL]);

  // Handle audio ended
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, [audioURL]);

  return (
    <div className="bg-white rounded-xl shadow-xl border w-80">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-ethio-green to-ethio-blue rounded-full flex items-center justify-center">
            <FaMicrophone className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-800">ድምጽ መልእክት</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <FiX className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Recording Section */}
      <div className="p-6">
        {!audioURL ? (
          // Recording UI
          <div className="text-center">
            <div className="mb-6">
              <div className="relative">
                {/* Microphone Animation */}
                <div className="w-24 h-24 mx-auto mb-4">
                  {isRecording ? (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse"></div>
                      <div className="absolute inset-4 bg-red-200 rounded-full animate-pulse"></div>
                      <div className="absolute inset-8 bg-red-300 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FiMic className="w-12 h-12 text-red-600" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                      <FiMic className="w-12 h-12 text-ethio-blue" />
                    </div>
                  )}
                </div>

                {/* Timer */}
                <div className="text-3xl font-mono font-bold text-gray-800 mb-2">
                  {formatTime(recordingTime)}
                </div>

                {/* Recording Indicator */}
                {isRecording && (
                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-600 font-medium">
                      በመቅረጽ ላይ...
                    </span>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex justify-center space-x-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-6 py-3 bg-gradient-to-r from-ethio-green to-ethio-blue text-white rounded-full hover:shadow-lg transition-all flex items-center space-x-2"
                  >
                    <FiMic className="w-5 h-5" />
                    <span>መቅረጽ ይጀምሩ</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-6 py-3 bg-gradient-to-r from-ethio-red to-red-500 text-white rounded-full hover:shadow-lg transition-all flex items-center space-x-2"
                  >
                    <FiStopCircle className="w-5 h-5" />
                    <span>መቅረጽ አቁም</span>
                  </button>
                )}
              </div>

              {/* Hint */}
              <p className="text-xs text-gray-500 mt-6">
                {isRecording
                  ? "ለመቅረጽ የሚፈልጉትን ድምጽ ይናገሩ። ለመቆም ከላይ ያለውን አዝራር ይጫኑ።"
                  : "ድምጽ መልእክት ለመቅረጽ መቅረጽ ይጀምሩ የሚለውን አዝራር ይጫኑ።"}
              </p>
            </div>
          </div>
        ) : (
          // Playback UI
          <div className="text-center">
            <div className="mb-6">
              {/* Waveform Visualization */}
              <div className="h-20 mb-4 flex items-center justify-center">
                <div className="flex items-end space-x-1 h-full">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-blue-400 to-green-400 rounded-full"
                      style={{
                        height: `${20 + Math.sin(i * 0.5) * 30}%`,
                        animation: isPlaying
                          ? `wave ${
                              0.5 + i * 0.05
                            }s ease-in-out infinite alternate`
                          : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Audio Player */}
              <audio ref={audioRef} src={audioURL} preload="metadata" />

              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 bg-gradient-to-r from-ethio-green to-ethio-blue text-white rounded-full hover:shadow-lg transition-all flex items-center justify-center"
                >
                  {isPlaying ? (
                    <FiPause className="w-6 h-6" />
                  ) : (
                    <FiPlay className="w-6 h-6 ml-1" />
                  )}
                </button>

                <div className="text-left">
                  <p className="font-medium text-gray-800">የድምጽ መልእክት</p>
                  <p className="text-sm text-gray-500">
                    {formatTime(recordingTime)} • ድምጽ
                  </p>
                </div>
              </div>

              {/* Send/Cancel Buttons */}
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    if (audioURL) URL.revokeObjectURL(audioURL);
                    setAudioURL("");
                    setAudioBlob(null);
                  }}
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  አዲስ አድርግ
                </button>
                <button
                  onClick={sendVoiceMessage}
                  className="px-5 py-2 bg-gradient-to-r from-ethio-green to-ethio-blue text-white rounded-lg hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <FiSend className="w-4 h-4" />
                  <span>ላክ</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-4 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          የሚቀርጡት ድምጽ መልእክቶች በኢንተርኔት ሳይሆን በቀጥታ ለሚያወሩት ሰው ብቻ ይላካሉ።
        </p>
      </div>

      <style jsx>{`
        @keyframes wave {
          0% {
            height: 20%;
          }
          100% {
            height: 80%;
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceRecorder;

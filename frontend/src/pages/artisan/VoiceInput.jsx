import { useState } from "react";
import "./VoiceInput.css";

function VoiceInput({ onBack, onContinue, language }) {
  const [isRecording, setIsRecording] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const handleMicClick = () => {
    setIsRecording(true);
    setShowTranscript(false);

    // Only frontend demo UI
    setTimeout(() => {
      setIsRecording(false);
      setShowTranscript(true);
    }, 2000);
  };

  return (
    <div className="voice-page">
      <div className="voice-card">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>

        <div className="voice-logo">
          🎤 <span>Karigar AI</span>
        </div>

        <div className="voice-heading">
          <h1>Describe your product</h1>
          <p>
            Speak about your handmade product in{" "}
            <strong>{language || "your selected language"}</strong>.
          </p>
        </div>

        <div className="mic-container">
          <button
            className={`mic-button ${isRecording ? "listening" : ""}`}
            onClick={handleMicClick}
            disabled={isRecording}
          >
            🎤
          </button>

          <h3>
            {isRecording
              ? "Listening..."
              : "Tap the microphone to describe your product"}
          </h3>

          <p className="selected-language">
            Selected language: {language || "English"}
          </p>
        </div>

        {isRecording && (
          <div className="recording-status">
            <span></span>
            Recording your voice...
          </div>
        )}

        {showTranscript && (
          <div className="transcript-box">
            <h3>Your Description</h3>
            <p>
              Your voice description will appear here after AI processes
              the audio.
            </p>
          </div>
        )}

        <button
          className="continue-btn"
          onClick={onContinue}
          disabled={!showTranscript}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

export default VoiceInput;
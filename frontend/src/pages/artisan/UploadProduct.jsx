import { useEffect, useRef, useState } from "react";
import "./UploadProduct.css";

function UploadProduct({ onBack, onContinue }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [language, setLanguage] = useState("en-IN");
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const recognitionRef = useRef(null);

  /*
   * Browser Speech Recognition support
   *
   * Chrome:
   * window.SpeechRecognition
   *
   * Some Chromium browsers:
   * window.webkitSpeechRecognition
   */
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  /*
   * Image selection
   */
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImage(file);

    const nextPreview = URL.createObjectURL(file);
    setPreview(nextPreview);
  };

  /*
   * Clean preview URL when component changes/unmounts.
   */
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /*
   * Create and configure real browser speech recognition.
   */
  useEffect(() => {
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError("");
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i += 1
      ) {
        const result = event.results[i];

        const text = result[0]?.transcript || "";

        if (result.isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }

      if (finalText) {
        setTranscript((current) => {
          const separator =
            current.trim().length > 0 ? " " : "";

          return `${current}${separator}${finalText}`.trim();
        });
      }

      /*
       * Interim text is intentionally not stored permanently.
       * It is shown by the browser while speaking.
       */
      if (interimText) {
        setVoiceError("");
      }
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);

      if (event.error === "not-allowed") {
        setVoiceError(
          "Microphone permission was denied. Please allow microphone access in your browser."
        );
        return;
      }

      if (event.error === "no-speech") {
        setVoiceError(
          "No speech was detected. Please speak clearly and try again."
        );
        return;
      }

      if (event.error === "audio-capture") {
        setVoiceError(
          "No microphone was detected. Please check your microphone."
        );
        return;
      }

      if (event.error === "network") {
        setVoiceError(
          "Speech recognition needs an internet connection. Please check your connection and try again."
        );
        return;
      }

      setVoiceError(
        "Unable to recognize your speech. Please try again."
      );
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Recognition may already be stopped.
      }

      recognitionRef.current = null;
    };
  }, [language, SpeechRecognition]);

  /*
   * Start real microphone recognition.
   */
  const startListening = () => {
    setVoiceError("");

    if (!SpeechRecognition) {
      setVoiceError(
        "Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    if (isListening) {
      return;
    }

    try {
      /*
       * Recreate the recognition instance if the previous
       * instance has already ended.
       */
      if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceError("");
        };

        recognition.onresult = (event) => {
          let finalText = "";

          for (
            let i = event.resultIndex;
            i < event.results.length;
            i += 1
          ) {
            const result = event.results[i];

            if (result.isFinal) {
              finalText +=
                result[0]?.transcript || "";
            }
          }

          if (finalText) {
            setTranscript((current) => {
              const separator =
                current.trim().length > 0
                  ? " "
                  : "";

              return `${current}${separator}${finalText}`.trim();
            });
          }
        };

        recognition.onerror = (event) => {
          console.error(
            "Speech recognition error:",
            event.error
          );

          setIsListening(false);

          if (event.error === "not-allowed") {
            setVoiceError(
              "Microphone permission was denied. Please allow microphone access."
            );
          } else if (
            event.error === "no-speech"
          ) {
            setVoiceError(
              "No speech detected. Please try speaking again."
            );
          } else if (
            event.error === "audio-capture"
          ) {
            setVoiceError(
              "No microphone was detected."
            );
          } else {
            setVoiceError(
              "Unable to recognize your speech. Please try again."
            );
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }

      recognitionRef.current.lang = language;
      recognitionRef.current.start();
    } catch (error) {
      console.error(
        "Unable to start speech recognition:",
        error
      );

      setIsListening(false);

      /*
       * InvalidStateError normally means recognition
       * was already running.
       */
      if (error?.name !== "InvalidStateError") {
        setVoiceError(
          "Could not start the microphone. Please try again."
        );
      }
    }
  };

  /*
   * Stop microphone recognition.
   */
  const stopListening = () => {
    if (!recognitionRef.current) {
      setIsListening(false);
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error(
        "Unable to stop speech recognition:",
        error
      );
    }

    setIsListening(false);
  };

  /*
   * Clear voice transcript.
   */
  const clearTranscript = () => {
    stopListening();
    setTranscript("");
    setVoiceError("");
  };

  /*
   * Continue to AI catalogue generation.
   *
   * Sends:
   * - imageUrl
   * - mimeType
   * - inputText
   * - language
   */
  const handleContinue = () => {
    if (!image) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (
        typeof result !== "string" ||
        !result.includes(",")
      ) {
        setVoiceError(
          "Unable to process the selected image. Please choose another image."
        );
        return;
      }

      const base64Image = result.split(",")[1];

      onContinue({
        imageUrl: base64Image,
        mimeType: image.type || "image/jpeg",

        /*
         * Real speech transcript.
         */
        inputText: transcript.trim(),

        /*
         * Keep the selected speech language.
         */
        language,
      });
    };

    reader.onerror = () => {
      setVoiceError(
        "Unable to read the selected image. Please try again."
      );
    };

    reader.readAsDataURL(image);
  };

  /*
   * Human-readable language label.
   */
  const languageLabel =
    language === "hi-IN"
      ? "Hindi"
      : "English";

  return (
    <div className="upload-page">
      <div className="upload-card">
        <button
          type="button"
          className="back-btn"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="upload-logo">
          ✦ <span>Karigar AI</span>
        </div>

        <div className="upload-heading">
          <h1>Add your product</h1>

          <p>
            Upload a clear photo of your handmade
            product. Then describe it using your
            voice and let AI create your catalogue.
          </p>
        </div>

        {!preview ? (
          <label className="upload-box">
            <div className="upload-icon">
              📸
            </div>

            <h3>Upload Product Photo</h3>

            <p>
              Click here to select an image
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </label>
        ) : (
          <div className="preview-container">
            <img
              src={preview}
              alt="Selected product preview"
              className="product-preview"
            />

            <label className="change-btn">
              Change Photo

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </label>
          </div>
        )}

        {/* REAL VOICE SECTION */}
        <div
          style={{
            marginTop: "24px",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            background: "#fafafa",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            🎤 Describe your product
          </h3>

          <p
            style={{
              marginTop: 0,
              color: "#666",
              fontSize: "14px",
            }}
          >
            Speak naturally. For example:
            "This is a handmade Madhubani painting
            made using natural colours."
          </p>

          {/* LANGUAGE */}
          <div
            style={{
              marginBottom: "14px",
            }}
          >
            <label
              htmlFor="voice-language"
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Voice language
            </label>

            <select
              id="voice-language"
              value={language}
              onChange={(event) => {
                stopListening();
                setLanguage(event.target.value);
                setVoiceError("");
              }}
              disabled={isListening}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                background: "#fff",
              }}
            >
              <option value="en-IN">
                English (India)
              </option>

              <option value="hi-IN">
                Hindi (India)
              </option>
            </select>
          </div>

          {/* MICROPHONE */}
          <button
            type="button"
            onClick={
              isListening
                ? stopListening
                : startListening
            }
            disabled={!SpeechRecognition}
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: "12px",
              border: "none",
              cursor: SpeechRecognition
                ? "pointer"
                : "not-allowed",
              fontWeight: 700,
              background: isListening
                ? "#dc2626"
                : "#111827",
              color: "#fff",
              opacity: SpeechRecognition
                ? 1
                : 0.6,
            }}
          >
            {isListening
              ? "⏹ Stop Recording"
              : "🎤 Start Speaking"}
          </button>

          {!SpeechRecognition && (
            <p
              style={{
                color: "#b45309",
                fontSize: "13px",
                marginBottom: 0,
              }}
            >
              Voice recognition is not supported
              in this browser. Please use Google
              Chrome or Microsoft Edge.
            </p>
          )}

          {/* STATUS */}
          {isListening && (
            <p
              style={{
                marginBottom: "8px",
                color: "#dc2626",
                fontWeight: 600,
              }}
            >
              🔴 Listening in {languageLabel}...
            </p>
          )}

          {/* TRANSCRIPT */}
          {transcript && (
            <div
              style={{
                marginTop: "14px",
                padding: "14px",
                borderRadius: "10px",
                background: "#fff",
                border: "1px solid #d1d5db",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "8px",
                }}
              >
                <strong>
                  Your description
                </strong>

                <button
                  type="button"
                  onClick={clearTranscript}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#dc2626",
                    fontWeight: 600,
                  }}
                >
                  Clear
                </button>
              </div>

              <p
                style={{
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {transcript}
              </p>
            </div>
          )}

          {/* ERROR */}
          {voiceError && (
            <div
              role="alert"
              style={{
                marginTop: "12px",
                padding: "10px 12px",
                borderRadius: "10px",
                background: "#fef2f2",
                color: "#b91c1c",
                fontSize: "14px",
              }}
            >
              {voiceError}
            </div>
          )}
        </div>

        {/* CONTINUE */}
        <button
          type="button"
          className="continue-ai-btn"
          onClick={handleContinue}
          disabled={!image}
        >
          Continue with AI →
        </button>
      </div>
    </div>
  );
}

export default UploadProduct;
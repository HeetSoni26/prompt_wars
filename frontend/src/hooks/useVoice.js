/**
 * @fileoverview useVoice hook — Web Speech API integration.
 * Provides voice input recognition and text-to-speech synthesis.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

/**
 * useVoice hook for speech-to-text input and text-to-speech output.
 * @returns {Object} Voice state and handlers
 */
export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceSupported] = useState(() => !!SpeechRecognition && !!synth);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Starts voice recognition to capture user speech as text.
   * @param {Function} onResult - Callback called with final transcript string
   */
  const startListening = useCallback((onResult) => {
    if (!SpeechRecognition || isListening) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text;
        } else {
          interimTranscript += text;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        onResult?.(finalTranscript.trim());
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript('');
    };

    recognition.onerror = (event) => {
      // Ignore no-speech errors silently
      if (event.error !== 'no-speech') {
        setIsListening(false);
        setTranscript('');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  /**
   * Stops the current voice recognition session.
   */
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setTranscript('');
  }, []);

  /**
   * Speaks text aloud using the Web Speech Synthesis API.
   * @param {string} text - Text to speak (markdown stripped)
   * @param {Object} options - Speech options
   * @param {number} options.rate - Speech rate (default 1.0)
   * @param {number} options.pitch - Speech pitch (default 1.0)
   */
  const speak = useCallback((text, { rate = 1.0, pitch = 1.0 } = {}) => {
    if (!synth || !text) return;

    // Strip markdown for cleaner speech
    const cleanText = text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .slice(0, 600); // Limit to avoid very long readings

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    synth.speak(utterance);
  }, []);

  /**
   * Stops the current speech synthesis.
   */
  const stopSpeaking = useCallback(() => {
    synth?.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    voiceSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}

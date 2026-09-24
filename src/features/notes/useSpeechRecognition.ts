import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API interface declarations for TypeScript
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: (options?: { lang?: string }) => void;
  stopListening: () => void;
  toggleListening: (options?: { lang?: string }) => void;
  resetTranscript: () => void;
}

export const useSpeechRecognition = (
  onSpeechChunk?: (finalChunk: string, fullTranscript: string) => void
): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef<boolean>(true);
  const onSpeechChunkRef = useRef(onSpeechChunk);

  useEffect(() => {
    onSpeechChunkRef.current = onSpeechChunk;
  }, [onSpeechChunk]);

  const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
  const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;
  const isSupported = Boolean(SpeechRecognitionClass);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore if already stopped
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(
    (options?: { lang?: string }) => {
      if (!isSupported || !SpeechRecognitionClass) {
        setError('SpeechRecognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      setError(null);
      isManuallyStoppedRef.current = false;

      // Stop any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = options?.lang || 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let finalChunk = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            const text = item[0]?.transcript || '';
            if (item.isFinal) {
              finalChunk += text;
            } else {
              currentInterim += text;
            }
          }

          setInterimTranscript(currentInterim);

          if (finalChunk) {
            setTranscript((prev) => {
              const updated = prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim();
              if (onSpeechChunkRef.current) {
                onSpeechChunkRef.current(finalChunk.trim(), updated);
              }
              return updated;
            });
          }
        };

        recognition.onerror = (event: any) => {
          const err = event.error;
          if (err === 'no-speech') {
            // Ignored - common when user takes a breath
            return;
          }
          if (err === 'not-allowed' || err === 'service-not-allowed') {
            setError('Microphone permission was denied. Please allow microphone access in your browser settings.');
            stopListening();
          } else if (err === 'network') {
            setError('Network error encountered with speech recognition service.');
            stopListening();
          } else {
            setError(`Speech recognition notice: ${err}`);
          }
        };

        recognition.onend = () => {
          if (!isManuallyStoppedRef.current) {
            // Restart if continuous dictation is still desired
            try {
              recognition.start();
              return;
            } catch {
              // fallback
            }
          }
          setIsListening(false);
          setInterimTranscript('');
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        setError(err?.message || 'Failed to start speech recognition.');
        setIsListening(false);
      }
    },
    [SpeechRecognitionClass, isSupported, stopListening]
  );

  const toggleListening = useCallback(
    (options?: { lang?: string }) => {
      if (isListening) {
        stopListening();
      } else {
        startListening(options);
      }
    },
    [isListening, startListening, stopListening]
  );

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isManuallyStoppedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
};

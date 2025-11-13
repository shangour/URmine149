
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, Modality, Blob as GenAI_Blob } from '@google/genai';
import { Task, StatusUpdatePayload } from '../types.ts';
import ScreenshotUpload from './ScreenshotUpload.tsx';
import { MicrophoneIcon, StopIcon } from './icons.tsx';
import { encode } from '../utils/audio.ts';


interface StatusUpdateModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (taskId: string, payload: StatusUpdatePayload) => void;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ task, onClose, onUpdate }) => {
  const [progress, setProgress] = useState(task.progressPercentage);
  const [activityText, setActivityText] = useState('');
  const [blockersText, setBlockersText] = useState('None');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const stopRecording = useCallback(async () => {
    if (isRecording) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (sessionPromiseRef.current) {
        const session = await sessionPromiseRef.current;
        session.close();
        sessionPromiseRef.current = null;
      }
      setIsRecording(false);
      setActivityText(prev => prev + liveTranscript);
      setLiveTranscript('');
    }
  }, [isRecording, liveTranscript]);

  const startRecording = async () => {
    if (isRecording) return;
    setIsRecording(true);
    setActivityText(''); // Clear text area for live transcript
    setLiveTranscript('');
    setError('');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        // FIX: Cast `window` to `any` to allow for the vendor-prefixed `webkitAudioContext` without TypeScript errors.
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const source = audioContextRef.current.createMediaStreamSource(stream);
        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => console.log('Live session opened.'),
                onmessage: (message) => {
                    const text = message.serverContent?.inputTranscription?.text;
                    if (text) {
                        setLiveTranscript(prev => prev + text);
                    }
                },
                onerror: (e) => {
                    console.error('Live session error:', e);
                    setError('An error occurred during transcription.');
                    stopRecording();
                },
                onclose: () => console.log('Live session closed.'),
            },
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
            },
        });
        
        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob: GenAI_Blob = {
                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                mimeType: 'audio/pcm;rate=16000',
            };
            sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
            });
        };

        source.connect(scriptProcessorRef.current);
        scriptProcessorRef.current.connect(audioContextRef.current.destination);

    } catch (err) {
        console.error("Failed to start recording:", err);
        setError("Could not access microphone. Please ensure permissions are granted.");
        setIsRecording(false);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) {
      setError('Please stop recording before submitting.');
      return;
    }
    if (!screenshotData) {
      setError('A screenshot is mandatory for status updates.');
      return;
    }
    setError('');

    const payload: StatusUpdatePayload = {
      progressPercentage: progress,
      activityText: activityText + liveTranscript,
      blockersText,
      screenshotData,
    };
    onUpdate(task.id, payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="progress" className="block text-sm font-medium text-gray-300 mb-2">
          Progress: <span className="font-bold text-blue-400">{progress}%</span>
        </label>
        <input
          id="progress"
          type="range"
          min={task.progressPercentage}
          max="100"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div>
        <label htmlFor="activityText" className="block text-sm font-medium text-gray-300 mb-1">
          Activity Description
        </label>
        <div className="relative">
             <textarea
                id="activityText"
                rows={4}
                value={isRecording ? liveTranscript : activityText}
                onChange={(e) => setActivityText(e.target.value)}
                className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2 pr-10"
                placeholder="Describe your recent progress or use the mic for voice-to-text..."
                required
                disabled={isRecording}
                />
            <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className="absolute top-2 right-2 p-2 rounded-full text-white bg-gray-600 hover:bg-gray-500"
                title={isRecording ? "Stop recording" : "Start recording with voice"}
            >
                {isRecording ? <StopIcon className="w-5 h-5 text-red-400"/> : <MicrophoneIcon className="w-5 h-5"/>}
            </button>
        </div>
         {isRecording && <p className="text-xs text-blue-400 mt-1">Recording transcript...</p>}
      </div>

      <div>
        <label htmlFor="blockersText" className="block text-sm font-medium text-gray-300 mb-1">
          Blockers / Issues
        </label>
        <textarea
          id="blockersText"
          rows={2}
          value={blockersText}
          onChange={(e) => setBlockersText(e.target.value)}
          className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
          placeholder="e.g., Waiting for API key. If none, leave as is."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Screenshot Evidence (Mandatory)
        </label>
        <ScreenshotUpload onScreenshot={setScreenshotData} />
      </div>

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Cancel
        </button>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Submit Update
        </button>
      </div>
    </form>
  );
};

export default StatusUpdateModal;

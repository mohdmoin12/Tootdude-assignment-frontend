
import { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import * as api from '../services/api';

// Types
export interface Interval {
  start: number;
  end: number;
}

export interface VideoState {
  currentVideo: unknown | null;
  progress: number;
  lastWatchedPosition: number;
  intervals: Interval[];
  isLoading: boolean;
  error: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

type SetVideoAction = { type: 'SET_VIDEO'; payload: unknown };
type SetProgressAction = { type: 'SET_PROGRESS'; payload: { progress: number; lastWatchedPosition: number; intervals: Interval[] } };
type SetIntervalsAction = { type: 'SET_INTERVALS'; payload: Interval[] };
type AddIntervalAction = { type: 'ADD_INTERVAL'; payload: Interval };
type SetLoadingAction = { type: 'SET_LOADING'; payload: boolean };
type SetErrorAction = { type: 'SET_ERROR'; payload: string | null };
type SetPlayingAction = { type: 'SET_PLAYING'; payload: boolean };
type SetCurrentTimeAction = { type: 'SET_CURRENT_TIME'; payload: number };
type SetDurationAction = { type: 'SET_DURATION'; payload: number };
type ResetStateAction = { type: 'RESET_STATE' };

type VideoAction =
  | SetVideoAction
  | SetProgressAction
  | SetIntervalsAction
  | AddIntervalAction
  | SetLoadingAction
  | SetErrorAction
  | SetPlayingAction
  | SetCurrentTimeAction
  | SetDurationAction
  | ResetStateAction;

export interface VideoContextType extends VideoState {
  setVideo: (video: unknown) => void;
  setProgress: (progressData: { progress: number; lastWatchedPosition: number; intervals: Interval[] }) => void;
  addInterval: (interval: Interval) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  resetState: () => void;
  loadProgress: (userId: string, videoId: string) => Promise<void>;
  saveProgress: (
    userId: string,
    videoId: string,
    intervals: Interval[],
    videoDuration: number,
    currentTime: number
  ) => Promise<unknown>;
}

// Initial state
const initialState: VideoState = {
  currentVideo: null,
  progress: 0,
  lastWatchedPosition: 0,
  intervals: [],
  isLoading: false,
  error: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0
};

// Action types
const actionTypes = {
  SET_VIDEO: 'SET_VIDEO',
  SET_PROGRESS: 'SET_PROGRESS',
  SET_INTERVALS: 'SET_INTERVALS',
  ADD_INTERVAL: 'ADD_INTERVAL',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_PLAYING: 'SET_PLAYING',
  SET_CURRENT_TIME: 'SET_CURRENT_TIME',
  SET_DURATION: 'SET_DURATION',
  RESET_STATE: 'RESET_STATE'
} as const;

// Reducer
function videoReducer(state: VideoState, action: VideoAction): VideoState {
  switch (action.type) {
    case actionTypes.SET_VIDEO:
      return {
        ...state,
        currentVideo: action.payload,
        progress: 0,
        lastWatchedPosition: 0,
        intervals: []
      };
    case actionTypes.SET_PROGRESS:
      return {
        ...state,
        progress: action.payload.progress,
        lastWatchedPosition: action.payload.lastWatchedPosition,
        intervals: action.payload.intervals || state.intervals
      };
    case actionTypes.SET_INTERVALS:
      return {
        ...state,
        intervals: action.payload
      };
    case actionTypes.ADD_INTERVAL:
      return {
        ...state,
        intervals: [...state.intervals, action.payload]
      };
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    case actionTypes.SET_PLAYING:
      return {
        ...state,
        isPlaying: action.payload
      };
    case actionTypes.SET_CURRENT_TIME:
      return {
        ...state,
        currentTime: action.payload
      };
    case actionTypes.SET_DURATION:
      return {
        ...state,
        duration: action.payload
      };
    case actionTypes.RESET_STATE:
      return initialState;
    default:
      return state;
  }
}

// Context
const VideoContext = createContext<VideoContextType | undefined>(undefined);

// Provider component
interface VideoProviderProps {
  children: ReactNode;
}

export function VideoProvider({ children }: VideoProviderProps) {
  const [state, dispatch] = useReducer(videoReducer, initialState);

  // Actions
  const setVideo = useCallback((video: unknown) => {
    dispatch({ type: actionTypes.SET_VIDEO, payload: video });
  }, []);

  const setProgress = useCallback((progressData: { progress: number; lastWatchedPosition: number; intervals: Interval[] }) => {
    dispatch({ type: actionTypes.SET_PROGRESS, payload: progressData });
  }, []);

  const addInterval = useCallback((interval: Interval) => {
    dispatch({ type: actionTypes.ADD_INTERVAL, payload: interval });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: actionTypes.SET_ERROR, payload: error });
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
    dispatch({ type: actionTypes.SET_PLAYING, payload: playing });
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    dispatch({ type: actionTypes.SET_CURRENT_TIME, payload: time });
  }, []);

  const setDuration = useCallback((duration: number) => {
    dispatch({ type: actionTypes.SET_DURATION, payload: duration });
  }, []);

  // API calls
  const loadProgress = useCallback(async (userId: string, videoId: string) => {
    try {
      setLoading(true);
      setError(null);
      const progressData = await api.getProgress(userId, videoId);
      setProgress(progressData);
    } catch (error) {
      setError('Failed to load progress');
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setProgress]);

  const saveProgress = useCallback(
    async (
      userId: string,
      videoId: string,
      intervals: Interval[],
      videoDuration: number,
      currentTime: number
    ) => {
      try {
        setError(null);
        const result = await api.saveProgress(userId, videoId, intervals, videoDuration, currentTime);
        setProgress({
          progress: result.progress,
          lastWatchedPosition: result.lastWatchedPosition,
          intervals: state.intervals
        });
        return result;
      } catch (error) {
        setError('Failed to save progress');
        console.error('Error saving progress:', error);
        throw error;
      }
    },
    [state.intervals, setError, setProgress]
  );

  const resetState = useCallback(() => {
    dispatch({ type: actionTypes.RESET_STATE });
  }, []);

  const value: VideoContextType = {
    ...state,
    setVideo,
    setProgress,
    addInterval,
    setLoading,
    setError,
    setPlaying,
    setCurrentTime,
    setDuration,
    resetState,
    loadProgress,
    saveProgress
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
}

// Hook to use the context
export function useVideo() {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
}
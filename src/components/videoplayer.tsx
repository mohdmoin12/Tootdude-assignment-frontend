import { useRef, useEffect, useState, useCallback } from 'react';
import { useVideo } from '../context/VideoContext';

interface VideoPlayerProps {
  videoSrc: string;
  videoId: string;
  userId?: string;
}

interface VideoContextType {
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setPlaying: (playing: boolean) => void;
  loadProgress: (userId: string, videoId: string) => void;
  saveProgress: (
    userId: string,
    videoId: string,
    intervals: { start: number; end: number }[],
    duration: number,
    currentTime: number
  ) => Promise<void>;
  lastWatchedPosition: number;
  progress: number;
  isLoading: boolean;
  error: string | null;
}

const VideoPlayer = ({ videoSrc, videoId, userId = 'demo-user' }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchingStartRef = useRef<number | null>(null);
  const lastSaveTimeRef = useRef(0);
  
  const {
    setDuration,
    setCurrentTime,
    setPlaying,
    loadProgress,
    saveProgress,
    lastWatchedPosition,
    progress,
    isLoading,
    error
  } = useVideo() as VideoContextType;

  const [localIntervals, setLocalIntervals] = useState<Interval[]>([]);
  const [saveStatus, setSaveStatus] = useState('');

  // Debounced save function
  interface Interval {
    start: number;
    end: number;
  }

  type DebouncedSave = (intervals: Interval[], currentTime: number) => Promise<void>;

  const debouncedSave: DebouncedSave = useCallback(
    async (intervals: Interval[], currentTime: number) => {
      const now = Date.now();
      if (now - lastSaveTimeRef.current < 2000) return; // Save at most every 2 seconds
      
      lastSaveTimeRef.current = now;
      
      try {
        if (intervals.length > 0 && videoRef.current) {
          setSaveStatus('Saving...');
          await saveProgress(
            userId, 
            videoId, 
            intervals, 
            videoRef.current.duration, 
            currentTime
          );
          setSaveStatus('Saved ✓');
          setTimeout(() => setSaveStatus(''), 2000);
        }
      } catch (error) {
        setSaveStatus('Save failed ✗');
        setTimeout(() => setSaveStatus(''), 3000);
        console.error('Save error:', error);
      }
    },
    [userId, videoId, saveProgress]
  );

  // Handle play event
  const handlePlay = useCallback(() => {
    setPlaying(true);
    watchingStartRef.current = videoRef.current?.currentTime || 0;
    console.log('Play started at:', watchingStartRef.current);
  }, [setPlaying]);

  // Handle pause event
  const handlePause = useCallback(() => {
    setPlaying(false);
    
    if (watchingStartRef.current !== null && videoRef.current) {
      const endTime = videoRef.current.currentTime;
      const startTime = watchingStartRef.current;
      
      if (endTime > startTime) {
        const newInterval = { start: startTime, end: endTime };
        console.log('Adding interval:', newInterval);
        
        setLocalIntervals(prev => {
          const updated = [...prev, newInterval];
          debouncedSave(updated, endTime);
          return updated;
        });
      }
    }
    
    watchingStartRef.current = null;
  }, [setPlaying, debouncedSave]);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      setCurrentTime(currentTime);
      
      // Check for seeking (gap in watching)
      if (watchingStartRef.current !== null) {
        const timeDiff = Math.abs(currentTime - watchingStartRef.current);
        if (timeDiff > 2) { // If user seeked more than 2 seconds
          // Save the previous interval
          const newInterval = { 
            start: watchingStartRef.current, 
            end: Math.min(watchingStartRef.current + timeDiff, currentTime)
          };
          
          setLocalIntervals(prev => {
            const updated = [...prev, newInterval];
            debouncedSave(updated, currentTime);
            return updated;
          });
          
          // Start new interval
          watchingStartRef.current = currentTime;
        }
      }
    }
  }, [setCurrentTime, debouncedSave]);

  // Handle loaded metadata
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      
      // Resume from last watched position
      if (lastWatchedPosition > 0) {
        videoRef.current.currentTime = lastWatchedPosition;
        console.log('Resumed from:', lastWatchedPosition);
      }
    }
  }, [setDuration, lastWatchedPosition]);

  // Handle ended
  const handleEnded = useCallback(() => {
    handlePause(); // Save final interval
    setPlaying(false);
  }, [handlePause, setPlaying]);

  // Load progress on mount
  useEffect(() => {
    if (videoId && userId) {
      loadProgress(userId, videoId);
    }
  }, [videoId, userId, loadProgress]);

  // Save progress on unmount or when component updates
  useEffect(() => {
    return () => {
      if (localIntervals.length > 0 && videoRef.current) {
        debouncedSave(localIntervals, videoRef.current.currentTime);
      }
    };
  }, [localIntervals, debouncedSave]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="video-player-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          src={videoSrc}
          controls
          width="100%"
          height="400"
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div className="video-info">
        <div className="progress-section">
          <div className="progress-bar-container">
            <div className="progress-label">
              Progress: {progress.toFixed(1)}%
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="status-info">
            {isLoading && <span className="status loading">Loading...</span>}
            {error && <span className="status error">{error}</span>}
            {saveStatus && <span className="status save">{saveStatus}</span>}
          </div>
        </div>
        
        <div className="video-stats">
          <p><strong>Last watched:</strong> {Math.floor(lastWatchedPosition)}s</p>
          <p><strong>Intervals tracked:</strong> {localIntervals.length}</p>
          <p><strong>Video ID:</strong> {videoId}</p>
          <p><strong>User ID:</strong> {userId}</p>
        </div>
      </div>

      <style>{`
        .video-player-container {
          max-width: 800px;
          margin: 0 auto;
          background: #f5f5f5;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .video-wrapper {
          position: relative;
          margin-bottom: 20px;
        }

        .video-info {
          background: white;
          padding: 15px;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .progress-section {
          margin-bottom: 15px;
        }

        .progress-label {
          font-weight: bold;
          margin-bottom: 8px;
          color: #333;
        }

        .progress-bar-container {
          margin-bottom: 10px;
        }

        .progress-bar {
          width: 100%;
          height: 20px;
          background-color: #e0e0e0;
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #45a049);
          transition: width 0.3s ease;
          border-radius: 10px;
        }

        .status-info {
          text-align: center;
          min-height: 20px;
        }

        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }

        .status.loading {
          background: #2196F3;
          color: white;
        }

        .status.error {
          background: #f44336;
          color: white;
        }

        .status.save {
          background: #4CAF50;
          color: white;
        }

        .video-stats {
          font-size: 14px;
          color: #666;
        }

        .video-stats p {
          margin: 5px 0;
        }

        .video-stats strong {
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
/* eslint-disable */


import { useState, useEffect } from 'react';
import { useVideo } from '../context/VideoContext';
import * as api from '../services/api';

// Define proper types
type VideoInterval = {
  start: number;
  end: number;
};

type ProgressItem = {
  videoId: string;
  progress: number;
  videoDuration: number;
  lastWatchedPosition: number;
  intervals: VideoInterval[];
  updatedAt: string;
};

// Props interface
interface ProgressDashboardProps {
  userId?: string;
}

// Video context type (define what you expect from useVideo hook)
interface VideoContextType {
  progress: number;
  lastWatchedPosition: number;
  intervals: VideoInterval[];
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ userId = 'demo-user' }) => {
  const [userProgress, setUserProgress] = useState<ProgressItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Type assertion for useVideo hook (adjust based on your actual VideoContext)
  const { progress, lastWatchedPosition, intervals } = useVideo() as VideoContextType;

  // Load user's progress for all videos
  useEffect(() => {
    const loadUserProgress = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.getUserProgress(userId);
        const progressData: ProgressItem[] = (response as any).data;

        setUserProgress(progressData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load progress data';
        setError(errorMessage);
        console.error('Error loading user progress:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProgress();
  }, [userId]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="progress-dashboard">
      <h2>Progress Dashboard</h2>
      
      {/* Current Session Stats */}
      <div className="current-session">
        <h3>Current Session</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{progress.toFixed(1)}%</div>
            <div className="stat-label">Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatTime(lastWatchedPosition)}</div>
            <div className="stat-label">Last Position</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{intervals.length}</div>
            <div className="stat-label">Intervals</div>
          </div>
        </div>
      </div>

      {/* Historical Progress */}
      <div className="historical-progress">
        <h3>All Videos Progress</h3>
        
        {isLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading progress data...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>❌ {error}</p>
          </div>
        )}

        {!isLoading && !error && userProgress.length === 0 && (
          <div className="empty-state">
            <p>No progress data found. Start watching some videos!</p>
          </div>
        )}

        {!isLoading && !error && userProgress.length > 0 && (
          <div className="progress-list">
            {userProgress.map((item: ProgressItem, index: number) => (
              <div key={`progress-${item.videoId}-${index}`} className="progress-item">
                <div className="progress-header">
                  <h4>Video ID: {item.videoId}</h4>
                  <span className="progress-percentage">
                    {item.progress.toFixed(1)}%
                  </span>
                </div>
                
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(item.progress, 100)}%` }}
                  ></div>
                </div>
                
                <div className="progress-details">
                  <div className="detail-row">
                    <span>Duration: {formatDuration(item.videoDuration)}</span>
                    <span>Last watched: {formatTime(item.lastWatchedPosition)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Intervals: {item.intervals.length}</span>
                    <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Intervals visualization */}
                <div className="intervals-viz">
                  <div className="intervals-timeline">
                    {item.intervals.map((interval: VideoInterval, idx: number) => (
                      <div
                        key={`interval-${item.videoId}-${idx}`}
                        className="interval-block"
                        style={{
                          left: `${(interval.start / item.videoDuration) * 100}%`,
                          width: `${((interval.end - interval.start) / item.videoDuration) * 100}%`
                        }}
                        title={`${formatTime(interval.start)} - ${formatTime(interval.end)}`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .progress-dashboard {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .progress-dashboard h2 {
          color: #333;
          border-bottom: 2px solid #4CAF50;
          padding-bottom: 10px;
          margin-bottom: 30px;
        }

        .current-session {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .current-session h3 {
          margin-top: 0;
          color: #4CAF50;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .stat-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
          text-align: center;
          border: 1px solid #e9ecef;
        }

        .stat-value {
          font-size: 2em;
          font-weight: bold;
          color: #4CAF50;
          margin-bottom: 5px;
        }

        .stat-label {
          color: #666;
          font-size: 0.9em;
        }

        .historical-progress {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .historical-progress h3 {
          margin-top: 0;
          color: #333;
        }

        .loading-state, .error-state, .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4CAF50;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .progress-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .progress-item {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          background: #fafafa;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .progress-header h4 {
          margin: 0;
          color: #333;
        }

        .progress-percentage {
          font-size: 1.2em;
          font-weight: bold;
          color: #4CAF50;
        }

        .progress-bar {
          width: 100%;
          height: 12px;
          background-color: #e0e0e0;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 15px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #45a049);
          transition: width 0.3s ease;
          border-radius: 6px;
        }

        .progress-details {
          font-size: 0.9em;
          color: #666;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        .intervals-viz {
          margin-top: 15px;
        }

        .intervals-timeline {
          position: relative;
          height: 20px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }

        .interval-block {
          position: absolute;
          height: 100%;
          background: #2196F3;
          opacity: 0.7;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .interval-block:hover {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .progress-dashboard {
            padding: 15px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .progress-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .detail-row {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressDashboard;
/* eslint-disable */

import { useState } from 'react';
import { useVideo } from '../context/VideoContext';

// Define Video type
type Video = {
  id: string;
  title: string;
  url: string;
  thumbnail: string | null;
  duration: string;
};

// Props interface
interface VideoSelectorProps {
  onVideoSelect: (video: Video) => void;
}

// Video context type (define what you expect from useVideo hook)
interface VideoContextType {
  setVideo: (video: Video) => void;
  resetState: () => void;
}

// Event handler types
type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
type ButtonClickEvent = React.MouseEvent<HTMLButtonElement>;

const VideoSelector: React.FC<VideoSelectorProps> = ({ onVideoSelect }) => {
  const [customVideoUrl, setCustomVideoUrl] = useState<string>('');
  const [customVideoId, setCustomVideoId] = useState<string>('');
  
  // Type assertion for useVideo hook (adjust based on your actual VideoContext)
  const { setVideo, resetState } = useVideo() as VideoContextType;

  // Sample videos for demo - properly typed
  const sampleVideos: Video[] = [
    {
      id: 'sample-1',
      title: 'Big Buck Bunny (Sample)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      duration: '9:56'
    },
    {
      id: 'sample-2',
      title: 'Elephant Dream (Sample)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
      duration: '10:54'
    },
    {
      id: 'sample-3',
      title: 'For Bigger Blazes (Sample)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
      duration: '0:15'
    }
  ];

  const handleVideoSelect = (video: Video): void => {
    resetState();
    setVideo(video);
    onVideoSelect(video);
  };

  const handleCustomVideo = (): void => {
    if (!customVideoUrl.trim()) {
      alert('Please enter a video URL');
      return;
    }

    const videoId: string = customVideoId.trim() || `custom-${Date.now()}`;
    const customVideo: Video = {
      id: videoId,
      title: `Custom Video (${videoId})`,
      url: customVideoUrl.trim(),
      thumbnail: null,
      duration: 'Unknown'
    };

    handleVideoSelect(customVideo);
    setCustomVideoUrl('');
    setCustomVideoId('');
  };

  const handleUrlChange = (e: InputChangeEvent): void => {
    setCustomVideoUrl(e.target.value);
  };

  const handleIdChange = (e: InputChangeEvent): void => {
    setCustomVideoId(e.target.value);
  };

  const handleCustomVideoClick = (e: ButtonClickEvent): void => {
    e.preventDefault();
    handleCustomVideo();
  };

  const handleVideoClick = (video: Video) => (e: ButtonClickEvent): void => {
    e.preventDefault();
    handleVideoSelect(video);
  };

  return (
    <div className="video-selector">
      <h2>Select a Video to Watch</h2>
      
      {/* Sample Videos */}
      <div className="sample-videos">
        <h3>Sample Videos</h3>
        <div className="video-grid">
          {sampleVideos.map((video: Video) => (
            <div key={video.id} className="video-card">
              <div className="video-thumbnail">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} />
                ) : (
                  <div className="no-thumbnail">📹</div>
                )}
                <div className="duration-badge">{video.duration}</div>
              </div>
              <div className="video-info">
                <h4>{video.title}</h4>
                <p>ID: {video.id}</p>
                <button 
                  onClick={handleVideoClick(video)}
                  className="select-btn"
                  type="button"
                >
                  Watch Video
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Video Input */}
      <div className="custom-video">
        <h3>Add Custom Video</h3>
        <div className="custom-form">
          <div className="form-row">
            <label htmlFor="video-url">Video URL:</label>
            <input
              id="video-url"
              type="url"
              value={customVideoUrl}
              onChange={handleUrlChange}
              placeholder="https://example.com/video.mp4"
              className="url-input"
            />
          </div>
          <div className="form-row">
            <label htmlFor="video-id">Video ID (optional):</label>
            <input
              id="video-id"
              type="text"
              value={customVideoId}
              onChange={handleIdChange}
              placeholder="my-video-id"
              className="id-input"
            />
          </div>
          <button 
            onClick={handleCustomVideoClick}
            className="add-btn"
            disabled={!customVideoUrl.trim()}
            type="button"
          >
            Add & Watch Video
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="instructions">
        <h3>How it works:</h3>
        <ul>
          <li>🎥 Select a video to start watching</li>
          <li>📊 Your progress is automatically tracked</li>
          <li>⏸️ Progress is saved when you pause or seek</li>
          <li>🔄 Resume from where you left off</li>
          <li>📈 View your progress in the dashboard</li>
        </ul>
      </div>

    {(
  <style jsx>{`
    .video-selector {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .video-selector h2 {
      color: #333;
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #4CAF50;
      padding-bottom: 10px;
    }

    .sample-videos, .custom-video, .instructions {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .sample-videos h3, .custom-video h3, .instructions h3 {
      margin-top: 0;
      color: #4CAF50;
      margin-bottom: 20px;
    }

    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .video-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .video-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .video-thumbnail {
      position: relative;
      height: 160px;
      background: #f0f0f0;
      overflow: hidden;
    }

    .video-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-thumbnail {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-size: 3em;
      color: #999;
    }

    .duration-badge {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8em;
    }

    .video-info {
      padding: 15px;
    }

    .video-info h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1.1em;
    }

    .video-info p {
      margin: 0 0 15px 0;
      color: #666;
      font-size: 0.9em;
    }

    .select-btn, .add-btn {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.2s;
      width: 100%;
    }

    .select-btn:hover, .add-btn:hover {
      background: #45a049;
    }

    .add-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .custom-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .form-row {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .form-row label {
      font-weight: bold;
      color: #333;
    }

    .url-input, .id-input {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1em;
    }

    .url-input:focus, .id-input:focus {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 5px rgba(76,175,80,0.3);
    }

    .instructions ul {
      list-style: none;
      padding: 0;
    }

    .instructions li {
      padding: 8px 0;
      color: #555;
    }

    @media (max-width: 768px) {
      .video-selector {
        padding: 15px;
      }

      .video-grid {
        grid-template-columns: 1fr;
      }

      .form-row {
        margin-bottom: 15px;
      }
    }
  `}</style>
) as any}

    </div>
  );
};

export default VideoSelector;
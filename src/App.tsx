import { useState } from 'react';
import { VideoProvider } from './context/VideoContext';
import VideoPlayer from './components/videoplayer';
import VideoSelector from './components/videoSelector';
import ProgressDashboard from './components/progressDashboard';
import './App.css';

function App() {
  interface Video {
    id: string;
    title: string;
    url: string;
  }

  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [activeTab, setActiveTab] = useState('selector');
  const [userId] = useState('demo-user'); // In real app, this would come from auth

  const handleVideoSelect = (video: Video) => {
    setCurrentVideo(video);
    setActiveTab('player');
  };

  const handleBackToSelector = () => {
    setActiveTab('selector');
  };

  const handleViewDashboard = () => {
    setActiveTab('dashboard');
  };

  return (
    <VideoProvider>
      <div className="App">
        <header className="app-header">
          <h1>🎥 Video Progress Tracker</h1>
          <p>Track your video watching progress with automatic resume functionality</p>
          
          <nav className="app-nav">
            <button 
              className={`nav-btn ${activeTab === 'selector' ? 'active' : ''}`}
              onClick={() => setActiveTab('selector')}
            >
              📋 Select Video
            </button>
            <button 
              className={`nav-btn ${activeTab === 'player' ? 'active' : ''}`}
              onClick={() => setActiveTab('player')}
              disabled={!currentVideo}
            >
              ▶️ Video Player
            </button>
            <button 
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
          </nav>
        </header>

        <main className="app-main">
          {activeTab === 'selector' && (
            <VideoSelector onVideoSelect={handleVideoSelect} />
          )}
          
          {activeTab === 'player' && currentVideo && (
            <div className="player-section">
              <div className="player-header">
                <button onClick={handleBackToSelector} className="back-btn">
                  ← Back to Selection
                </button>
                <h2>Now Playing: {currentVideo.title}</h2>
                <button onClick={handleViewDashboard} className="dashboard-btn">
                  View Dashboard →
                </button>
              </div>
              
              <VideoPlayer 
                videoSrc={currentVideo.url}
                videoId={currentVideo.id}
                userId={userId}
              />
            </div>
          )}
          
          {activeTab === 'player' && !currentVideo && (
            <div className="no-video">
              <h2>No video selected</h2>
              <p>Please select a video from the selector tab</p>
              <button onClick={() => setActiveTab('selector')} className="select-video-btn">
                Select Video
              </button>
            </div>
          )}
          
          {activeTab === 'dashboard' && (
            <ProgressDashboard userId={userId} />
          )}
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <p>
              <strong>User ID:</strong> {userId} | 
              <strong> Current Video:</strong> {currentVideo ? currentVideo.id : 'None'} | 
              <strong> Status:</strong> Ready
            </p>
            <div className="tech-stack">
              <span>Built with: React + Node.js + Express</span>
            </div>
          </div>
        </footer>
      </div>
    </VideoProvider>
  );
}

export default App;
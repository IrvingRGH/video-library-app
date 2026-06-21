import { useState, useEffect } from 'react';
import VideoLibrary from './components/VideoLibrary';
import VideoPlayer from './components/VideoPlayer';
import AddVideoDialog from './components/AddVideoDialog';
import EditVideoDialog from './components/EditVideoDialog';
import { storage } from './services/storage';
import './App.css';

// List of adult site base domains to filter in Friendly Mode (without TLD to catch .com, .es, .net, etc.)
const ADULT_SITES = [
  // General adult sites (base names to catch all TLDs)
  'pornhub', 'xvideos', 'xnxx', 'xhamster',
  'onlyfans', 'chaturbate', 'spankbang', 'youporn',
  'tube8', 'livejasmin', 'redtube', 'brazzers',
  'bangbros', 'realitykings', 'mofos', 'naughtyamerica',
  'eporner', 'tnaflix', 'porntrex', 'hqporner',
  'daftsex', 'fapdu', 'hclips', 'txxx', 'vjav',
  // JAV sites
  'missav', 'jav.guru', 'javmost', 'javhdporn', 'javlibrary',
  'r18.com', 'japanhdv', 'supjav', 'javgg', 'javhd',
  'javbangers', 'jable', 'javhub', 'javfinder', 'javseen',
  // Hentai/Anime adult
  'hanime', 'hentaigasm', 'hentaihaven', 'hentai.tv',
  'nhentai', 'rule34', 'e-hentai', 'hitomi.la',
  // Cam sites  
  'stripchat', 'bongacams', 'cam4.com', 'camsoda',
  'myfreecams', 'flirt4free', 'imlive',
  // Other adult content
  'fapello', 'thothub', 'coomer.party', 'simpcity'
];

function App() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState(null);
  const [friendlyMode, setFriendlyMode] = useState(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem('friendlyMode');
    return saved === 'true';
  });

  // Load videos from storage on mount
  useEffect(() => {
    const savedVideos = storage.getVideos();
    setVideos(savedVideos);
  }, []);

  // Save friendly mode preference
  useEffect(() => {
    localStorage.setItem('friendlyMode', friendlyMode.toString());
  }, [friendlyMode]);

  // Check if a video URL is from an adult site
  const isAdultContent = (video) => {
    // Check by platform label first
    if (video.platform && video.platform.toLowerCase() === 'adulto') {
      return true;
    }
    // Check all possible URL fields
    const urlsToCheck = [
      video.url,
      video.embedUrl,
      video.originalUrl,
      video.title // Sometimes URL is in title
    ].filter(Boolean).map(u => u.toLowerCase());

    return urlsToCheck.some(url =>
      ADULT_SITES.some(site => url.includes(site.toLowerCase()))
    );
  };

  // Filter videos based on friendly mode
  const filteredVideos = friendlyMode
    ? videos.filter(video => !isAdultContent(video))
    : videos;

  const handleAddVideo = (video) => {
    const newVideo = storage.addVideo(video);
    setVideos(storage.getVideos());
    setSelectedVideo(newVideo);
  };

  const handleDeleteVideo = (videoId) => {
    storage.removeVideo(videoId);
    setVideos(storage.getVideos());
    if (selectedVideo?.id === videoId) {
      setSelectedVideo(null);
    }
  };

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
  };

  const handleEditVideo = (video) => {
    setVideoToEdit(video);
  };

  const handleSaveVideo = (updatedVideo) => {
    storage.updateVideo(updatedVideo.id, updatedVideo);
    setVideos(storage.getVideos());
    // Update selected video if it was the one being edited
    if (selectedVideo?.id === updatedVideo.id) {
      setSelectedVideo(updatedVideo);
    }
  };

  const toggleFriendlyMode = () => {
    setFriendlyMode(prev => !prev);
    // If enabling friendly mode and current video is adult, deselect it
    if (!friendlyMode && selectedVideo && isAdultContent(selectedVideo)) {
      setSelectedVideo(null);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            <h1>Video Library</h1>
          </div>

          <div className="header-actions">
            <button
              className={`btn btn-friendly ${friendlyMode ? 'active' : ''}`}
              onClick={toggleFriendlyMode}
              title={friendlyMode ? 'Modo Friendly: Activado' : 'Modo Friendly: Desactivado'}
            >
              {friendlyMode ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                  Modo Friendly
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Ver Todo
                </>
              )}
            </button>

            <button className="btn btn-primary" onClick={() => setShowAddDialog(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Agregar Video
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <aside className="app-sidebar">
          <VideoLibrary
            videos={filteredVideos}
            selectedVideo={selectedVideo}
            onSelectVideo={handleSelectVideo}
            onDeleteVideo={handleDeleteVideo}
            onEditVideo={handleEditVideo}
          />
        </aside>

        <div className="app-player">
          <VideoPlayer video={selectedVideo} />
        </div>
      </main>

      {/* Add Video Dialog */}
      {showAddDialog && (
        <AddVideoDialog
          onAdd={handleAddVideo}
          onClose={() => setShowAddDialog(false)}
        />
      )}

      {/* Edit Video Dialog */}
      {videoToEdit && (
        <EditVideoDialog
          video={videoToEdit}
          onSave={handleSaveVideo}
          onClose={() => setVideoToEdit(null)}
        />
      )}
    </div>
  );
}

export default App;

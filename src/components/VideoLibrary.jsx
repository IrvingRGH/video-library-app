import { useState } from 'react';
import './VideoLibrary.css';

export default function VideoLibrary({ videos, onSelectVideo, onDeleteVideo, onEditVideo, selectedVideo }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVideos = videos.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = (e, videoId) => {
        e.stopPropagation();
        if (confirm('¿Estás seguro de que quieres eliminar este video?')) {
            onDeleteVideo(videoId);
        }
    };

    const handleEdit = (e, video) => {
        e.stopPropagation();
        onEditVideo(video);
    };

    return (
        <div className="video-library">
            <div className="library-header">
                <h1>Mi Biblioteca</h1>
                <p className="video-count">{videos.length} videos</p>
            </div>

            <div className="library-search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                    type="text"
                    className="input search-input"
                    placeholder="Buscar videos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="video-grid">
                {filteredVideos.length === 0 ? (
                    <div className="empty-library">
                        <p>No hay videos en tu biblioteca</p>
                    </div>
                ) : (
                    filteredVideos.map(video => (
                        <div
                            key={video.id}
                            className={`video-card ${selectedVideo?.id === video.id ? 'active' : ''}`}
                            onClick={() => onSelectVideo(video)}
                        >
                            <div className="video-thumbnail">
                                <img src={video.thumbnail} alt={video.title} loading="lazy" />
                                <div className="play-overlay">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                </div>
                                <div className="card-actions">
                                    <button
                                        className="action-button edit-button"
                                        onClick={(e) => handleEdit(e, video)}
                                        title="Editar video"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                    </button>
                                    <button
                                        className="action-button delete-button"
                                        onClick={(e) => handleDelete(e, video.id)}
                                        title="Eliminar video"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="video-info">
                                <h3 className="video-title">{video.title}</h3>
                                <div className="video-meta">
                                    <span className="platform-tag">{video.platform}</span>
                                    <span className="video-date">
                                        {new Date(video.addedDate).toLocaleDateString('es-ES', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

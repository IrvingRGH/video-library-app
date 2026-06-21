import { useState, useEffect, useRef } from 'react';
import './VideoPlayer.css';

export default function VideoPlayer({ video, onClose }) {
    const [isLoading, setIsLoading] = useState(true);
    const previousVideoIdRef = useRef(null);

    useEffect(() => {
        // Only show loading if the video ID actually changed
        if (video && video.id !== previousVideoIdRef.current) {
            setIsLoading(true);
            previousVideoIdRef.current = video?.id;
        }
    }, [video]);

    if (!video) {
        return (
            <div className="video-player-empty">
                <div className="empty-state">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <h2>Selecciona un video</h2>
                    <p>Elige un video de tu biblioteca para reproducirlo</p>
                </div>
            </div>
        );
    }

    return (
        <div className="video-player">
            <div className="player-header">
                <div className="player-info">
                    <h2>{video.title}</h2>
                    <span className="platform-badge">{video.platform}</span>
                </div>
                {onClose && (
                    <button className="btn btn-icon btn-secondary" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
            </div>

            <div className="player-container">
                {isLoading && <div className="player-loading shimmer"></div>}

                {video.platform === 'direct' ? (
                    <video
                        src={video.embedUrl}
                        controls
                        autoPlay
                        className="video-element"
                        onLoadedData={() => setIsLoading(false)}
                    >
                        Tu navegador no soporta el elemento de video.
                    </video>
                ) : (
                    <iframe
                        src={video.embedUrl}
                        className="video-iframe"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={() => setIsLoading(false)}
                    ></iframe>
                )}
            </div>

            {video.description && (
                <div className="player-description">
                    <h3>Descripción</h3>
                    <p>{video.description}</p>
                </div>
            )}
        </div>
    );
}

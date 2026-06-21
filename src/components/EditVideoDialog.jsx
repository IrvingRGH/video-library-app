import { useState } from 'react';
import ScreenCapture from './ScreenCapture';
import './AddVideoDialog.css';

export default function EditVideoDialog({ video, onSave, onClose }) {
    const [title, setTitle] = useState(video.title || '');
    const [description, setDescription] = useState(video.description || '');
    const [customThumbnail, setCustomThumbnail] = useState(video.thumbnail || null);
    const [thumbnailPreview, setThumbnailPreview] = useState(video.thumbnail || null);
    const [showScreenCapture, setShowScreenCapture] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const updatedVideo = {
            ...video,
            title: title.trim() || video.title,
            description: description.trim(),
            thumbnail: customThumbnail || video.thumbnail
        };

        onSave(updatedVideo);
        onClose();
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Por favor selecciona un archivo de imagen válido');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('La imagen no debe superar los 5MB');
                return;
            }

            setError('');

            const reader = new FileReader();
            reader.onload = (event) => {
                setCustomThumbnail(event.target.result);
                setThumbnailPreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeThumbnail = () => {
        // Reset to original thumbnail
        setCustomThumbnail(video.thumbnail);
        setThumbnailPreview(video.thumbnail);
    };

    const handleScreenCapture = (capturedImage) => {
        setCustomThumbnail(capturedImage);
        setThumbnailPreview(capturedImage);
        setShowScreenCapture(false);
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal add-video-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Editar Video</h2>
                        <button className="btn btn-icon btn-secondary" onClick={onClose}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="add-video-form">
                        <div className="form-group">
                            <label>URL del Video</label>
                            <div className="url-display">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                </svg>
                                <span className="url-text">{video.url || video.embedUrl}</span>
                            </div>
                            <small className="form-hint">La URL no puede ser modificada</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="title">Título</label>
                            <input
                                type="text"
                                id="title"
                                className="input"
                                placeholder="Mi video favorito..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Descripción</label>
                            <textarea
                                id="description"
                                className="input textarea"
                                placeholder="Agrega una descripción..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Miniatura</label>
                            <div className="thumbnail-preview">
                                <img src={thumbnailPreview} alt="Preview" />
                                <div className="thumbnail-actions">
                                    <input
                                        type="file"
                                        id="thumbnail-edit"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="thumbnail-edit" className="btn btn-secondary btn-sm">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="17 8 12 3 7 8"></polyline>
                                            <line x1="12" y1="3" x2="12" y2="15"></line>
                                        </svg>
                                        Subir
                                    </label>
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        onClick={() => setShowScreenCapture(true)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                        Capturar
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="error-message">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                {error}
                            </div>
                        )}

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                    <polyline points="7 3 7 8 15 8"></polyline>
                                </svg>
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showScreenCapture && (
                <ScreenCapture
                    onCapture={handleScreenCapture}
                    onClose={() => setShowScreenCapture(false)}
                />
            )}
        </>
    );
}

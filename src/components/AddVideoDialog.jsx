import { useState } from 'react';
import { videoHelpers } from '../services/storage';
import ScreenCapture from './ScreenCapture';
import './AddVideoDialog.css';

export default function AddVideoDialog({ onAdd, onClose }) {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [customThumbnail, setCustomThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [showScreenCapture, setShowScreenCapture] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validate URL
        if (!url.trim()) {
            setError('Por favor ingresa una URL de video');
            return;
        }

        // Extract URL from iframe if HTML code was pasted
        let videoUrl = url.trim();

        // Check if user pasted iframe HTML code
        if (videoUrl.includes('<iframe')) {
            const srcMatch = videoUrl.match(/src=["']([^"']+)["']/i);
            if (srcMatch && srcMatch[1]) {
                videoUrl = srcMatch[1];
                // Update the input field with extracted URL
                setUrl(videoUrl);
            } else {
                setError('No se pudo extraer la URL del iframe. Asegúrate de copiar el código completo.');
                return;
            }
        }

        // Check if URL is valid
        try {
            new URL(videoUrl);
        } catch {
            setError('URL inválida. Por favor verifica la URL del video');
            return;
        }

        const platform = videoHelpers.detectPlatform(videoUrl);
        // Aceptar cualquier URL - la detectPlatform ahora retorna 'iframe' por defecto

        const embedUrl = videoHelpers.getEmbedUrl(videoUrl, platform);
        const thumbnail = customThumbnail || videoHelpers.getThumbnail(videoUrl, platform);

        const newVideo = {
            url: videoUrl,
            title: title.trim() || 'Video sin título',
            description: description.trim(),
            platform,
            embedUrl,
            thumbnail
        };

        onAdd(newVideo);
        onClose();
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Por favor selecciona una imagen válida (JPG, PNG, GIF)');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('La imagen es demasiado grande. Máximo 5MB');
                return;
            }

            // Read file and convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomThumbnail(reader.result);
                setThumbnailPreview(reader.result);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const removeThumbnail = () => {
        setCustomThumbnail(null);
        setThumbnailPreview(null);
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
                        <h2>Agregar Video</h2>
                        <button className="btn btn-icon btn-secondary" onClick={onClose}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="add-video-form">
                        <div className="form-group">
                            <label htmlFor="url">URL del Video o Código Iframe *</label>
                            <input
                                type="text"
                                id="url"
                                className="input"
                                placeholder='https://... o <iframe src="...">'
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                autoFocus
                            />
                            <small className="form-hint">
                                Pega la URL directa o el código completo del iframe (&lt;iframe src="..."&gt;)
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="title">Título (opcional)</label>
                            <input
                                type="text"
                                id="title"
                                className="input"
                                placeholder="Mi video favorito..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Descripción (opcional)</label>
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
                            <label htmlFor="thumbnail">Miniatura Personalizada (opcional)</label>
                            {thumbnailPreview ? (
                                <div className="thumbnail-preview">
                                    <img src={thumbnailPreview} alt="Preview" />
                                    <button
                                        type="button"
                                        className="btn btn-secondary remove-thumbnail"
                                        onClick={removeThumbnail}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                        Quitar imagen
                                    </button>
                                </div>
                            ) : (
                                <div className="thumbnail-upload">
                                    <input
                                        type="file"
                                        id="thumbnail"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="thumbnail" className="btn btn-secondary upload-label">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="17 8 12 3 7 8"></polyline>
                                            <line x1="12" y1="3" x2="12" y2="15"></line>
                                        </svg>
                                        Subir imagen
                                    </label>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => setShowScreenCapture(true)}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                        Capturar Pantalla
                                    </button>
                                </div>
                            )}
                            <small className="form-hint">
                                Captura un screenshot del video y súbelo aquí (JPG, PNG, GIF - Max 5MB)
                            </small>
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
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                Agregar Video
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

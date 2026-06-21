import { useState } from 'react';
import './ScreenCapture.css';

export default function ScreenCapture({ onCapture, onClose }) {
    const [capturedImage, setCapturedImage] = useState(null);
    const [availableScreens, setAvailableScreens] = useState([]);
    const [selectedScreen, setSelectedScreen] = useState(null);
    const [selection, setSelection] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [startPoint, setStartPoint] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState(null);

    const handleCaptureScreen = async () => {
        console.log('handleCaptureScreen called');
        setIsCapturing(true);
        setError(null);

        // Check if running in Electron with screenshot API available
        if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.screenshot) {
            try {
                // Use captureWithHide to minimize window before capturing
                const captureFunction = window.electronAPI.screenshot.captureWithHide || window.electronAPI.screenshot.capture;
                console.log('Calling capture function...');

                const result = await captureFunction();
                console.log('Screenshot result:', result ? 'Got data' : 'null');

                if (result) {
                    // Check if it's the new format with multiple screens
                    if (result.screens && result.screens.length > 0) {
                        setAvailableScreens(result.screens);
                        if (result.screens.length === 1) {
                            // Single monitor, use directly
                            setCapturedImage(result.primary);
                            setSelectedScreen(0);
                        } else {
                            // Multiple monitors, let user select
                            setSelectedScreen(null);
                        }
                    } else if (typeof result === 'string') {
                        // Old format - direct base64 string
                        setCapturedImage(result);
                    } else {
                        setError('Formato de captura no reconocido');
                    }
                } else {
                    setError('No se pudo capturar la pantalla. Intenta de nuevo.');
                }
            } catch (err) {
                console.error('Error capturing screenshot:', err);
                setError('Error al capturar la pantalla: ' + err.message);
            }
        } else {
            console.log('electronAPI not available');
            setError('Función de captura solo disponible en la app de Electron. Por favor reinicia la aplicación.');
        }

        setIsCapturing(false);
    };

    const handleSelectScreen = (index) => {
        setSelectedScreen(index);
        setCapturedImage(availableScreens[index].thumbnail);
    };

    const handleMouseDown = (e) => {
        if (!capturedImage) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setStartPoint({ x, y });
        setIsSelecting(true);
    };

    const handleMouseMove = (e) => {
        if (!isSelecting || !startPoint) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setSelection({
            x: Math.min(startPoint.x, x),
            y: Math.min(startPoint.y, y),
            width: Math.abs(x - startPoint.x),
            height: Math.abs(y - startPoint.y)
        });
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
    };

    const handleConfirm = () => {
        if (!capturedImage || !selection) return;

        // Get the displayed image element to calculate correct scale
        const displayedImg = document.querySelector('.capture-canvas img');
        if (!displayedImg) return;

        const displayedWidth = displayedImg.clientWidth;
        const displayedHeight = displayedImg.clientHeight;

        // Create canvas to crop the selected region
        const img = new Image();
        img.onload = () => {
            // Calculate scale factor: original size / displayed size
            const scaleX = img.naturalWidth / displayedWidth;
            const scaleY = img.naturalHeight / displayedHeight;

            // Calculate the actual crop dimensions in the original image
            const cropX = Math.round(selection.x * scaleX);
            const cropY = Math.round(selection.y * scaleY);
            const cropWidth = Math.round(selection.width * scaleX);
            const cropHeight = Math.round(selection.height * scaleY);

            // Create canvas with the cropped size (at original scale)
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = cropWidth;
            canvas.height = cropHeight;

            ctx.drawImage(
                img,
                cropX,
                cropY,
                cropWidth,
                cropHeight,
                0,
                0,
                cropWidth,
                cropHeight
            );

            const croppedImage = canvas.toDataURL('image/png');
            onCapture(croppedImage);
            onClose();
        };
        img.src = capturedImage;
    };

    return (
        <div className="screen-capture-overlay">
            <div className="screen-capture-modal">
                <div className="capture-header">
                    <h2>Capturar Miniatura</h2>
                    <button className="btn btn-icon btn-secondary" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="capture-content">
                    {!capturedImage && availableScreens.length === 0 ? (
                        <div className="capture-instructions">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <h3>Captura tu pantalla</h3>
                            <p>La ventana se minimizará para capturar tu escritorio</p>

                            {error && (
                                <div className="capture-error">
                                    {error}
                                </div>
                            )}

                            <button
                                className="btn btn-primary"
                                onClick={handleCaptureScreen}
                                disabled={isCapturing}
                            >
                                {isCapturing ? (
                                    <>
                                        <span className="spinner"></span>
                                        Capturando...
                                    </>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                        Capturar Pantalla
                                    </>
                                )}
                            </button>
                        </div>
                    ) : availableScreens.length > 1 && selectedScreen === null ? (
                        <div className="monitor-selector">
                            <h3>Selecciona un monitor</h3>
                            <p>Tienes {availableScreens.length} monitores. Elige cuál quieres capturar:</p>
                            <div className="monitors-grid">
                                {availableScreens.map((screen, index) => (
                                    <div
                                        key={screen.id}
                                        className="monitor-option"
                                        onClick={() => handleSelectScreen(index)}
                                    >
                                        <img src={screen.thumbnail} alt={screen.name} />
                                        <span className="monitor-name">{screen.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="capture-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setAvailableScreens([]);
                                        setCapturedImage(null);
                                        setSelectedScreen(null);
                                    }}
                                >
                                    Capturar de nuevo
                                </button>
                            </div>
                        </div>
                    ) : capturedImage ? (
                        <div className="capture-area">
                            <p className="capture-hint">Arrastra para seleccionar la región que deseas usar como miniatura</p>
                            <div
                                className="capture-canvas"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                            >
                                <img src={capturedImage} alt="Screenshot" />
                                {selection && (
                                    <div
                                        className="selection-box"
                                        style={{
                                            left: selection.x,
                                            top: selection.y,
                                            width: selection.width,
                                            height: selection.height
                                        }}
                                    />
                                )}
                            </div>
                            <div className="capture-actions">
                                <button className="btn btn-secondary" onClick={() => setCapturedImage(null)}>
                                    Tomar otra captura
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleConfirm}
                                    disabled={!selection}
                                >
                                    Usar selección
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

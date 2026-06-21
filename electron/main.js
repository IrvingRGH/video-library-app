import { app, BrowserWindow, ipcMain, desktopCapturer, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Allow loading content from any origin
    },
    frame: true,
    titleBarStyle: 'default',
    icon: path.join(__dirname, '../public/icon.png')
  });

  // Remove headers that block iframe embedding
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };

    // Remove headers that block iframe embedding
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['X-Frame-Options'];
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['Content-Security-Policy'];
    delete responseHeaders['x-content-security-policy'];
    delete responseHeaders['X-Content-Security-Policy'];

    callback({ responseHeaders });
  });

  // En desarrollo, carga desde Vite dev server
  const isDev = !app.isPackaged;

  if (isDev) {
    // Esperar un poco para que Vite se inicie
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:5173');
      // DevTools se puede abrir manualmente con Ctrl+Shift+I o View > Toggle DevTools
      // mainWindow.webContents.openDevTools();
    }, 1000);
  } else {
    // En producción, carga el build
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for storage operations
ipcMain.handle('storage:get', async () => {
  // En una app real, aquí podrías usar electron-store o similar
  // Por simplicidad usaremos localStorage del renderer
  return null;
});

ipcMain.handle('storage:set', async (event, data) => {
  return true;
});

// IPC handler for screenshot capture (simple)
ipcMain.handle('screenshot:capture', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });

    if (sources.length > 0) {
      // Return the thumbnail as base64
      return sources[0].thumbnail.toDataURL();
    }

    return null;
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return null;
  }
});

// IPC handler for screenshot capture with window hide (better for capturing clean screenshots)
ipcMain.handle('screenshot:captureWithHide', async () => {
  try {
    // Minimize the window first
    if (mainWindow) {
      mainWindow.minimize();
    }

    // Wait a bit for the window to minimize
    await new Promise(resolve => setTimeout(resolve, 500));

    // Capture all screens
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 3840, height: 2160 } // Higher resolution for multi-monitor
    });

    // Restore window
    if (mainWindow) {
      mainWindow.restore();
      mainWindow.focus();
    }

    if (sources.length > 0) {
      // If multiple monitors, combine them or return primary
      // For now, return the first (primary) screen
      // You can extend this to return all screens as an array
      return {
        screens: sources.map((source, index) => ({
          id: source.id,
          name: source.name || `Monitor ${index + 1}`,
          thumbnail: source.thumbnail.toDataURL()
        })),
        primary: sources[0].thumbnail.toDataURL()
      };
    }

    return null;
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    // Make sure to restore window even on error
    if (mainWindow) {
      mainWindow.restore();
      mainWindow.focus();
    }
    return null;
  }
});

// Window control handlers
ipcMain.handle('window:minimize', async () => {
  if (mainWindow) {
    mainWindow.minimize();
    return true;
  }
  return false;
});

ipcMain.handle('window:restore', async () => {
  if (mainWindow) {
    mainWindow.restore();
    mainWindow.focus();
    return true;
  }
  return false;
});

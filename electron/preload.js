const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    storage: {
        get: () => ipcRenderer.invoke('storage:get'),
        set: (data) => ipcRenderer.invoke('storage:set', data)
    },
    screenshot: {
        capture: () => ipcRenderer.invoke('screenshot:capture'),
        captureWithHide: () => ipcRenderer.invoke('screenshot:captureWithHide')
    },
    window: {
        minimize: () => ipcRenderer.invoke('window:minimize'),
        restore: () => ipcRenderer.invoke('window:restore')
    }
});

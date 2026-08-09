const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  exportJson: (data) => ipcRenderer.invoke('export-json', data),
  importJson: () => ipcRenderer.invoke('import-json'),
  autoBackup: (data) => ipcRenderer.invoke('auto-backup', data),
  listBackups: () => ipcRenderer.invoke('list-backups'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onAppClosing: (cb) => {
    ipcRenderer.on('app-closing', () => cb());
  }
});

contextBridge.exposeInMainWorld('licenseAPI', {
  getStatus: () => ipcRenderer.invoke('license-get-status'),
  activate: (code) => ipcRenderer.invoke('license-activate', code),
  copyMachineId: (text) => ipcRenderer.invoke('license-copy-machine-id', text)
});

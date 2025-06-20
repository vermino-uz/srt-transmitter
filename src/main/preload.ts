import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  startStream: (args: any) => ipcRenderer.invoke('start-stream', args),
  stopStream: (args: any) => ipcRenderer.invoke('stop-stream', args),
  stopAllStreams: () => ipcRenderer.invoke('stop-all-streams'),
  saveServerIP: (ip: string) => ipcRenderer.invoke('save-server-ip', ip),
  loadServerIP: () => ipcRenderer.invoke('load-server-ip'),
  saveServerPublicIP: (ip: string) => ipcRenderer.invoke('save-server-public-ip', ip),
  loadServerPublicIP: () => ipcRenderer.invoke('load-server-public-ip'),
  getStreamLog: (id: string) => ipcRenderer.invoke('get-stream-log', id),
  onStreamLog: (callback: (data: { id: string; line: string }) => void) => {
    ipcRenderer.on('stream-log', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('stream-log');
  },
  checkSrtLiveTransmit: () => ipcRenderer.invoke('check-srt-live-transmit'),
}); 
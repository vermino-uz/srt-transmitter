import { spawn, ChildProcess } from 'child_process';
import { ipcMain, app, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

interface StreamProcess {
  process: ChildProcess;
  src: string;
  dst: string;
  log: string[];
}

const SERVER_IP_FILE = path.join(app.getPath('userData'), 'server_ip.json');
const SERVER_PUBLIC_IP_FILE = path.join(app.getPath('userData'), 'server_public_ip.json');

// Get the path to the bundled srt-live-transmit
const getSrtLiveTransmitPath = () => {
  if (process.env.NODE_ENV === 'development') {
    // In development, use system-installed version with full path
    return '/opt/homebrew/bin/srt-live-transmit';
  } else {
    // In production, use bundled version
    const resourcePath = process.resourcesPath;
    return path.join(resourcePath, 'srt-live-transmit');
  }
};

class StreamManager {
  private streams: Map<string, StreamProcess> = new Map();

  constructor() {
    this.setupIPC();
  }

  private sendLogToAllWindows(id: string, line: string) {
    const windows = BrowserWindow.getAllWindows();
    for (const win of windows) {
      win.webContents.send('stream-log', { id, line });
    }
  }

  private setupIPC() {
    ipcMain.handle('start-stream', async (_, { id, src, dst }) => {
      try {
        return await this.startStream(id, src, dst);
      } catch (error) {
        console.error('Failed to start stream:', error);
        throw error;
      }
    });

    ipcMain.handle('stop-stream', async (_, { id }) => {
      try {
        return await this.stopStream(id);
      } catch (error) {
        console.error('Failed to stop stream:', error);
        throw error;
      }
    });

    ipcMain.handle('stop-all-streams', async () => {
      try {
        await this.stopAllStreams();
        return true;
      } catch (error) {
        console.error('Failed to stop all streams:', error);
        throw error;
      }
    });

    ipcMain.handle('save-server-ip', async (_, ip: string) => {
      try {
        fs.writeFileSync(SERVER_IP_FILE, JSON.stringify({ ip }), 'utf-8');
        return true;
      } catch (error) {
        console.error('Failed to save server IP:', error);
        throw error;
      }
    });

    ipcMain.handle('load-server-ip', async () => {
      try {
        if (fs.existsSync(SERVER_IP_FILE)) {
          const data = fs.readFileSync(SERVER_IP_FILE, 'utf-8');
          return JSON.parse(data).ip;
        }
        return null;
      } catch (error) {
        console.error('Failed to load server IP:', error);
        throw error;
      }
    });

    ipcMain.handle('save-server-public-ip', async (_, ip: string) => {
      try {
        fs.writeFileSync(SERVER_PUBLIC_IP_FILE, JSON.stringify({ ip }), 'utf-8');
        return true;
      } catch (error) {
        console.error('Failed to save server public IP:', error);
        throw error;
      }
    });

    ipcMain.handle('load-server-public-ip', async () => {
      try {
        if (fs.existsSync(SERVER_PUBLIC_IP_FILE)) {
          const data = fs.readFileSync(SERVER_PUBLIC_IP_FILE, 'utf-8');
          return JSON.parse(data).ip;
        }
        return null;
      } catch (error) {
        console.error('Failed to load server public IP:', error);
        throw error;
      }
    });

    ipcMain.handle('get-stream-log', async (_, id: string) => {
      const stream = this.streams.get(id);
      return stream ? stream.log : [];
    });

    ipcMain.handle('check-srt-live-transmit', async () => {
      const srtPath = getSrtLiveTransmitPath();
      try {
        // Check if the binary exists and is executable
        fs.accessSync(srtPath, fs.constants.X_OK);
        return { available: true, path: srtPath };
      } catch (error) {
        return { 
          available: false, 
          path: srtPath,
          error: `srt-live-transmit not found at ${srtPath}. Please install SRT tools.`
        };
      }
    });
  }

  private async startStream(id: string, src: string, dst: string): Promise<number> {
    if (this.streams.has(id)) {
      throw new Error('Stream already running');
    }

    const srtPath = getSrtLiveTransmitPath();
    
    // Check if srt-live-transmit is available
    try {
      fs.accessSync(srtPath, fs.constants.X_OK);
    } catch (error) {
      throw new Error(`srt-live-transmit not found at ${srtPath}. Please install SRT tools using: brew install srt`);
    }

    const process = spawn(srtPath, [src, dst], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const log: string[] = [];
    const streamProcess: StreamProcess = {
      process,
      src,
      dst,
      log,
    };

    this.streams.set(id, streamProcess);

    // Handle process events
    process.stdout?.on('data', (data) => {
      const line = data.toString();
      log.push(line);
      this.sendLogToAllWindows(id, line);
    });

    process.stderr?.on('data', (data) => {
      const line = data.toString();
      log.push(line);
      this.sendLogToAllWindows(id, line);
    });

    process.on('close', (code) => {
      const line = `[Stream ${id}] closed with code ${code}\n`;
      log.push(line);
      this.sendLogToAllWindows(id, line);
      this.streams.delete(id);
    });

    process.on('error', (error) => {
      const line = `[Stream ${id}] error: ${error.message}\n`;
      log.push(line);
      this.sendLogToAllWindows(id, line);
      this.streams.delete(id);
    });

    return process.pid!;
  }

  private async stopStream(id: string): Promise<boolean> {
    const streamProcess = this.streams.get(id);
    if (!streamProcess) {
      return false;
    }

    streamProcess.process.kill();
    this.streams.delete(id);
    return true;
  }

  private async stopAllStreams(): Promise<void> {
    const promises = Array.from(this.streams.keys()).map(id => this.stopStream(id));
    await Promise.all(promises);
  }
}

export const streamManager = new StreamManager(); 
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  IconButton,
  Grid,
  Collapse,
  Alert,
  AlertTitle,
  Link,
  Divider,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Stack,
} from '@mui/material';
import { 
  Play, 
  Square, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Save, 
  Copy, 
  Settings,
  X
} from 'lucide-react';

// Global theme state
let globalThemeMode: 'light' | 'dark' = 'light';

// Function to update global theme
const updateGlobalTheme = (mode: 'light' | 'dark') => {
  globalThemeMode = mode;
  
  // Update document body class
  document.body.classList.remove('light-theme', 'dark-theme');
  document.body.classList.add(`${mode}-theme`);
  
  // Set CSS variables for theme colors
  const root = document.documentElement;
  if (mode === 'dark') {
    root.style.setProperty('--bg-color', '#1e1e1e');
    root.style.setProperty('--paper-color', '#2d2d2d');
    root.style.setProperty('--text-color', '#ffffff');
    root.style.setProperty('--text-secondary', '#8e8e93');
    root.style.setProperty('--border-color', '#404040');
  } else {
    root.style.setProperty('--bg-color', '#f5f5f7');
    root.style.setProperty('--paper-color', '#ffffff');
    root.style.setProperty('--text-color', '#1d1d1f');
    root.style.setProperty('--text-secondary', '#6e6e73');
    root.style.setProperty('--border-color', '#e5e5e7');
  }
  
  // Force a re-render by updating the window theme
  (window as any).currentTheme = mode;
  // Dispatch a custom event to notify theme change
  window.dispatchEvent(new CustomEvent('themeChange', { detail: mode }));
};

// macOS-style Switch Component
const MacOSSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled = false }) => {
  return (
    <Box
      onClick={() => !disabled && onChange(!checked)}
      sx={{
        position: 'relative',
        width: 51,
        height: 31,
        borderRadius: 16,
        bgcolor: checked ? '#34C759' : '#e5e5e7',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s ease',
        opacity: disabled ? 0.5 : 1,
        '&:hover': {
          bgcolor: checked ? '#30D158' : '#d1d1d6'
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 2,
          left: checked ? 22 : 2,
          width: 27,
          height: 27,
          borderRadius: '50%',
          bgcolor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          transition: 'left 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {checked && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#34C759'
            }}
          />
        )}
      </Box>
    </Box>
  );
};

// Declare the electronAPI global
declare global {
  interface Window {
    electronAPI: {
      startStream: (args: any) => Promise<any>;
      stopStream: (args: any) => Promise<any>;
      stopAllStreams: () => Promise<any>;
      loadServerIP: () => Promise<string>;
      saveServerIP: (ip: string) => Promise<void>;
      loadServerPublicIP: () => Promise<string>;
      saveServerPublicIP: (ip: string) => Promise<void>;
      onStreamLog: (callback: (event: { id: string; line: string }) => void) => void;
      getStreamLog: (id: string) => Promise<string[]>;
      checkSrtLiveTransmit: () => Promise<{ available: boolean; path: string; error?: string }>;
    };
    updateAppTheme: (mode: 'light' | 'dark') => void;
    currentTheme: 'light' | 'dark';
  }
}

interface SRTStream {
  id: string;
  alias?: string;
  localIP: string;
  localPort: number;
  serverPort: number;
  passphrase: string;
  isRunning: boolean;
  status: string;
  pid?: number;
}

const DEFAULT_STREAMS: SRTStream[] = [
  { id: '1', alias: 'Camera 1', localIP: '192.168.0.101', localPort: 5001, serverPort: 6001, passphrase: '1234567890', isRunning: false, status: 'Stopped' },
  { id: '2', alias: 'Camera 2', localIP: '192.168.0.102', localPort: 5002, serverPort: 6002, passphrase: '1234567890', isRunning: false, status: 'Stopped' },
  { id: '3', alias: 'Camera 3', localIP: '192.168.0.103', localPort: 5003, serverPort: 6003, passphrase: '1234567890', isRunning: false, status: 'Stopped' },
  { id: '4', alias: 'Camera 4', localIP: '192.168.0.104', localPort: 5004, serverPort: 6004, passphrase: '1234567890', isRunning: false, status: 'Stopped' },
  { id: '5', alias: 'Camera 5', localIP: '192.168.0.105', localPort: 5005, serverPort: 6005, passphrase: '1234567890', isRunning: false, status: 'Stopped' },
  { id: '6', alias: 'Camera 6', localIP: '192.168.0.106', localPort: 5006, serverPort: 6006, passphrase: '1234567890', isRunning: false, status: 'Stopped' },
  { id: '7', alias: 'Camera 7', localIP: '192.168.0.107', localPort: 5007, serverPort: 6007, passphrase: '', isRunning: false, status: 'Stopped' },
  { id: '8', alias: 'Camera 8', localIP: '192.168.0.108', localPort: 5008, serverPort: 6008, passphrase: '', isRunning: false, status: 'Stopped' },
  { id: '9', alias: 'Camera 9', localIP: '192.168.0.109', localPort: 5009, serverPort: 6009, passphrase: '', isRunning: false, status: 'Stopped' },
  { id: '10', alias: 'Camera 10', localIP: '192.168.0.110', localPort: 5010, serverPort: 6010, passphrase: '', isRunning: false, status: 'Stopped' },
];

const SERVER_IP = '100.73.246.9';
const SERVER_PUBLIC_IP = '100.73.246.9';

const getNextId = (streams: SRTStream[]) => {
  const ids = streams.map(s => parseInt(s.id, 10)).filter(n => !isNaN(n));
  return (Math.max(0, ...ids) + 1).toString();
};

const App: React.FC = () => {
  const theme = useTheme();
  const [streams, setStreams] = useState<SRTStream[]>(DEFAULT_STREAMS);
  const [serverIP, setServerIP] = useState<string>(SERVER_IP);
  const [serverPublicIP, setServerPublicIP] = useState<string>(SERVER_PUBLIC_IP);
  const [newStream, setNewStream] = useState<Omit<SRTStream, 'id' | 'isRunning' | 'status' | 'pid'>>({
    localIP: '',
    localPort: 0,
    serverPort: 0,
    passphrase: '',
  });
  const [serverIPSaving, setServerIPSaving] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [serverPublicIPSaving, setServerPublicIPSaving] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [logs, setLogs] = useState<Record<string, string[]>>({});
  const [editingAlias, setEditingAlias] = useState<string | null>(null);
  const [aliasInput, setAliasInput] = useState<string>('');
  const [srtStatus, setSrtStatus] = useState<{ available: boolean; path: string; error?: string } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'light' as 'light' | 'dark' | 'system',
    autoStartStreams: false,
    autoSaveLogs: true,
    maxLogLines: 100,
    showNotifications: true,
    defaultPassphrase: '',
    logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error',
  });
  
  // Get current theme mode
  const currentThemeMode = globalThemeMode;

  useEffect(() => {
    // Load saved server IPs on mount
    window.electronAPI.loadServerIP().then((ip) => {
      if (ip) setServerIP(ip);
    });
    window.electronAPI.loadServerPublicIP().then((ip) => {
      if (ip) setServerPublicIP(ip);
    });
    
    // Initialize theme
    updateGlobalTheme('light');
    
    // Listen for theme changes
    const handleThemeChange = (event: CustomEvent) => {
      console.log('Theme change event received:', event.detail);
    };
    
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, []);

  // Subscribe to log updates
  useEffect(() => {
    const removeListener = window.electronAPI.onStreamLog(({ id, line }) => {
      setLogs(prev => ({
        ...prev,
        [id]: [...(prev[id] || []), line],
      }));
    });
    return () => {
      // removeListener is a function only if implemented as such in preload
      // but in our case, it returns void, so nothing to call
    };
  }, []);

  // Check srt-live-transmit availability on mount
  useEffect(() => {
    window.electronAPI.checkSrtLiveTransmit().then((status) => {
      setSrtStatus(status);
    });
  }, []);

  const handleSaveServerIP = async () => {
    setServerIPSaving('saving');
    try {
      await window.electronAPI.saveServerIP(serverIP);
      setServerIPSaving('saved');
      setTimeout(() => setServerIPSaving('idle'), 1200);
    } catch {
      setServerIPSaving('error');
      setTimeout(() => setServerIPSaving('idle'), 1200);
    }
  };

  const handleSaveServerPublicIP = async () => {
    setServerPublicIPSaving('saving');
    try {
      await window.electronAPI.saveServerPublicIP(serverPublicIP);
      setServerPublicIPSaving('saved');
      setTimeout(() => setServerPublicIPSaving('idle'), 1200);
    } catch {
      setServerPublicIPSaving('error');
      setTimeout(() => setServerPublicIPSaving('idle'), 1200);
    }
  };

  const copyStreamURL = (stream: SRTStream) => {
    const url = stream.passphrase 
      ? `srt://${serverPublicIP}:${stream.localPort}`
      : `srt://${serverPublicIP}:${stream.localPort}`;
    
    navigator.clipboard.writeText(url).then(() => {
      // You could add a toast notification here if desired
      console.log('Stream URL copied to clipboard:', url);
    }).catch(err => {
      console.error('Failed to copy URL:', err);
    });
  };

  const startStream = async (stream: SRTStream) => {
    try {
      const src = stream.passphrase 
        ? `srt://${stream.localIP}:${stream.localPort}?passphrase=${stream.passphrase}`
        : `srt://${stream.localIP}:${stream.localPort}`;
      const dst = `srt://${serverIP}:${stream.serverPort}`;

      const pid = await window.electronAPI.startStream({
        id: stream.id,
        src,
        dst
      });

      setStreams(prev => prev.map(s => 
        s.id === stream.id 
          ? { ...s, isRunning: true, status: 'Running', pid }
          : s
      ));
    } catch (error) {
      console.error('Failed to start stream:', error);
      setStreams(prev => prev.map(s => 
        s.id === stream.id 
          ? { ...s, status: 'Error: ' + (error as Error).message }
          : s
      ));
    }
  };

  const stopStream = async (stream: SRTStream) => {
    try {
      await window.electronAPI.stopStream({ id: stream.id });
      setStreams(prev => prev.map(s => 
        s.id === stream.id 
          ? { ...s, isRunning: false, status: 'Stopped', pid: undefined }
          : s
      ));
    } catch (error) {
      console.error('Failed to stop stream:', error);
      setStreams(prev => prev.map(s => 
        s.id === stream.id 
          ? { ...s, status: 'Error stopping: ' + (error as Error).message }
          : s
      ));
    }
  };

  const startAll = async () => {
    for (const stream of streams) {
      if (!stream.isRunning) {
        await startStream(stream);
      }
    }
  };

  const stopAll = async () => {
    try {
      await window.electronAPI.stopAllStreams();
      setStreams(prev => prev.map(s => ({
        ...s,
        isRunning: false,
        status: 'Stopped',
        pid: undefined
      })));
    } catch (error) {
      console.error('Failed to stop all streams:', error);
    }
  };

  // Add new stream
  const handleAddStream = () => {
    if (!newStream.localIP || !newStream.localPort || !newStream.serverPort) return;
    setStreams(prev => [
      ...prev,
      {
        id: getNextId(prev),
        alias: 'New Stream',
        localIP: newStream.localIP,
        localPort: newStream.localPort,
        serverPort: newStream.serverPort,
        passphrase: newStream.passphrase,
        isRunning: false,
        status: 'Stopped',
      },
    ]);
    setNewStream({ localIP: '', localPort: 0, serverPort: 0, passphrase: '' });
  };

  // Remove stream
  const handleRemoveStream = async (id: string) => {
    await window.electronAPI.stopStream({ id });
    setStreams(prev => prev.filter(s => s.id !== id));
  };

  // Load log when expanding
  const handleExpandClick = async (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    if (!expanded[id]) {
      const log = await window.electronAPI.getStreamLog(id);
      setLogs(prev => ({ ...prev, [id]: log }));
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  return (
    <Box sx={{ 
      flexGrow: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'var(--bg-color, #f5f5f7)',
      color: 'var(--text-color, #1d1d1f)'
    }}>
      {/* macOS-style toolbar */}
      <Box sx={{ 
        bgcolor: 'var(--paper-color, #ffffff)',
        borderBottom: '1px solid var(--border-color, #e5e5e7)',
        px: 3,
        py: 2,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'var(--paper-color, #ffffff)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            color: 'var(--text-color, #1d1d1f)'
          }}>
            SRT Stream Manager
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', ml: 'auto' }}>
            <TextField
              size="small"
              label="Server IP"
              variant="outlined"
              value={serverIP}
              onChange={(e) => setServerIP(e.target.value)}
              sx={{ 
                minWidth: 180,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'var(--paper-color, #ffffff)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'var(--border-color, #d1d1d6)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--text-secondary, #6e6e73)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#007AFF'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'var(--text-secondary, #6e6e73)'
                },
                '& .MuiInputBase-input': {
                  color: 'var(--text-color, #1d1d1f)'
                }
              }}
            />
            <Button
              variant="outlined"
              startIcon={<Save size={14} />}
              onClick={handleSaveServerIP}
              disabled={serverIPSaving === 'saving'}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                borderColor: 'var(--border-color, #d1d1d6)',
                color: 'var(--text-color, #1d1d1f)',
                '&:hover': {
                  borderColor: '#007AFF',
                  bgcolor: 'rgba(0, 122, 255, 0.04)'
                }
              }}
            >
              {serverIPSaving === 'saving' ? 'Saving...' : serverIPSaving === 'saved' ? 'Saved!' : 'Save'}
            </Button>
            <TextField
              size="small"
              label="Server Public IPv4"
              variant="outlined"
              value={serverPublicIP}
              onChange={(e) => setServerPublicIP(e.target.value)}
              sx={{ 
                minWidth: 180,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'var(--paper-color, #ffffff)',
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: 'var(--border-color, #d1d1d6)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'var(--text-secondary, #6e6e73)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#007AFF'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'var(--text-secondary, #6e6e73)'
                },
                '& .MuiInputBase-input': {
                  color: 'var(--text-color, #1d1d1f)'
                }
              }}
            />
            <Button
              variant="outlined"
              startIcon={<Save size={14} />}
              onClick={handleSaveServerPublicIP}
              disabled={serverPublicIPSaving === 'saving'}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                borderColor: 'var(--border-color, #d1d1d6)',
                color: 'var(--text-color, #1d1d1f)',
                '&:hover': {
                  borderColor: '#007AFF',
                  bgcolor: 'rgba(0, 122, 255, 0.04)'
                }
              }}
            >
              {serverPublicIPSaving === 'saving' ? 'Saving...' : serverPublicIPSaving === 'saved' ? 'Saved!' : 'Save'}
            </Button>
            <Button
              variant="contained"
              startIcon={<Play size={16} />}
              onClick={startAll}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                bgcolor: '#007AFF',
                '&:hover': { bgcolor: '#0056CC' }
              }}
            >
              Start All
            </Button>
            <Button
              variant="outlined"
              startIcon={<Square size={14} />}
              onClick={stopAll}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                borderColor: '#FF3B30',
                color: '#FF3B30',
                '&:hover': { 
                  borderColor: '#D70015',
                  bgcolor: 'rgba(255, 59, 48, 0.04)'
                }
              }}
            >
              Stop All
            </Button>
            <IconButton
              onClick={() => setSettingsOpen(true)}
              sx={{ 
                color: 'var(--text-color, #1d1d1f)',
                '&:hover': { bgcolor: 'rgba(0, 122, 255, 0.1)' }
              }}
            >
              <Settings size={16} />
            </IconButton>
          </Box>
        </Box>
      </Box>
      
      {/* Settings Dialog */}
      <Dialog 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'var(--paper-color, #ffffff)',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600,
          color: 'var(--text-color, #1d1d1f)',
          borderBottom: '1px solid var(--border-color, #e5e5e7)'
        }}>
          Settings
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Theme Settings */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'var(--text-color, #1d1d1f)' }}>
                Appearance
              </Typography>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'var(--text-secondary, #6e6e73)' }}>Theme</InputLabel>
                <Select
                  value={settings.theme}
                  onChange={(e) => {
                    const newTheme = e.target.value as 'light' | 'dark' | 'system';
                    console.log('Theme changed to:', newTheme);
                    setSettings(s => ({ ...s, theme: newTheme }));
                    // Immediately apply theme change
                    if (newTheme !== 'system') {
                      console.log('Calling updateGlobalTheme with:', newTheme);
                      updateGlobalTheme(newTheme);
                      if ((window as any).updateAppTheme) {
                        (window as any).updateAppTheme(newTheme);
                      }
                    }
                  }}
                  label="Theme"
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'var(--paper-color,rgb(135, 134, 134))',
                      '& fieldset': {
                        borderColor: '#d1d1d6'
                      },
                      '&:hover fieldset': {
                        borderColor: '#8e8e93'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#007AFF',
                        borderWidth: '2px'
                      }
                    },
                    '& .MuiSelect-select': {
                      color: 'var(--text-color, #1d1d1f)'
                    }
                  }}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ borderColor: 'var(--border-color, #e5e5e7)' }} />

            {/* Stream Settings */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'var(--text-color, #1d1d1f)' }}>
                Stream Management
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'var(--text-color, #1d1d1f)' }}>
                    Auto-start streams on app launch
                  </Typography>
                  <MacOSSwitch
                    checked={settings.autoStartStreams}
                    onChange={(checked) => setSettings(s => ({ ...s, autoStartStreams: checked }))}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'var(--text-color, #1d1d1f)' }}>
                    Show notifications
                  </Typography>
                  <MacOSSwitch
                    checked={settings.showNotifications}
                    onChange={(checked) => setSettings(s => ({ ...s, showNotifications: checked }))}
                  />
                </Box>
                <TextField
                  label="Default passphrase for new streams"
                  value={settings.defaultPassphrase}
                  onChange={(e) => setSettings(s => ({ ...s, defaultPassphrase: e.target.value }))}
                  fullWidth
                  size="small"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'var(--paper-color, #ffffff)',
                      '& fieldset': {
                        borderColor: 'var(--border-color, #d1d1d6)'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--text-secondary, #6e6e73)'
                    },
                    '& .MuiInputBase-input': {
                      color: 'var(--text-color, #1d1d1f)'
                    }
                  }}
                />
              </Stack>
            </Box>

            <Divider sx={{ borderColor: 'var(--border-color, #e5e5e7)' }} />

            {/* Logging Settings */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'var(--text-color, #1d1d1f)' }}>
                Logging
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'var(--text-color, #1d1d1f)' }}>
                    Auto-save logs to file
                  </Typography>
                  <MacOSSwitch
                    checked={settings.autoSaveLogs}
                    onChange={(checked) => setSettings(s => ({ ...s, autoSaveLogs: checked }))}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, color: 'var(--text-color, #1d1d1f)' }}>
                    Max log lines per stream: {settings.maxLogLines}
                  </Typography>
                  <Slider
                    value={settings.maxLogLines}
                    onChange={(_, value) => setSettings(s => ({ ...s, maxLogLines: value as number }))}
                    min={50}
                    max={500}
                    step={50}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'var(--text-secondary, #6e6e73)' }}>Log Level</InputLabel>
                  <Select
                    value={settings.logLevel}
                    onChange={(e) => setSettings(s => ({ ...s, logLevel: e.target.value as 'debug' | 'info' | 'warn' | 'error' }))}
                    label="Log Level"
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'var(--paper-color, #ffffff)',
                        '& fieldset': {
                          borderColor: '#d1d1d6'
                        },
                        '&:hover fieldset': {
                          borderColor: '#8e8e93'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#007AFF',
                          borderWidth: '2px'
                        }
                      },
                      '& .MuiSelect-select': {
                        color: 'var(--text-color, #1d1d1f)'
                      }
                    }}
                  >
                    <MenuItem value="debug">Debug</MenuItem>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="warn">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setSettingsOpen(false)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              color: 'var(--text-color, #1d1d1f)'
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              // Save settings logic would go here
              // Update theme if changed
              if ((window as any).updateAppTheme) {
                (window as any).updateAppTheme(settings.theme);
              }
              setSettingsOpen(false);
            }}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              bgcolor: '#007AFF',
              '&:hover': { bgcolor: '#0056CC' }
            }}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
      
      <Container sx={{ mt: 4, mb: 4, flex: 1, maxWidth: '1400px' }}>
        {srtStatus && !srtStatus.available && (
          <Alert severity="error" sx={{ 
            mb: 3, 
            borderRadius: 2,
            '& .MuiAlert-icon': { color: '#FF3B30' }
          }}>
            <AlertTitle>SRT Tools Not Found</AlertTitle>
            {srtStatus.error}
            <br />
            <strong>To install SRT tools:</strong>
            <br />
            <code>brew install srt</code>
          </Alert>
        )}
        
        {/* Add New Stream Section */}
        <Paper sx={{ 
          mb: 3, 
          p: 3, 
          borderRadius: 3,
          bgcolor: 'var(--paper-color, #ffffff)',
          border: '1px solid var(--border-color, #e5e5e7)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ mr: 1, color: '#007AFF' }}>
              <Plus size={14} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--text-color, #1d1d1f)' }}>
              Add New Stream
            </Typography>
          </Box>
          <Grid container spacing={3} alignItems="end">
            <Grid item xs={12} sm={3}>
              <TextField
                label="Local IP"
                size="small"
                fullWidth
                value={newStream.localIP}
                onChange={e => setNewStream(s => ({ ...s, localIP: e.target.value }))}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'var(--paper-color, #ffffff)',
                    '& fieldset': {
                      borderColor: 'var(--border-color, #d1d1d6)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--text-secondary, #6e6e73)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#007AFF'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary, #6e6e73)'
                  },
                  '& .MuiInputBase-input': {
                    color: 'var(--text-color, #1d1d1f)'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Local Port"
                size="small"
                type="number"
                fullWidth
                value={newStream.localPort || ''}
                onChange={e => setNewStream(s => ({ ...s, localPort: parseInt(e.target.value, 10) || 0 }))}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'var(--paper-color, #ffffff)',
                    '& fieldset': {
                      borderColor: 'var(--border-color, #d1d1d6)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--text-secondary, #6e6e73)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#007AFF'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary, #6e6e73)'
                  },
                  '& .MuiInputBase-input': {
                    color: 'var(--text-color, #1d1d1f)'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Server Port"
                size="small"
                type="number"
                fullWidth
                value={newStream.serverPort || ''}
                onChange={e => setNewStream(s => ({ ...s, serverPort: parseInt(e.target.value, 10) || 0 }))}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'var(--paper-color, #ffffff)',
                    '& fieldset': {
                      borderColor: 'var(--border-color, #d1d1d6)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--text-secondary, #6e6e73)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#007AFF'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary, #6e6e73)'
                  },
                  '& .MuiInputBase-input': {
                    color: 'var(--text-color, #1d1d1f)'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Passphrase (optional)"
                size="small"
                fullWidth
                value={newStream.passphrase}
                onChange={e => setNewStream(s => ({ ...s, passphrase: e.target.value }))}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'var(--paper-color, #ffffff)',
                    '& fieldset': {
                      borderColor: 'var(--border-color, #d1d1d6)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--text-secondary, #6e6e73)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#007AFF'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--text-secondary, #6e6e73)'
                  },
                  '& .MuiInputBase-input': {
                    color: 'var(--text-color, #1d1d1f)'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleAddStream}
                startIcon={<Plus size={14} />}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  bgcolor: '#007AFF',
                  '&:hover': { bgcolor: '#0056CC' }
                }}
              >
                Add Stream
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Streams Table */}
        <Paper sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'var(--paper-color, #ffffff)',
          border: '1px solid var(--border-color, #e5e5e7)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  bgcolor: 'var(--bg-color, #f5f5f7)'
                }}>
                  <TableCell sx={{ 
                    border: 'none', 
                    fontWeight: 600,
                    color: 'var(--text-color, #1d1d1f)'
                  }}></TableCell>
                  <TableCell sx={{ 
                    border: 'none', 
                    fontWeight: 600,
                    color: 'var(--text-color, #1d1d1f)'
                  }}>Alias</TableCell>
                  <TableCell sx={{ 
                    border: 'none', 
                    fontWeight: 600,
                    color: 'var(--text-color, #1d1d1f)'
                  }}>Local IP</TableCell>
                  <TableCell sx={{ 
                    border: 'none', 
                    fontWeight: 600,
                    color: 'var(--text-color, #1d1d1f)'
                  }}>Local Port</TableCell>
                  <TableCell sx={{ 
                    border: 'none', 
                    fontWeight: 600,
                    color: 'var(--text-color, #1d1d1f)'
                  }}>Server Port</TableCell>
                  <TableCell sx={{ 
                    border: 'none', 
                    fontWeight: 600,
                    color: 'var(--text-color, #1d1d1f)'
                  }}>Passphrase</TableCell>
                  <TableCell sx={{ 
                    border: 'none', 
                    fontWeight: 600,
                    color: 'var(--text-color, #1d1d1f)'
                  }}>Status</TableCell>
                  <TableCell sx={{ 
                    border: 'none', 
                    fontWeight: 600,
                    color: 'var(--text-color, #1d1d1f)'
                  }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {streams.map((stream) => (
                  <React.Fragment key={stream.id}>
                    <TableRow sx={{ 
                      '&:hover': { 
                        bgcolor: 'var(--bg-color, #f5f5f7)' 
                      }
                    }}>
                      <TableCell sx={{ border: 'none' }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleExpandClick(stream.id)}
                          sx={{ 
                            color: 'var(--text-color, #1d1d1f)',
                            '&:hover': { bgcolor: 'rgba(0, 122, 255, 0.1)' }
                          }}
                        >
                          {expanded[stream.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ border: 'none' }}>
                        {editingAlias === stream.id ? (
                          <TextField
                            value={aliasInput}
                            size="small"
                            autoFocus
                            onChange={e => setAliasInput(e.target.value)}
                            onBlur={() => {
                              setStreams(prev => prev.map(s => s.id === stream.id ? { ...s, alias: aliasInput } : s));
                              setEditingAlias(null);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                setStreams(prev => prev.map(s => s.id === stream.id ? { ...s, alias: aliasInput } : s));
                                setEditingAlias(null);
                              }
                              if (e.key === 'Escape') {
                                setEditingAlias(null);
                              }
                            }}
                            sx={{ 
                              minWidth: 120,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1,
                                bgcolor: 'var(--paper-color, #ffffff)',
                                '& fieldset': {
                                  borderColor: 'var(--border-color, #d1d1d6)'
                                }
                              },
                              '& .MuiInputBase-input': {
                                color: 'var(--text-color, #1d1d1f)'
                              }
                            }}
                          />
                        ) : (
                          <Typography
                            sx={{ 
                              cursor: 'pointer', 
                              color: '#007AFF',
                              fontWeight: 500,
                              '&:hover': { textDecoration: 'underline' }
                            }}
                            onClick={() => {
                              setEditingAlias(stream.id);
                              setAliasInput(stream.alias || '');
                            }}
                            title="Click to edit alias"
                          >
                            {stream.alias || <span style={{ color: 'var(--text-secondary, #8e8e93)' }}>No Alias</span>}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ border: 'none' }}>
                        <Typography sx={{ fontFamily: 'SF Mono, Monaco, monospace', color: 'var(--text-color, #1d1d1f)' }}>
                          {stream.localIP}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: 'none' }}>
                        <Typography sx={{ fontFamily: 'SF Mono, Monaco, monospace', color: 'var(--text-color, #1d1d1f)' }}>
                          {stream.localPort}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: 'none' }}>
                        <Typography sx={{ fontFamily: 'SF Mono, Monaco, monospace', color: 'var(--text-color, #1d1d1f)' }}>
                          {stream.serverPort}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: 'none' }}>
                        <Typography sx={{ 
                          fontFamily: 'SF Mono, Monaco, monospace',
                          color: stream.passphrase ? '#007AFF' : 'var(--text-secondary, #8e8e93)'
                        }}>
                          {stream.passphrase || 'None'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ border: 'none' }}>
                        <Chip
                          label={stream.status}
                          size="small"
                          sx={{
                            borderRadius: 1,
                            fontWeight: 500,
                            bgcolor: stream.isRunning ? '#34C759' : '#8e8e93',
                            color: '#ffffff',
                            '& .MuiChip-label': { px: 1.5 }
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ border: 'none' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => stream.isRunning ? stopStream(stream) : startStream(stream)}
                            sx={{ 
                              color: stream.isRunning ? '#FF3B30' : '#007AFF',
                              '&:hover': { 
                                bgcolor: stream.isRunning ? 'rgba(255, 59, 48, 0.1)' : 'rgba(0, 122, 255, 0.1)' 
                              }
                            }}
                          >
                            {stream.isRunning ? <Square size={14} /> : <Play size={14} />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveStream(stream.id)}
                            disabled={stream.isRunning}
                            sx={{ 
                              color: '#FF3B30',
                              opacity: stream.isRunning ? 0.5 : 1,
                              '&:hover': { 
                                bgcolor: 'rgba(255, 59, 48, 0.1)',
                                opacity: stream.isRunning ? 0.5 : 1
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => copyStreamURL(stream)}
                            disabled={stream.isRunning}
                            sx={{ 
                              color: '#007AFF',
                              opacity: stream.isRunning ? 0.5 : 1,
                              '&:hover': { 
                                bgcolor: 'rgba(0, 122, 255, 0.1)',
                                opacity: stream.isRunning ? 0.5 : 1
                              }
                            }}
                          >
                            <Copy size={16} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
                        <Collapse in={expanded[stream.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ 
                            bgcolor: 'var(--bg-color, #f5f5f7)',
                            p: 2, 
                            fontFamily: 'SF Mono, Monaco, monospace', 
                            fontSize: 13, 
                            maxHeight: 200, 
                            overflow: 'auto',
                            borderTop: '1px solid var(--border-color, #e5e5e7)',
                            color: 'var(--text-color, #1d1d1f)'
                          }}>
                            {logs[stream.id]?.length ? logs[stream.id].map((line, idx) => (
                              <div key={idx}>{line}</div>
                            )) : <span style={{ color: 'var(--text-secondary, #8e8e93)' }}>No log yet.</span>}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
      
      {/* macOS-style footer */}
      <Box sx={{ 
        mt: 'auto', 
        py: 3, 
        px: 4, 
        bgcolor: 'var(--paper-color, #ffffff)',
        borderTop: '1px solid var(--border-color, #e5e5e7)'
      }}>
        <Divider sx={{ mb: 3, borderColor: 'var(--border-color, #e5e5e7)' }} />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 2 
        }}>
          <Typography variant="body2" sx={{ 
            color: 'var(--text-secondary, #6e6e73)',
            fontWeight: 400
          }}>
            Made by{' '}
            <Link 
              href="https://t.me/vermino" 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ 
                color: '#007AFF', 
                textDecoration: 'none', 
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' } 
              }}
            >
              @vermino
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'var(--text-secondary, #6e6e73)',
            fontWeight: 400
          }}>
            <Link 
              href="https://vermino.uz" 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ 
                color: '#007AFF', 
                textDecoration: 'none', 
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' } 
              }}
            >
              vermino.uz
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'var(--text-secondary, #6e6e73)',
            fontWeight: 400
          }}>
            © 2026 est.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default App; 
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec, spawn } = require('child_process');
const net = require('net');
const path = require('path');
const os = require('os');

const { performOCR, performClipboardOCR } = require('./ocr-handler');

let win;
let clientPort = null;
let serverProcess = null;
let clientProcess = null;
let ncServerProcess = null;
let vpnSocket = null;

function createWindow() {
  console.log('Creating window...');
  
  // Get the primary display dimensions
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  
  const windowWidth = 800;
  const windowHeight = 600;
  
  win = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: Math.floor((screenWidth - windowWidth) / 2),  // Center horizontally
    y: Math.floor((screenHeight - windowHeight) / 2), // Center vertically
    show: false,
    center: true,
    resizable: true,
    minimizable: true,
    maximizable: true,
    closable: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    transparent: false,  // Ensure not transparent
    opacity: 1.0,        // Full opacity
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  win.loadFile('index.html');
  
  // Show window once ready with multiple attempts
  win.once('ready-to-show', () => {
    console.log('Window ready to show');
    
    // Force window to be on screen
    win.setPosition(Math.floor((screenWidth - windowWidth) / 2), Math.floor((screenHeight - windowHeight) / 2));
    win.show();
    win.focus();
    win.moveTop();
    
    // Multiple attempts to ensure visibility
    setTimeout(() => {
      console.log('Forcing window visibility...');
      win.restore();
      win.setAlwaysOnTop(true);
      setTimeout(() => {
        win.setAlwaysOnTop(false);
        win.focus();
        console.log('Window should now be visible');
      }, 200);
    }, 100);
  });
  
  // Debug window events
  win.on('show', () => console.log('Window shown'));
  win.on('hide', () => console.log('Window hidden'));
  win.on('closed', () => console.log('Window closed'));
  win.on('focus', () => console.log('Window focused'));
  win.on('blur', () => console.log('Window blurred'));
}

function sendToRenderer(source, message) {
  if (win && !win.isDestroyed()) {
    win.webContents.send('message-output', { source, message: message.trim() });
  }
}

function killProcessOnPort(port) {
  const cmd = `lsof -ti tcp:${port} | xargs kill -9`;
  exec(cmd, (err) => {
    if (err) {
      sendToRenderer('KILL ERROR', `Could not kill port ${port}: ${err.message}`);
    } else {
      sendToRenderer('KILL', `Port ${port} cleared.`);
    }
  });
}

ipcMain.on('start-vpn', () => {
  if (serverProcess) serverProcess.kill();
  if (clientProcess) clientProcess.kill();
  if (vpnSocket) vpnSocket.destroy();
  clientPort = null;

  killProcessOnPort(2206);
  killProcessOnPort(1337);

  const serverCmd = `java -cp ../out server.ForwardServer \
--handshakeport=2206 \
--usercert=../certs/server.pem \
--cacert=../certs/CA.pem \
--key=../certs/serverprivatekey.pem`;

  serverProcess = exec(serverCmd);

  serverProcess.stdout.on('data', (data) => {
    sendToRenderer('Server', data.toString());
  });

  serverProcess.stderr.on('data', (data) => {
    sendToRenderer('Server ERROR', data.toString());
  });

  setTimeout(() => {
    const clientCmd = `java -cp ../out client.ForwardClient \
--handshakehost=localhost \
--handshakeport=2206 \
--targethost=localhost \
--targetport=1337 \
--usercert=../certs/client.pem \
--cacert=../certs/CA.pem \
--key=../certs/clientprivatekey.der`;

    clientProcess = exec(clientCmd);

    clientProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      lines.forEach(line => {
        sendToRenderer('Client', line);
        const portMatch = line.match(/Waiting for incoming connections at .*:(\d+)/);
        if (portMatch) {
          clientPort = portMatch[1];
          sendToRenderer('INFO', `Detected client port: ${clientPort}`);
        }
      });
    });

    clientProcess.stderr.on('data', (data) => {
      sendToRenderer('Client ERROR', data.toString());
    });

    clientProcess.on('close', (code) => {
      sendToRenderer('Client', `Exited with code ${code}`);
    });
  }, 3000);
});

ipcMain.on('connect-vpn', () => {
  if (!clientPort) {
    sendToRenderer('ERROR', 'Client port not detected yet.');
    return;
  }

  if (vpnSocket) vpnSocket.destroy();

  vpnSocket = new net.Socket();
  vpnSocket.connect(clientPort, 'localhost', () => {
    sendToRenderer('VPN', 'Connected to VPN tunnel.');
  });

  vpnSocket.on('data', (data) => {
    sendToRenderer('VPN', `Decrypted: ${data.toString().trim()}`);
  });

  vpnSocket.on('error', (err) => {
    sendToRenderer('VPN ERROR', err.message);
  });

  vpnSocket.on('close', () => {
    sendToRenderer('VPN', 'VPN connection closed.');
  });
});

ipcMain.on('send-message-socket', (event, message) => {
  if (!vpnSocket || vpnSocket.destroyed) {
    event.sender.send('message-output', { source: 'ERROR', message: 'VPN not connected. Click "Connect VPN" first.' });
    return;
  }
  try {
    vpnSocket.write(message + '\n');
    sendToRenderer('VPN', `Sent: ${message}`);
  } catch (err) {
    sendToRenderer('VPN ERROR', `Socket write failed: ${err.message}`);
  }
});

ipcMain.on('send-message-nc', (event, message) => {
  if (!clientPort) {
    event.sender.send('message-output', { source: 'ERROR', message: 'Client port not yet detected. Try again.' });
    return;
  }
  event.sender.send('clear-output');
  const nc = spawn('nc', ['localhost', clientPort]);
  nc.stdin.write(message + '\n');

  setTimeout(() => {
    try {
      nc.stdin.end();
    } catch (err) {
      event.sender.send('message-output', { source: 'nc ERROR', message: err.message });
    }
  }, 100);

  nc.stdout.on('data', (data) => {
    event.sender.send('message-output', { source: 'Netcat', message: data.toString().trim() });
  });

  nc.stderr.on('data', (data) => {
    event.sender.send('message-output', { source: 'nc ERROR', message: data.toString().trim() });
  });

  nc.on('close', (code) => {
    event.sender.send('message-output', { source: 'nc', message: `Connection closed with code ${code}` });
  });
});

ipcMain.on('start-nc-server', () => {
  if (ncServerProcess) ncServerProcess.kill();
  ncServerProcess = exec('nc -lk 1337');

  ncServerProcess.stdout.on('data', (data) => {
    sendToRenderer('Netcat', data.toString());
  });
  ncServerProcess.stderr.on('data', (data) => {
    sendToRenderer('Netcat ERROR', data.toString());
  });
  ncServerProcess.on('close', () => {
    sendToRenderer('Netcat', 'Server stopped.');
  });
});

ipcMain.on('perform-ocr-clipboard', async (event) => {
  try {
    const result = await performClipboardOCR();
    sendToRenderer('OCR', `Extracted (Clipboard): ${result.trim()}`);
  } catch (err) {
    sendToRenderer('OCR ERROR', err.message);
  }
});

ipcMain.on('open-ocr-file-dialog', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const imagePath = result.filePaths[0];
    try {
      const text = await performOCR(imagePath, 'eng+hin');
      sendToRenderer('OCR Result', text.trim());
    } catch (err) {
      sendToRenderer('OCR ERROR', err.message);
    }
  }
});

ipcMain.on('ocr-dropped-image', async (event, filePath) => {
  try {
    const text = await performOCR(filePath, 'eng+hin');
    sendToRenderer('OCR Result', `Dropped Image OCR:\n${text.trim()}`);
  } catch (err) {
    sendToRenderer('OCR ERROR', err.message);
  }
});

ipcMain.on('send-ocr-file', async (event, filePath) => {
  try {
    const text = await performOCR(filePath, 'eng+hin');
    if (!vpnSocket || vpnSocket.destroyed) {
      sendToRenderer('OCR', `OCR output (offline): ${text.trim()}`);
    } else {
      vpnSocket.write(text.trim() + '\n');
      sendToRenderer('VPN', `OCR Result sent over VPN:\n${text.trim()}`);
    }
  } catch (err) {
    sendToRenderer('OCR ERROR', err.message);
  }
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  if (serverProcess) serverProcess.kill();
  if (clientProcess) clientProcess.kill();
  if (vpnSocket) vpnSocket.destroy();
  if (ncServerProcess) ncServerProcess.kill();
  win = null;
  if (process.platform !== 'darwin') app.quit();
});

console.log('App starting...');

// Disable hardware acceleration to avoid graphics issues
app.disableHardwareAcceleration();

app.whenReady().then(() => {
  console.log('App ready, creating window...');
  createWindow();
  
  // Additional check to ensure window visibility
  setTimeout(() => {
    if (win && !win.isDestroyed()) {
      console.log('Double-checking window visibility...');
      const bounds = win.getBounds();
      console.log('Window bounds:', bounds);
      win.show();
      win.focus();
    }
  }, 1000);
});

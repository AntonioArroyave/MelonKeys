const { app, BrowserWindow, globalShortcut, clipboard, ipcMain } = require('electron');
const path = require('path');

let win;

const shortcuts = [
  { key: 'Control+1', description: 'Quitar prefijo +57', action: 'removeColombia' },
  { key: 'Control+Shift+1', description: 'Agregar prefijo +57', action: 'addColombia' },
  { key: 'Control+2', description: 'Quitar prefijo +593 y agregar 0', action: 'removeEcuador' },
  { key: 'Control+Shift+2', description: 'Quitar 0 y agregar prefijo +593', action: 'addEcuador' }
];

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

function removeColombia() {
  let text = clipboard.readText();
  text = text.replace(/^\+57/, '');
  clipboard.writeText(text);
}

function addColombia() {
  let text = clipboard.readText();
  if (!text.startsWith('+57')) {
    text = '+57' + text;
  }
  clipboard.writeText(text);
}

function removeEcuador() {
  let text = clipboard.readText();
  text = text.replace(/^\+593/, '0');
  clipboard.writeText(text);
}

function addEcuador() {
  let text = clipboard.readText();
  if (text.startsWith('0')) {
    text = '+593' + text.slice(1);
  } else if (!text.startsWith('+593')) {
    text = '+593' + text;
  }
  clipboard.writeText(text);
}

const actions = {
  removeColombia,
  addColombia,
  removeEcuador,
  addEcuador
};

app.whenReady().then(() => {
  createWindow();

  shortcuts.forEach(shortcut => {
    globalShortcut.register(shortcut.key, actions[shortcut.action]);
  });

  ipcMain.on('get-shortcuts', (event) => {
    event.reply('shortcuts', shortcuts.map(({ key, description }) => ({ key, description })));
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

    // Configuración de eventos del autoUpdater
    autoUpdater.on('update-available', () => {
      win.webContents.send('update_available');
    });
    autoUpdater.on('update-downloaded', () => {
      win.webContents.send('update_downloaded');
    });

});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
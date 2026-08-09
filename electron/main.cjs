const { app, BrowserWindow, ipcMain, dialog, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');
const trial = require('./trial.cjs');

const isDev = !app.isPackaged;
const MAX_BACKUPS = 20;

let mainWindow;

function getBackupDir() {
  const dir = path.join(app.getPath('userData'), 'backups');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function localDateStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function localTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}${String(d.getSeconds()).padStart(2, '0')}`;
}

/** حفظ نسخة احتياطية تلقائية والاحتفاظ بآخر MAX_BACKUPS فقط */
function autoBackup(data) {
  try {
    const dir = getBackupDir();
    const fileName = `auto-${localDateStr()}-${localTimeStr()}.json`;
    const filePath = path.join(dir, fileName);
    const payload = {
      ...data,
      exportedAt: new Date().toISOString(),
      backupType: 'auto'
    };
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');

    // حذف الأقدم إذا تجاوز الحد
    const files = fs
      .readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => ({ name: f, time: fs.statSync(path.join(dir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    if (files.length > MAX_BACKUPS) {
      files.slice(MAX_BACKUPS).forEach(f => {
        try {
          fs.unlinkSync(path.join(dir, f.name));
        } catch (_) {}
      });
    }
    return { success: true, path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/** نسخة يومية واحدة (إن لم تكن موجودة اليوم) */
function ensureDailyBackup(data) {
  try {
    const dir = getBackupDir();
    const today = localDateStr();
    const exists = fs.readdirSync(dir).some(f => f.startsWith(`auto-${today}-`) || f.startsWith(`daily-${today}`));
    if (exists) return { success: true, skipped: true };

    const filePath = path.join(dir, `daily-${today}.json`);
    fs.writeFileSync(
      filePath,
      JSON.stringify({ ...data, exportedAt: new Date().toISOString(), backupType: 'daily' }, null, 2),
      'utf-8'
    );
    return { success: true, path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'Clinic Pro',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    show: false,
    backgroundColor: '#0f172a',
    titleBarStyle: 'default',
    autoHideMenuBar: true
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // عند الإغلاق الصحيح: اطلب البيانات من الواجهة واحفظ نسخة
  mainWindow.on('close', (e) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('app-closing');
      // نعطي وقتًا قصيرًا للحفظ ثم نغلق
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('export-json', async (_event, data) => {
  const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
    title: 'تصدير نسخة احتياطية',
    defaultPath: `clinic-backup-${localDateStr()}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });
  if (canceled || !filePath) return { success: false, canceled: true };
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true, path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('import-json', async () => {
  const { filePaths, canceled } = await dialog.showOpenDialog(mainWindow, {
    title: 'استيراد نسخة احتياطية',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  });
  if (canceled || !filePaths?.length) return { success: false, canceled: true };
  try {
    const content = fs.readFileSync(filePaths[0], 'utf-8');
    const data = JSON.parse(content);
    return { success: true, data, raw: content };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('auto-backup', async (_event, data) => {
  const r1 = autoBackup(data);
  ensureDailyBackup(data);
  return r1;
});

ipcMain.handle('list-backups', async () => {
  try {
    const dir = getBackupDir();
    const files = fs
      .readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const full = path.join(dir, f);
        const st = fs.statSync(full);
        return { name: f, path: full, size: st.size, mtime: st.mtime.toISOString() };
      })
      .sort((a, b) => (a.mtime < b.mtime ? 1 : -1));
    return { success: true, files, dir };
  } catch (err) {
    return { success: false, error: err.message, files: [] };
  }
});

ipcMain.handle('get-app-version', () => app.getVersion());

// ── الترخيص والتفعيل ──────────────────────────────────────────────────────
ipcMain.handle('license-get-status', () => {
  try {
    return { success: true, ...trial.getStatus(app.getPath('userData')) };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('license-activate', (_event, code) => {
  try {
    return trial.activate(app.getPath('userData'), code);
  } catch (err) {
    return { success: false, message: 'خطأ غير متوقع: ' + err.message };
  }
});

ipcMain.handle('license-copy-machine-id', (_event, text) => {
  clipboard.writeText(String(text || ''));
  return { success: true };
});

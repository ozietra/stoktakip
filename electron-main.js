const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');
const fs = require('fs');
const http = require('http');

let mainWindow;
let backendProcess;

// Log dosyası oluştur
const logPath = isDev
  ? path.join(__dirname, 'debug.log')
  : path.join(app.getPath('userData'), 'debug.log');

function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(logPath, logMessage);
}

// Backend'in hazır olup olmadığını kontrol et
function checkBackendHealth(retries = 0) {
  return new Promise((resolve, reject) => {
    const maxRetries = 30; // 30 saniye

    if (retries >= maxRetries) {
      reject(new Error('Backend başlatılamadı (timeout)'));
      return;
    }

    const req = http.get('http://localhost:5001/api/health', (res) => {
      if (res.statusCode === 200) {
        writeLog('✅ Backend hazır!');
        resolve();
      } else {
        setTimeout(() => {
          checkBackendHealth(retries + 1).then(resolve).catch(reject);
        }, 1000);
      }
    });

    req.on('error', () => {
      setTimeout(() => {
        checkBackendHealth(retries + 1).then(resolve).catch(reject);
      }, 1000);
    });

    req.setTimeout(500);
  });
}

// Backend sunucusunu başlat
async function startBackend() {
  try {
    writeLog('🚀 Backend başlatılıyor...');

    // Production'da backend resources içinde (extraResources)
    const backendPath = isDev
      ? path.join(__dirname, 'backend')
      : path.join(process.resourcesPath, 'backend');

    writeLog(`📁 Backend yolu: ${backendPath}`);

    // Backend klasörünün var olup olmadığını kontrol et
    if (!fs.existsSync(backendPath)) {
      throw new Error(`Backend klasörü bulunamadı: ${backendPath}`);
    }

    // server.js dosyasının var olup olmadığını kontrol et
    const serverPath = path.join(backendPath, 'server.js');
    if (!fs.existsSync(serverPath)) {
      throw new Error(`server.js bulunamadı: ${serverPath}`);
    }

    writeLog(`✅ Backend dosyaları mevcut`);

    // SQLite veritabanı yolu - kullanıcı verilerinde sakla
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'stok_yonetim.db');

    writeLog(`📁 SQLite veritabanı yolu: ${dbPath}`);

    // Backend için environment variables
    const env = {
      ...process.env,
      NODE_ENV: isDev ? 'development' : 'production',
      IS_ELECTRON: 'true',
      SQLITE_DB_PATH: dbPath,
      USERDATA_PATH: userDataPath,
      PORT: '5001',
      JWT_SECRET: 'stok-yonetim-secret-key-2024-electron',
      JWT_REFRESH_SECRET: 'stok-yonetim-refresh-secret-key-2024-electron',
      JWT_EXPIRE: '7d',
      JWT_REFRESH_EXPIRE: '30d',
      FRONTEND_URL: 'http://localhost:5001'
    };

    writeLog('🔧 Node.js başlatılıyor (SQLite modunda)...');

    // Log dosyaları için stream'ler oluştur
    const stdoutLog = fs.createWriteStream(path.join(app.getPath('userData'), 'backend-stdout.log'));
    const stderrLog = fs.createWriteStream(path.join(app.getPath('userData'), 'backend-stderr.log'));

    backendProcess = spawn('node', ['server.js'], {
      cwd: backendPath,
      shell: true,
      env: env,
      windowsHide: true, // Windows'ta console penceresini gizle
      detached: false
    });

    backendProcess.stdout.pipe(stdoutLog);
    backendProcess.stderr.pipe(stderrLog);

    backendProcess.stdout.on('data', (data) => {
      writeLog(`[Backend] ${data.toString().trim()}`);
    });

    backendProcess.stderr.on('data', (data) => {
      writeLog(`[Backend ERROR] ${data.toString().trim()}`);
    });

    backendProcess.on('error', (error) => {
      writeLog(`❌ Backend spawn hatası: ${error.message}`);
      throw error;
    });

    backendProcess.on('close', (code) => {
      writeLog(`⚠️ Backend kapandı (kod: ${code})`);
      if (code !== 0 && code !== null) {
        dialog.showErrorBox('Backend Hatası', `Backend beklenmedik şekilde kapandı (kod: ${code})`);
      }
    });

    writeLog('⏳ Backend hazır olması bekleniyor...');

    // Backend'in hazır olmasını bekle
    await checkBackendHealth();

    writeLog('✅ Backend başarıyla başlatıldı (SQLite)');
    return true;

  } catch (error) {
    writeLog(`❌ Backend başlatma hatası: ${error.message}`);
    writeLog(`📋 Log dosyası: ${logPath}`);
    throw error;
  }
}

// Ana pencereyi oluştur
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    backgroundColor: '#1f2937',
    show: false,
    autoHideMenuBar: true
  });

  // Development modunda localhost:3000'den yükle (React dev server)
  // Production modda localhost:5001'den yükle (Backend server)
  // Backend production modda static files serve ediyor (server.js'te tanımlı)
  const startUrl = isDev
    ? 'http://localhost:3000'
    : 'http://localhost:5001';

  mainWindow.loadURL(startUrl);

  // Pencere hazır olduğunda göster
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  // DevTools'u sadece development modunda aç
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Menüyü özelleştir
  const menu = Menu.buildFromTemplate([
    {
      label: 'Dosya',
      submenu: [
        { role: 'quit', label: 'Çıkış' }
      ]
    },
    {
      label: 'Düzenle',
      submenu: [
        { role: 'undo', label: 'Geri Al' },
        { role: 'redo', label: 'Yinele' },
        { type: 'separator' },
        { role: 'cut', label: 'Kes' },
        { role: 'copy', label: 'Kopyala' },
        { role: 'paste', label: 'Yapıştır' }
      ]
    },
    {
      label: 'Görünüm',
      submenu: [
        { role: 'reload', label: 'Yenile' },
        { role: 'forceReload', label: 'Zorla Yenile' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Varsayılan Zoom' },
        { role: 'zoomIn', label: 'Yakınlaştır' },
        { role: 'zoomOut', label: 'Uzaklaştır' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tam Ekran' }
      ]
    },
    {
      label: 'Yardım',
      submenu: [
        {
          label: 'Hakkında',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Stok Yönetim Sistemi',
              message: 'Stok Yönetim Sistemi v1.0.0',
              detail: 'Gelişmiş stok ve envanter yönetimi için profesyonel çözüm.\n\nVeritabanı: SQLite (Gömülü)'
            });
          }
        },
        {
          label: 'Veritabanı Konumu',
          click: () => {
            const dbPath = path.join(app.getPath('userData'), 'stok_yonetim.db');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Veritabanı Konumu',
              message: 'SQLite Veritabanı Dosyası:',
              detail: dbPath
            });
          }
        }
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Uygulama hazır olduğunda
app.whenReady().then(async () => {
  try {
    writeLog('\n════════════════════════════════════════════════════════');
    writeLog('  📦 STOK YÖNETİM SİSTEMİ BAŞLATILIYOR...');
    writeLog('  🗄️  Veritabanı: SQLite (Gömülü - Kurulum gerektirmez)');
    writeLog('════════════════════════════════════════════════════════\n');

    // SQLite kullanıldığı için MySQL başlatmaya gerek yok
    writeLog('✅ SQLite modu - Harici veritabanı sunucusuna gerek yok');

    // Backend'i başlat ve hazır olmasını bekle
    await startBackend();

    // Pencereyi oluştur
    createWindow();

    writeLog('\n════════════════════════════════════════════════════════');
    writeLog('  ✅ UYGULAMA BAŞARIYLA BAŞLATILDI!');
    writeLog('  📁 Veritabanı: ' + path.join(app.getPath('userData'), 'stok_yonetim.db'));
    writeLog('════════════════════════════════════════════════════════\n');

  } catch (error) {
    writeLog(`\n❌ UYGULAMA BAŞLATMA HATASI: ${error.message}`);
    writeLog(`📋 Log dosyası: ${logPath}\n`);

    dialog.showErrorBox(
      'Başlatma Hatası',
      `Uygulama başlatılamadı:\n\n${error.message}\n\nLog dosyası:\n${logPath}`
    );

    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0 && !mainWindow) {
      createWindow();
    }
  });
});

// Tüm pencereler kapatıldığında
app.on('window-all-closed', () => {
  // Backend'i kapat
  if (backendProcess) {
    writeLog('🛑 Backend kapatılıyor...');
    backendProcess.kill();
  }

  // macOS dışında uygulamayı kapat
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Uygulama kapatılırken
app.on('before-quit', () => {
  writeLog('\n════════════════════════════════════════════════════════');
  writeLog('  🛑 UYGULAMA KAPATILIYOR...');
  writeLog('════════════════════════════════════════════════════════\n');

  if (backendProcess) {
    backendProcess.kill();
  }
});

// Hata yakalama
process.on('uncaughtException', (error) => {
  writeLog('❌ Yakalanmamış hata: ' + error.message);
});

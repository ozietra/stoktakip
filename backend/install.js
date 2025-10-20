// =====================================================
// OTOMATIK KURULUM SİSTEMİ
// Sadece ilk kurulumda çalışır, sonra kilitlenir
// =====================================================

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kurulum lock dosyası kontrolü
const LOCK_FILE = path.join(__dirname, '.install_lock');

// Lock kontrolü middleware
const checkLock = async (req, res, next) => {
  try {
    await fs.access(LOCK_FILE);
    return res.status(403).json({
      success: false,
      message: 'Kurulum zaten tamamlanmış! Güvenlik nedeniyle tekrar kurulum yapılamaz.'
    });
  } catch {
    // Lock dosyası yok, kuruluma devam et
    next();
  }
};

// =====================================================
// API ENDPOINTS
// =====================================================

// 1. Veritabanı bağlantısını test et
app.post('/install/test-db', checkLock, async (req, res) => {
  try {
    const { host, port, database, username, password } = req.body;

    // Validation
    if (!host || !database || !username) {
      return res.status(400).json({
        success: false,
        message: 'Host, veritabanı adı ve kullanıcı adı gerekli!'
      });
    }

    // Bağlantıyı test et
    const connection = await mysql.createConnection({
      host: host || 'localhost',
      port: port || 3306,
      user: username,
      password: password || '',
    });

    // Veritabanının var olup olmadığını kontrol et
    const [databases] = await connection.query(
      'SHOW DATABASES LIKE ?',
      [database]
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Veritabanı bağlantısı başarılı!',
      databaseExists: databases.length > 0
    });

  } catch (error) {
    console.error('DB Test Error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 'ER_ACCESS_DENIED_ERROR'
        ? 'Veritabanı kullanıcı adı veya şifresi hatalı!'
        : error.code === 'ECONNREFUSED'
        ? 'Veritabanı sunucusuna bağlanılamıyor! MySQL çalışıyor mu?'
        : `Veritabanı hatası: ${error.message}`
    });
  }
});

// 2. Kurulumu başlat (tabloları oluştur)
app.post('/install/run', checkLock, async (req, res) => {
  let connection = null;
  
  try {
    const {
      dbHost,
      dbPort,
      dbName,
      dbUser,
      dbPassword,
      adminEmail,
      adminPassword,
      adminFirstName,
      adminLastName,
      siteName
    } = req.body;

    // Validation
    if (!dbHost || !dbName || !dbUser || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: 'Tüm gerekli alanları doldurun!'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir email adresi girin!'
      });
    }

    // Şifre validation (min 6 karakter)
    if (adminPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalı!'
      });
    }

    console.log('🚀 Kurulum başlıyor...');

    // Veritabanına bağlan
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort || 3306,
      user: dbUser,
      password: dbPassword || '',
      multipleStatements: true
    });

    // Veritabanını oluştur (yoksa)
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ Veritabanı hazır');

    // Veritabanını seç
    await connection.query(`USE \`${dbName}\``);

    // SQL dosyasını oku
    const sqlPath = path.join(__dirname, '..', 'database.sql');
    let sqlContent = await fs.readFile(sqlPath, 'utf8');

    // Database.sql'deki CREATE DATABASE ve USE satırlarını kaldır (zaten yaptık)
    sqlContent = sqlContent
      .replace(/CREATE DATABASE IF NOT EXISTS.*?;/gi, '')
      .replace(/USE `.*?`;/gi, '');

    // SQL'i çalıştır (tabloları oluştur)
    console.log('📦 Tablolar oluşturuluyor...');
    await connection.query(sqlContent);
    console.log('✅ Tablolar oluşturuldu');

    // Admin şifresini hashle
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Admin kullanıcıyı oluştur (database.sql'deki örnek admin'i sil önce)
    await connection.query('DELETE FROM users WHERE email = ?', ['admin@stok.com']);
    
    await connection.query(
      `INSERT INTO users (username, email, password, first_name, last_name, role, is_active, language, theme) 
       VALUES (?, ?, ?, ?, ?, 'admin', 1, 'tr', 'light')`,
      ['admin', adminEmail, hashedPassword, adminFirstName || 'Admin', adminLastName || 'User']
    );
    console.log('✅ Admin kullanıcı oluşturuldu');

    // .env dosyasını oluştur
    const envContent = `# Veritabanı Ayarları
DB_HOST=${dbHost}
DB_PORT=${dbPort || 3306}
DB_NAME=${dbName}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword || ''}

# JWT Secret (Güvenli random string)
JWT_SECRET=${generateRandomString(64)}
JWT_EXPIRE=7d

# Server Ayarları
PORT=5000
NODE_ENV=production

# Site Bilgileri
SITE_NAME=${siteName || 'Stok Yönetim Sistemi'}

# Upload Ayarları
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS Ayarları
CORS_ORIGIN=*

# Log Ayarları
LOG_LEVEL=info
`;

    const envPath = path.join(__dirname, '.env');
    await fs.writeFile(envPath, envContent);
    console.log('✅ .env dosyası oluşturuldu');

    // Frontend .env oluştur
    const frontendEnvContent = `REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SITE_NAME=${siteName || 'Stok Yönetim Sistemi'}
`;
    const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env');
    try {
      await fs.writeFile(frontendEnvPath, frontendEnvContent);
      console.log('✅ Frontend .env dosyası oluşturuldu');
    } catch (err) {
      console.log('⚠️ Frontend .env oluşturulamadı (önemli değil)');
    }

    // Lock dosyası oluştur (tekrar kurulum yapılmasın)
    await fs.writeFile(LOCK_FILE, JSON.stringify({
      installedAt: new Date().toISOString(),
      version: '1.0.0',
      adminEmail: adminEmail
    }));
    console.log('🔒 Kurulum kilitlendi');

    await connection.end();

    res.json({
      success: true,
      message: 'Kurulum başarıyla tamamlandı! Giriş sayfasına yönlendiriliyorsunuz...',
      data: {
        adminEmail: adminEmail,
        dbName: dbName
      }
    });

  } catch (error) {
    console.error('❌ Kurulum Hatası:', error);
    
    if (connection) {
      await connection.end();
    }

    res.status(500).json({
      success: false,
      message: `Kurulum hatası: ${error.message}`
    });
  }
});

// 3. Kurulum durumunu kontrol et
app.get('/install/status', async (req, res) => {
  try {
    const lockData = await fs.readFile(LOCK_FILE, 'utf8');
    const lockInfo = JSON.parse(lockData);
    
    res.json({
      success: true,
      installed: true,
      info: lockInfo
    });
  } catch {
    res.json({
      success: true,
      installed: false
    });
  }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// =====================================================
// SERVER START
// =====================================================

const PORT = process.env.INSTALL_PORT || 5001;

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 STOK YÖNETİM SİSTEMİ - KURULUM SUNUCUSU');
  console.log('='.repeat(60));
  console.log(`✅ Kurulum sunucusu çalışıyor: http://localhost:${PORT}`);
  console.log(`📦 Kurulum sayfası: http://localhost:3000/install.html`);
  console.log('='.repeat(60) + '\n');
});

module.exports = app;


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const cronJobs = require('./utils/cronJobs');

// Modelleri yükle
require('./models');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Request timeout (30 saniye)
app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

// Rate limiting - Development'ta devre dışı
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000, // 5 dakika
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5000, // 5000 istek
    message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);
  console.log('✅ Rate limiting aktif');
} else {
  console.log('⚠️  Rate limiting devre dışı (development mode)');
}

// Static files
app.use('/uploads', express.static('uploads'));

// Web version için frontend static files (production modda)
const path = require('path');
const publicPath = path.join(__dirname, 'public');
if (process.env.NODE_ENV === 'production' && require('fs').existsSync(publicPath)) {
  app.use(express.static(publicPath));
  console.log('✅ Web version aktif - Frontend static files serve ediliyor');
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/units', require('./routes/unitRoutes'));
app.use('/api/warehouses', require('./routes/warehouseRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/stock-movements', require('./routes/stockMovementRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/purchase-orders', require('./routes/purchaseOrderRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/system', require('./routes/systemRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server çalışıyor' });
});

// Web version için SPA routing (production modda)
// API route'ları dışındaki tüm GET isteklerini index.html'e yönlendir
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res, next) => {
    // API route'ları için 404 dön
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'Endpoint bulunamadı' });
    }
    
    // Web version için index.html serve et
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ message: 'Endpoint bulunamadı' });
    }
  });
} else {
  // Development modda normal 404
  app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint bulunamadı' });
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║       🚀 BACKEND SERVER BAŞLATILIYOR...            ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    
    console.log('📍 Adım 1: Veritabanı Bağlantısı Test Ediliyor...\n');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('\n❌❌❌ VERİTABANI BAĞLANTISI KURULAMADI ❌❌❌');
      console.error('Sunucu başlatılamıyor. Lütfen MySQL sunucusunun çalıştığından emin olun.');
      process.exit(1);
    }

    console.log('\n📍 Adım 2: Model ve İlişkilendirmeleri Yükleniyor...\n');
    const modelLoadStart = Date.now();
    const db = require('./models');
    console.log(`✅ Modeller yüklendi (${Date.now() - modelLoadStart}ms)`);
    
    console.log('\n📍 Adım 3: Veritabanı Senkronizasyonu...\n');
    try {
      const syncStart = Date.now();
      await db.syncDatabase({ alter: true, force: false });
      console.log(`⏱️ Toplam senkronizasyon süresi: ${Date.now() - syncStart}ms`);
    } catch (syncError) {
      console.error('\n⚠️⚠️⚠️ İLK SENKRONİZASYON HATASI ⚠️⚠️⚠️');
      console.error('Hata:', syncError.message);
      console.error('\n🔄 2 saniye sonra tekrar deneniyor...\n');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const retryStart = Date.now();
        await db.syncDatabase({ alter: true, force: false });
        console.log(`✅ İkinci denemede başarılı! (${Date.now() - retryStart}ms)`);
      } catch (retryError) {
        console.error('\n❌❌❌ SENKRONİZASYON BAŞARISIZ (2. Deneme) ❌❌❌');
        console.error('Hata:', retryError.message);
        console.error('Stack:', retryError.stack);
        console.error('\n⚠️ Bazı tablolar eksik olabilir, sunucu yine de başlatılıyor...\n');
      }
    }
    
    // Production'da ilk kurulum kontrolü
    if (process.env.NODE_ENV === 'production') {
      console.log('\n📍 Adım 4: İlk Kurulum Kontrolü (Production Mode)...\n');
      const { User } = require('./models');
      const adminExists = await User.findOne({ where: { role: 'admin' } });
      
      if (!adminExists) {
        console.log('🔧 Admin kullanıcı bulunamadı, ilk kurulum yapılıyor...');
        const { setupDatabase } = require('./install/setup-database');
        await setupDatabase();
      } else {
        console.log('✅ Admin kullanıcı mevcut, ilk kurulum atlanıyor');
      }
    }

    console.log('\n📍 Adım 5: Cron Jobs Başlatılıyor...\n');
    cronJobs.startAll();

    // Start listening
    console.log('\n📍 Adım 6: HTTP Server Başlatılıyor...\n');
    const server = app.listen(PORT, () => {
      console.log('\n╔══════════════════════════════════════════════════════╗');
      console.log('║       ✅ SERVER BAŞARIYLA BAŞLATILDI!              ║');
      console.log('╚══════════════════════════════════════════════════════╝');
      console.log(`\n🚀 Server ${PORT} portunda çalışıyor`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📦 API: http://localhost:${PORT}/api`);
      console.log(`📅 Başlatma Zamanı: ${new Date().toLocaleString('tr-TR')}`);
      console.log('\n════════════════════════════════════════════════════════\n');
    });

    // Set keep-alive timeout (default 5 seconds is too low)
    server.keepAliveTimeout = 65000; // 65 seconds
    server.headersTimeout = 66000; // Must be greater than keepAliveTimeout

    // Graceful shutdown - Railway deployment için optimize edildi
    let isShuttingDown = false;
    
    const gracefulShutdown = async (signal) => {
      if (isShuttingDown) {
        console.log(`${signal} zaten işleniyor, tekrar kapatma atlanıyor...`);
        return;
      }
      
      isShuttingDown = true;
      console.log(`\n${signal} alındı. Sunucu kapatılıyor...`);
      
      // Railway deployment sırasında SIGTERM normal, hemen kapatma
      if (signal === 'SIGTERM' && process.env.RAILWAY_ENVIRONMENT) {
        console.log('Railway deployment tespit edildi, hızlı kapatma...');
        process.exit(0);
        return;
      }
      
      server.close(async () => {
        console.log('HTTP sunucusu kapatıldı');
        
        try {
          // Database bağlantısını sadece gerçek kapatma durumunda kapat
          if (signal !== 'SIGTERM' || !process.env.RAILWAY_ENVIRONMENT) {
            await sequelize.close();
            console.log('Veritabanı bağlantısı kapatıldı');
          }
          process.exit(0);
        } catch (error) {
          console.error('Kapatma hatası:', error);
          process.exit(1);
        }
      });

      // Force close after 15 seconds (Railway için daha uzun)
      setTimeout(() => {
        console.error('Zorla kapatılıyor...');
        process.exit(1);
      }, 15000);
    };

    // Railway deployment sırasında SIGTERM'i daha toleranslı handle et
    process.on('SIGTERM', () => {
      if (process.env.RAILWAY_ENVIRONMENT) {
        console.log('Railway SIGTERM alındı, deployment devam ediyor...');
        // Railway deployment sırasında database bağlantısını kapatma
        return;
      }
      gracefulShutdown('SIGTERM');
    });
    
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Yakalanmamış hata:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('İşlenmeyen Promise reddi:', reason);
    });

  } catch (error) {
    console.error('❌ Sunucu başlatma hatası:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

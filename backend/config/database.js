const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Veritabanı tipini belirle (DB_TYPE env var, Electron kontrolü, veya varsayılan MySQL)
const dbType = process.env.DB_TYPE;
const isElectron = process.env.IS_ELECTRON === 'true' || process.versions.electron;
const dbDialect = dbType || (isElectron ? 'sqlite' : 'mysql');

console.log(`🔌 Veritabanı tipi: ${dbDialect.toUpperCase()}`);

let sequelize;

if (dbDialect === 'sqlite') {
  // SQLite için yapılandırma (.exe versiyonu veya Railway)
  const dbPath = process.env.DB_PATH || process.env.SQLITE_DB_PATH || path.join(
    process.env.USERDATA_PATH || __dirname,
    'stok_yonetim.db'
  );

  console.log('📁 SQLite veritabanı yolu:', dbPath);

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,

    // SQLite için optimize edilmiş ayarlar
    pool: {
      max: 1,  // SQLite tek bağlantı kullanır
      min: 1,
      idle: 30000,
      acquire: 60000,
      evict: 1000
    },
    
    // Connection retry logic
    retry: {
      max: 3,
      timeout: 5000
    },

    // Model ayarları
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    },

    // SQLite için özel ayarlar
    dialectOptions: {
      // Yabancı anahtar kısıtlamalarını etkinleştir
      foreignKeys: true
    }
  });

} else {
  // MySQL için yapılandırma (web versiyonu)
  const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'stok_yonetim',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  };

  console.log('🔌 MySQL bağlantı bilgileri:', {
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    database: DB_CONFIG.database,
    user: DB_CONFIG.username
  });

  sequelize = new Sequelize(
    DB_CONFIG.database,
    DB_CONFIG.username,
    DB_CONFIG.password,
    {
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,

      // Connection pool - optimized for stability and performance
      pool: {
        max: 20,        // Increased max connections
        min: 5,         // Increased min connections
        acquire: 120000, // 2 minutes to acquire connection
        idle: 300000,   // 5 minutes idle timeout (much more forgiving)
        evict: 60000,   // 1 minute eviction interval
        handleDisconnects: true,
        validate: (connection) => {
          return connection && !connection._closing;
        }
      },

      // Enhanced retry logic for connection failures
      retry: {
        max: 8,
        timeout: 5000,
        match: [
          /ECONNREFUSED/,
          /ETIMEDOUT/,
          /ENOTFOUND/,
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/,
          /ConnectionManager\.getConnection was called after the connection manager was closed/
        ]
      },

      // Additional connection options for stability
      dialectOptions: {
        connectTimeout: 120000, // 2 minutes
        // Removed invalid options that cause warnings in MySQL2
      },

      // Timezone ayarı
      timezone: '+03:00',

      // Model ayarları
      define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true,
        charset: 'utf8',
        collate: 'utf8_general_ci'
      }
    }
  );
}

// Connection health monitoring
let connectionHealthy = true;
let lastHealthCheck = Date.now();

const checkConnectionHealth = async () => {
  try {
    await sequelize.authenticate();
    if (!connectionHealthy) {
      console.log('✅ Veritabanı bağlantısı yeniden sağlandı');
      connectionHealthy = true;
    }
    lastHealthCheck = Date.now();
    return true;
  } catch (error) {
    if (connectionHealthy) {
      console.error('❌ Veritabanı bağlantısı kesildi:', error.message);
      connectionHealthy = false;
    }
    return false;
  }
};

// Periodic health check (every 30 seconds)
setInterval(checkConnectionHealth, 30000);

// Enhanced connection test with health monitoring
const testConnection = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔍 Veritabanı bağlantısı test ediliyor... (Deneme ${attempt}/${retries})`);

      await sequelize.authenticate();

      // Test connection pool
      if (dbDialect === 'mysql') {
        const pool = sequelize.connectionManager.pool;
        console.log(`📊 Connection Pool Status: ${pool.used}/${pool.size} kullanımda`);
      }

      if (dbDialect === 'sqlite') {
        console.log('✅ SQLite veritabanı bağlantısı başarılı!');
        console.log(`📁 Veritabanı dosyası: ${sequelize.options.storage}`);
      } else {
        console.log('✅ MySQL veritabanı bağlantısı başarılı!');
        console.log(`📁 Veritabanı: ${sequelize.config.database} @ ${sequelize.config.host}:${sequelize.config.port}`);
      }

      connectionHealthy = true;
      lastHealthCheck = Date.now();
      return true;
    } catch (error) {
      console.error(`❌ Bağlantı denemesi ${attempt}/${retries} başarısız:`, error.message);

      // Check for specific connection manager error
      if (error.message && error.message.includes('ConnectionManager.getConnection was called after the connection manager was closed')) {
        console.error('🔧 Connection Manager kapatılmış - yeniden başlatma gerekiyor');
        
        // Try to recreate the connection manager
        try {
          await sequelize.connectionManager.initPools();
          console.log('✅ Connection Manager yeniden başlatıldı');
        } catch (recreateError) {
          console.error('❌ Connection Manager yeniden başlatılamadı:', recreateError.message);
        }
      }

      // Son deneme ise, detaylı hata göster
      if (attempt === retries) {
        console.error(`\n❌❌❌ ${dbDialect.toUpperCase()} BAĞLANTI HATASI ❌❌❌`);
        console.error('Ana hata:', error.message || error.toString());
        console.error('Hata tipi:', error.name);

        if (dbDialect === 'mysql') {
          console.error('Hata kodu:', error.code || 'YOK');
          console.error('Errno:', error.errno || 'YOK');
          console.error('SQL State:', error.sqlState || 'YOK');
          console.error('SQL Message:', error.sqlMessage || 'YOK');

          console.log('\n🔧 Olası Çözümler:');
          console.log('1. MySQL sunucusunun çalıştığından emin olun');
          console.log('2. Port numarasını kontrol edin (varsayılan: 3306)');
          console.log('3. Kullanıcı adı ve şifresini kontrol edin');
          console.log('4. Veritabanının oluşturulduğundan emin olun');
          console.log('5. Connection pool ayarlarını kontrol edin');
        } else {
          console.log('\n🔧 Olası Çözümler:');
          console.log('1. Veritabanı dosyası için yazma izinlerini kontrol edin');
          console.log('2. Dizinin var olduğundan emin olun');
        }

        connectionHealthy = false;
        return false;
      }

      // Retry olmadan önce bekle (exponential backoff)
      const waitTime = Math.min(2000 * Math.pow(1.5, attempt - 1), 10000);
      console.log(`⏳ ${Math.round(waitTime/1000)} saniye sonra tekrar denenecek...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  return false;
};

// Connection recovery function
const recoverConnection = async () => {
  console.log('🔄 Veritabanı bağlantısı kurtarılmaya çalışılıyor...');
  
  try {
    // Close existing connections
    await sequelize.close();
    console.log('📴 Mevcut bağlantılar kapatıldı');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reinitialize connection
    await sequelize.authenticate();
    console.log('✅ Veritabanı bağlantısı kurtarıldı');
    
    connectionHealthy = true;
    return true;
  } catch (error) {
    console.error('❌ Bağlantı kurtarma başarısız:', error.message);
    return false;
  }
};

// Get connection status
const getConnectionStatus = () => ({
  healthy: connectionHealthy,
  lastCheck: lastHealthCheck,
  timeSinceLastCheck: Date.now() - lastHealthCheck
});

module.exports = { 
  sequelize, 
  testConnection, 
  dbDialect, 
  checkConnectionHealth, 
  recoverConnection, 
  getConnectionStatus 
};

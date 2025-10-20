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

      // Connection pool - increased timeouts for better stability
      pool: {
        max: 10,
        min: 2,
        acquire: 60000,
        idle: 10000,
        evict: 10000
      },

      // Retry logic for connection failures
      retry: {
        max: 5,
        timeout: 3000,
        match: [
          /ECONNREFUSED/,
          /ETIMEDOUT/,
          /ENOTFOUND/,
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/
        ]
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

// Veritabanı bağlantısını test et
const testConnection = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔍 Veritabanı bağlantısı test ediliyor... (Deneme ${attempt}/${retries})`);

      await sequelize.authenticate();

      if (dbDialect === 'sqlite') {
        console.log('✅ SQLite veritabanı bağlantısı başarılı!');
        console.log(`📁 Veritabanı dosyası: ${sequelize.options.storage}`);
      } else {
        console.log('✅ MySQL veritabanı bağlantısı başarılı!');
        console.log(`📁 Veritabanı: ${sequelize.config.database} @ ${sequelize.config.host}:${sequelize.config.port}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ Bağlantı denemesi ${attempt}/${retries} başarısız:`, error.message);

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
        } else {
          console.log('\n🔧 Olası Çözümler:');
          console.log('1. Veritabanı dosyası için yazma izinlerini kontrol edin');
          console.log('2. Dizinin var olduğundan emin olun');
        }

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

module.exports = { sequelize, testConnection, dbDialect };

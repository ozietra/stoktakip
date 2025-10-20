const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');
const mysql = require('mysql2/promise');

class MySQLManager {
  constructor(app) {
    this.app = app;
    this.mysqldProcess = null;
    
    // Akıllı yol tespiti: Dosya sistemini kontrol ederek MySQL dizinini bul
    const productionPath = path.join(process.resourcesPath, 'mysql');
    const devPath = path.join(__dirname, 'portable-mysql', 'mariadb-11.8.3-winx64');
    
    // Production build varsa onu kullan, yoksa development yolunu kullan
    if (fs.existsSync(productionPath)) {
      this.mysqlBasePath = productionPath;
      console.log('📦 Production MySQL yolu tespit edildi:', productionPath);
    } else if (fs.existsSync(devPath)) {
      this.mysqlBasePath = devPath;
      console.log('🔧 Development MySQL yolu tespit edildi:', devPath);
    } else {
      this.mysqlBasePath = null;
      console.warn('⚠️  Portable MySQL bulunamadı! Beklenen yollar:', { productionPath, devPath });
    }
    
    this.userDataPath = app.getPath('userData');
    this.mysqlDataPath = path.join(this.userDataPath, 'mysql-data');
    this.mysqlTmpPath = path.join(this.userDataPath, 'mysql-tmp');
  }

  /**
   * MySQL'in hazır olup olmadığını kontrol et (geliştirilmiş versiyon)
   */
  async checkMySQLReady(maxAttempts = 60) {
    console.log('🔍 MySQL bağlantısı kontrol ediliyor...');
    
    for (let i = 0; i < maxAttempts; i++) {
      // İlk olarak port kontrolü yap
      const portOpen = await this.testConnection();
      if (!portOpen) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      // Port açıksa, gerçek MySQL bağlantısı test et
      const mysqlReady = await this.testMySQLConnection();
      if (mysqlReady) {
        console.log('✅ MySQL tamamen hazır ve bağlantı kabul ediyor');
        
        // Veritabanının var olup olmadığını kontrol et
        const dbExists = await this.checkDatabaseExists();
        if (!dbExists) {
          console.log('📊 Veritabanı oluşturuluyor...');
          await this.createDatabase();
        }
        
        return true;
      }
      
      // Exponential backoff ile bekleme süresi
      const waitTime = Math.min(1000 * Math.pow(1.2, i), 3000);
      console.log(`⏳ MySQL henüz hazır değil, ${Math.round(waitTime/1000)}s bekleniyor... (Deneme ${i+1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    return false;
  }

  /**
   * Basit port bağlantısını test et
   */
  testConnection() {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      
      socket.setTimeout(1000);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', () => {
        resolve(false);
      });
      
      socket.connect(3306, '127.0.0.1');
    });
  }

  /**
   * Gerçek MySQL bağlantısını test et
   */
  async testMySQLConnection() {
    try {
      const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '',
        connectTimeout: 2000
      });
      
      await connection.ping();
      await connection.end();
      return true;
    } catch (error) {
      // Bağlantı hatası beklenen bir durum, sadece false dön
      return false;
    }
  }

  /**
   * Veritabanının var olup olmadığını kontrol et
   */
  async checkDatabaseExists() {
    try {
      const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '',
        connectTimeout: 5000
      });
      
      const [databases] = await connection.query('SHOW DATABASES LIKE "stok_yonetim"');
      await connection.end();
      
      return databases.length > 0;
    } catch (error) {
      console.error('❌ Veritabanı kontrolü hatası:', error.message);
      return false;
    }
  }

  /**
   * Veritabanını oluştur
   */
  async createDatabase() {
    try {
      const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '',
        connectTimeout: 5000
      });
      
      await connection.query('CREATE DATABASE IF NOT EXISTS stok_yonetim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
      console.log('✅ Veritabanı oluşturuldu: stok_yonetim');
      
      await connection.end();
      return true;
    } catch (error) {
      console.error('❌ Veritabanı oluşturma hatası:', error.message);
      return false;
    }
  }

  /**
   * Gerekli klasörleri oluştur
   */
  createDirectories() {
    const dirs = [this.mysqlDataPath, this.mysqlTmpPath];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Klasör oluşturuldu: ${dir}`);
      }
    });
  }

  /**
   * MySQL'i initialize et (ilk kurulum)
   */
  async initializeMySQL() {
    console.log('🔧 MySQL ilk kurulum yapılıyor...');
    
    const mysqldPath = path.join(this.mysqlBasePath, 'bin', 'mysqld.exe');
    
    return new Promise((resolve, reject) => {
      let errorOutput = '';
      
      const initProcess = spawn(mysqldPath, [
        '--initialize-insecure',
        `--datadir=${this.mysqlDataPath}`,
        `--basedir=${this.mysqlBasePath}`,
        '--console'
      ], {
        stdio: 'pipe',
        windowsHide: true
      });

      initProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[MySQL Init] ${output.trim()}`);
      });

      initProcess.stderr.on('data', (data) => {
        const output = data.toString();
        errorOutput += output;
        console.error(`[MySQL Init Error] ${output.trim()}`);
      });

      initProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ MySQL initialize tamamlandı');
          resolve();
        } else {
          console.error('❌ MySQL initialize detaylı hata çıktısı:');
          console.error(errorOutput);
          reject(new Error(`MySQL initialize hatası (kod: ${code}). Detaylar yukarıda.`));
        }
      });

      initProcess.on('error', (error) => {
        console.error('❌ MySQL initialize process hatası:', error);
        reject(error);
      });
    });
  }

  /**
   * my.ini dosyasını hazırla
   */
  prepareConfig() {
    // my.ini dosyası portable-mysql klasöründe, mariadb dizininin bir üst seviyesinde
    const configTemplate = path.join(path.dirname(this.mysqlBasePath), 'my.ini');
    
    // Config template'in var olup olmadığını kontrol et
    if (!fs.existsSync(configTemplate)) {
      console.error('❌ my.ini template bulunamadı:', configTemplate);
      throw new Error(`Config template not found: ${configTemplate}`);
    }
    
    const configContent = fs.readFileSync(configTemplate, 'utf8');
    
    // Değişkenleri değiştir
    const finalConfig = configContent
      .replace(/\$\{MYSQL_BASEDIR\}/g, this.mysqlBasePath.replace(/\\/g, '/'))
      .replace(/\$\{MYSQL_DATADIR\}/g, this.mysqlDataPath.replace(/\\/g, '/'))
      .replace(/\$\{MYSQL_TMPDIR\}/g, this.mysqlTmpPath.replace(/\\/g, '/'))
      .replace(/\$\{MYSQL_SOCKET\}/g, path.join(this.mysqlTmpPath, 'mysql.sock').replace(/\\/g, '/'));
    
    const finalConfigPath = path.join(this.mysqlBasePath, 'my-runtime.ini');
    fs.writeFileSync(finalConfigPath, finalConfig);
    
    console.log('✅ Config dosyası hazırlandı:', finalConfigPath);
    return finalConfigPath;
  }

  /**
   * MySQL'i başlat
   */
  async start() {
    // MySQL yolunun geçerli olup olmadığını kontrol et
    if (!this.mysqlBasePath) {
      console.error('❌ Portable MySQL yolu bulunamadı!');
      console.error('   Lütfen portable-mysql/mariadb-11.8.3-winx64 klasörünün mevcut olduğundan emin olun');
      return false;
    }

    // mysqld.exe dosyasının varlığını kontrol et
    const mysqldPath = path.join(this.mysqlBasePath, 'bin', 'mysqld.exe');
    if (!fs.existsSync(mysqldPath)) {
      console.error('❌ mysqld.exe bulunamadı!');
      console.error('   Beklenen yol:', mysqldPath);
      console.error('   MySQL Base Path:', this.mysqlBasePath);
      return false;
    }

    console.log('✅ mysqld.exe bulundu:', mysqldPath);

    // Önce mevcut MySQL'i kontrol et (WAMP/XAMPP)
    console.log('🔍 Mevcut MySQL servisi kontrol ediliyor...');
    const portInUse = await this.testConnection();
    
    if (portInUse) {
      console.log('ℹ️  Port 3306 kullanımda - WAMP/XAMPP MySQL kontrol ediliyor...');
      
      // Gerçek MySQL bağlantısını test et
      const mysqlWorking = await this.testMySQLConnection();
      if (mysqlWorking) {
        console.log('✅ WAMP/XAMPP MySQL bağlantısı çalışıyor - bu kullanılacak');
        
        // Veritabanı kontrolü
        const dbExists = await this.checkDatabaseExists();
        if (!dbExists) {
          console.log('📊 Veritabanı oluşturuluyor...');
          await this.createDatabase();
        }
        
        console.log('⏳ Backend için ek hazırlık süresi...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return true;
      } else {
        console.log('⚠️  Port açık ama MySQL bağlantısı kurulamıyor!');
        console.log('   Lütfen WAMP/XAMPP\'de MySQL servisini başlatın');
        console.log('   Veya portable MySQL kullanmak için port 3306\'yı boşaltın');
        return false;
      }
    }
    
    console.log('ℹ️  Port 3306 boş - Portable MySQL başlatılacak');

    console.log('🚀 Portable MySQL başlatılıyor...');
    console.log('📁 MySQL Base Path:', this.mysqlBasePath);
    console.log('📁 Data Path:', this.mysqlDataPath);
    console.log('📁 Tmp Path:', this.mysqlTmpPath);

    try {
      // Klasörleri oluştur
      this.createDirectories();

      // Data klasörü boşsa initialize et
      const dataFiles = fs.readdirSync(this.mysqlDataPath);
      if (dataFiles.length === 0) {
        await this.initializeMySQL();
      }

      // Config dosyasını hazırla
      const configPath = this.prepareConfig();

      // MySQL'i başlat
      console.log('🔄 MySQL komutu hazırlanıyor...');
      console.log('   mysqld path:', mysqldPath);
      console.log('   config path:', configPath);
      
      this.mysqldProcess = spawn(mysqldPath, [
        `--defaults-file=${configPath}`,
        `--datadir=${this.mysqlDataPath}`,
        `--basedir=${this.mysqlBasePath}`,
        '--console'
      ], {
        stdio: 'pipe',
        windowsHide: true
      });

      this.mysqldProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        console.log(`[MySQL] ${output}`);
      });

      this.mysqldProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        console.error(`[MySQL Error] ${output}`);
      });

      this.mysqldProcess.on('error', (error) => {
        console.error('❌ MySQL process spawn hatası:', error);
        console.error('   Error details:', {
          code: error.code,
          errno: error.errno,
          syscall: error.syscall,
          path: error.path
        });
      });

      this.mysqldProcess.on('close', (code) => {
        console.log(`MySQL process kapandı (kod: ${code})`);
        this.mysqldProcess = null;
      });

      // MySQL'in hazır olmasını bekle (geliştirilmiş kontrol)
      console.log('⏳ MySQL hazır olması bekleniyor (bu 60 saniyeye kadar sürebilir)...');
      const isReady = await this.checkMySQLReady();
      
      if (isReady) {
        console.log('✅ MySQL başarıyla başlatıldı ve bağlantı kabul ediyor');
        
        // Ek güvenlik için 2 saniye bekle
        console.log('⏳ Backend için ek hazırlık süresi...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return true;
      } else {
        throw new Error('MySQL başlatılamadı (timeout - 60 saniye)');
      }

    } catch (error) {
      console.error('❌ MySQL başlatma hatası:', error);
      return false;
    }
  }

  /**
   * MySQL'i durdur
   */
  stop() {
    if (this.mysqldProcess) {
      console.log('🛑 MySQL kapatılıyor...');
      
      // Graceful shutdown için mysqladmin kullan
      const mysqladminPath = path.join(this.mysqlBasePath, 'bin', 'mysqladmin.exe');
      
      const shutdownProcess = spawn(mysqladminPath, [
        '-u', 'root',
        '--port=3306',
        'shutdown'
      ], {
        windowsHide: true
      });

      shutdownProcess.on('close', () => {
        console.log('✅ MySQL düzgün kapatıldı');
        
        // Process hala çalışıyorsa zorla kapat
        if (this.mysqldProcess) {
          this.mysqldProcess.kill('SIGTERM');
        }
      });

      // 5 saniye sonra hala açıksa zorla kapat
      setTimeout(() => {
        if (this.mysqldProcess) {
          this.mysqldProcess.kill('SIGKILL');
        }
      }, 5000);
    }
  }
}

module.exports = MySQLManager;

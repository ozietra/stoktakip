const fs = require('fs');
const path = require('path');

// Railway'de SQLite veritabanı dosyasının kalıcı olması için
// Volume mount noktasına kopyalama işlemi
const initDatabase = () => {
  const sourceDbPath = path.join(__dirname, 'config', 'stok_yonetim.db');
  const targetDbPath = process.env.DB_PATH || process.env.SQLITE_DB_PATH || sourceDbPath;
  
  console.log('🔧 SQLite veritabanı başlatılıyor...');
  console.log('📁 Kaynak DB yolu:', sourceDbPath);
  console.log('📁 Hedef DB yolu:', targetDbPath);
  
  // Hedef dizini oluştur
  const targetDir = path.dirname(targetDbPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log('📁 Hedef dizin oluşturuldu:', targetDir);
  }
  
  // Eğer hedef dosya yoksa ve kaynak dosya varsa, kopyala
  if (!fs.existsSync(targetDbPath) && fs.existsSync(sourceDbPath)) {
    fs.copyFileSync(sourceDbPath, targetDbPath);
    console.log('✅ Veritabanı dosyası kopyalandı');
  } else if (fs.existsSync(targetDbPath)) {
    console.log('✅ Veritabanı dosyası zaten mevcut');
  } else {
    console.log('⚠️ Kaynak veritabanı dosyası bulunamadı, yeni bir tane oluşturulacak');
  }
};

module.exports = { initDatabase };

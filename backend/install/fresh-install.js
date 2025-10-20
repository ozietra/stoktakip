const { sequelize } = require('../config/database');
const { setupDatabase } = require('./setup-database');

// Modelleri yükle (sequelize.sync() için gerekli)
require('../models');

async function freshInstall() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  🎯 TEMİZ KURULUM (FRESH INSTALL) - MySQL');
  console.log('════════════════════════════════════════════════════════\n');
  console.log('⚠️  DİKKAT: Bu işlem TÜM VERİTABANINI SİLECEK!\n');

  try {
    const fs = require('fs');
    const path = require('path');
    
    // Data klasörünü oluştur
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    await sequelize.authenticate();

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      readline.question('Devam etmek istediğinize emin misiniz? (EVET yazın): ', resolve);
    });
    readline.close();

    if (answer !== 'EVET') {
      console.log('\n❌ İşlem iptal edildi.');
      process.exit(0);
    }

    console.log('\n🗑️  Tüm tablolar siliniyor...\n');
    
    // Tüm tabloları sil ve yeniden oluştur
    await sequelize.sync({ force: true });
    console.log('✅ Tüm tablolar silindi ve yeniden oluşturuldu!\n');

    // Varsayılan verileri yükle
    console.log('📦 Varsayılan veriler yükleniyor...\n');
    await setupDatabase();
    
    await sequelize.close();

    console.log('════════════════════════════════════════════════════════');
    console.log('  ✅ TEMİZ KURULUM TAMAMLANDI!');
    console.log('════════════════════════════════════════════════════════\n');
    console.log('🎉 Sistem kullanıma hazır!\n');
    console.log('📝 GİRİŞ BİLGİLERİ:');
    console.log('   Email: admin@stok.com');
    console.log('   Şifre: admin123\n');

  } catch (error) {
    console.error('\n❌ KURULUM HATASI:', error.message);
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  freshInstall();
}

module.exports = { freshInstall };


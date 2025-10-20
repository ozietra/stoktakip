const { sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');

// Modelleri yükle (sequelize.sync() için gerekli)
require('../models');

async function setupDatabase() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  📦 STOK YÖNETİM SİSTEMİ - VERİTABANI KURULUMU (MySQL)');
  console.log('════════════════════════════════════════════════════════\n');

  try {
    // 0. Data klasörünü oluştur (yoksa)
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('✅ Data klasörü oluşturuldu\n');
    }

    // 1. Veritabanı bağlantısını test et
    console.log('🔌 MySQL veritabanı bağlantısı test ediliyor...');
    await sequelize.authenticate();
    console.log('✅ MySQL bağlantısı başarılı!\n');

    // 2. Tüm tabloları oluştur
    console.log('📋 Veritabanı tabloları oluşturuluyor...');
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Tablolar oluşturuldu!\n');

    // 3. Varsayılan admin kullanıcısını kontrol et
    const { User } = require('../models');
    const adminExists = await User.findOne({ where: { role: 'admin' } });

    if (!adminExists) {
      console.log('👤 Varsayılan admin kullanıcısı oluşturuluyor...');
      
      // beforeCreate hook otomatik hash'leyecek, manuel hash'lemeye gerek yok
      await User.create({
        username: 'admin',
        email: 'admin@stok.com',
        password: 'admin123', // Hook otomatik hash'leyecek
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_active: true,
        language: 'tr',
        theme: 'light'
      });

      console.log('✅ Admin kullanıcısı oluşturuldu!');
      console.log('   Email: admin@stok.com');
      console.log('   Şifre: admin123');
      console.log('   ⚠️  GÜVENLİK: İlk girişten sonra şifrenizi değiştirin!\n');
    } else {
      console.log('ℹ️  Admin kullanıcısı zaten mevcut.\n');
    }

    // 4. Temel kategoriler ve birimleri oluştur (opsiyonel)
    await createDefaultData();

    console.log('════════════════════════════════════════════════════════');
    console.log('  ✅ KURULUM TAMAMLANDI!');
    console.log('════════════════════════════════════════════════════════\n');
    console.log('🚀 Sunucuyu başlatmak için: npm start\n');

  } catch (error) {
    console.error('\n❌ KURULUM HATASI:', error.message);
    console.error('\nDetay:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

async function createDefaultData() {
  const { Category, Unit } = require('../models');

  // Varsayılan kategorileri kontrol et
  const categoryCount = await Category.count();
  if (categoryCount === 0) {
    console.log('📁 Varsayılan kategoriler oluşturuluyor...');
    
    const categories = [
      { name: 'Genel', name_en: 'General', description: 'Genel kategori' },
      { name: 'Elektronik', name_en: 'Electronics', description: 'Elektronik ürünler' },
      { name: 'Gıda', name_en: 'Food', description: 'Gıda ürünleri' },
      { name: 'Tekstil', name_en: 'Textile', description: 'Tekstil ürünleri' },
      { name: 'Mobilya', name_en: 'Furniture', description: 'Mobilya ürünleri' }
    ];

    for (const cat of categories) {
      await Category.create(cat);
    }
    
    console.log('✅ 5 varsayılan kategori oluşturuldu.\n');
  }

  // Varsayılan birimleri kontrol et
  const unitCount = await Unit.count();
  if (unitCount === 0) {
    console.log('📏 Varsayılan birimler oluşturuluyor...');
    
    const units = [
      { name: 'Adet', abbreviation: 'Ad', is_active: true },
      { name: 'Kilogram', abbreviation: 'Kg', is_active: true },
      { name: 'Gram', abbreviation: 'Gr', is_active: true },
      { name: 'Litre', abbreviation: 'Lt', is_active: true },
      { name: 'Metre', abbreviation: 'M', is_active: true },
      { name: 'Santimetre', abbreviation: 'Cm', is_active: true },
      { name: 'Kutu', abbreviation: 'Kut', is_active: true },
      { name: 'Paket', abbreviation: 'Pkt', is_active: true },
      { name: 'Koli', abbreviation: 'Kol', is_active: true },
      { name: 'Palet', abbreviation: 'Plt', is_active: true }
    ];

    for (const unit of units) {
      await Unit.create(unit);
    }
    
    console.log('✅ 10 varsayılan birim oluşturuldu.\n');
  }
}

// Script'i çalıştır
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };


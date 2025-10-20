const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { sequelize } = require('../config/database');

// Tüm verileri sıfırla (sadece admin)
router.post('/reset-database', protect, authorize('admin'), async (req, res, next) => {
  try {
    console.log('🗑️ Veritabanı sıfırlama başlatıldı...');

    // Foreign key kontrollerini kapat
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Tüm tabloları temizle (sıralama önemli - foreign key ilişkilerine göre)
    const tablesToTruncate = [
      'sale_items',
      'sales',
      'purchase_order_items',
      'purchase_orders',
      'stock_movements',
      'stocks',
      'products',
      'notifications',
      'campaigns',
      'locations',
      'warehouses',
      'customers',
      'suppliers',
      'units',
      'categories'
    ];

    for (const table of tablesToTruncate) {
      try {
        await sequelize.query(`TRUNCATE TABLE ${table}`);
        console.log(`✅ ${table} tablosu temizlendi`);
      } catch (err) {
        console.warn(`⚠️ ${table} tablosu temizlenemedi:`, err.message);
      }
    }

    // Kullanıcıları temizle ama admin hariç
    await sequelize.query(`DELETE FROM users WHERE role != 'admin'`);
    console.log('✅ Admin dışındaki kullanıcılar silindi');

    // Admin kullanıcısını fabrika ayarlarına sıfırla
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await sequelize.query(`
      UPDATE users 
      SET 
        username = 'admin',
        email = 'admin@stok.com',
        password = ?,
        first_name = 'Admin',
        last_name = 'User',
        phone = NULL,
        avatar = NULL,
        language = 'tr',
        theme = 'light',
        last_login = NULL
      WHERE role = 'admin'
    `, {
      replacements: [hashedPassword]
    });
    console.log('✅ Admin kullanıcısı fabrika ayarlarına sıfırlandı');

    // Foreign key kontrollerini aç
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Varsayılan verileri oluştur
    await createDefaultData();

    console.log('✅ Veritabanı başarıyla sıfırlandı');

    res.json({
      success: true,
      message: 'Veritabanı başarıyla fabrika ayarlarına sıfırlandı. Lütfen yeniden giriş yapın.',
      data: {
        defaultCredentials: {
          email: 'admin@stok.com',
          password: 'admin123'
        }
      }
    });

  } catch (error) {
    console.error('❌ Veritabanı sıfırlama hatası:', error);
    next(error);
  }
});

// Varsayılan verileri oluştur
async function createDefaultData() {
  const { Category, Unit, Warehouse } = require('../models');

  // Varsayılan kategoriler
  const defaultCategories = [
    { name: 'Elektronik', name_en: 'Electronics', description: 'Elektronik ürünler' },
    { name: 'Gıda', name_en: 'Food', description: 'Gıda ürünleri' },
    { name: 'Giyim', name_en: 'Clothing', description: 'Giyim ürünleri' }
  ];

  for (const cat of defaultCategories) {
    await Category.create(cat);
  }
  console.log('✅ Varsayılan kategoriler oluşturuldu');

  // Varsayılan birimler
  const defaultUnits = [
    { name: 'Adet', abbreviation: 'AD', name_en: 'Piece' },
    { name: 'Kilogram', abbreviation: 'KG', name_en: 'Kilogram' },
    { name: 'Litre', abbreviation: 'LT', name_en: 'Liter' },
    { name: 'Metre', abbreviation: 'MT', name_en: 'Meter' }
  ];

  for (const unit of defaultUnits) {
    await Unit.create(unit);
  }
  console.log('✅ Varsayılan birimler oluşturuldu');

  // Varsayılan depo
  await Warehouse.create({
    name: 'Ana Depo',
    code: 'ANA-001',
    address: 'Merkez Depo',
    is_active: true
  });
  console.log('✅ Varsayılan depo oluşturuldu');
}

module.exports = router;


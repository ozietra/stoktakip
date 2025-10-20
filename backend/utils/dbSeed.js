const { User, Category, Unit, Warehouse, Product, Stock } = require('../models');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    console.log('🌱 Seed verisi ekleniyor...');

    // Create admin user
    const adminExists = await User.findOne({ where: { email: 'admin@stok.com' } });
    
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@stok.com',
        password: 'admin123',
        first_name: 'Admin',
        last_name: 'User',
        phone: '0555 555 5555',
        role: 'admin',
        is_active: true
      });
      console.log('✅ Admin kullanıcısı oluşturuldu (admin@stok.com / admin123)');
    }

    // Create sample categories
    const categories = [
      { name: 'Elektronik', name_en: 'Electronics', icon: 'laptop', color: '#3B82F6' },
      { name: 'Giyim', name_en: 'Clothing', icon: 'shirt', color: '#10B981' },
      { name: 'Gıda', name_en: 'Food', icon: 'apple', color: '#F59E0B' },
      { name: 'Ev & Yaşam', name_en: 'Home & Living', icon: 'home', color: '#8B5CF6' },
      { name: 'Kitap & Kırtasiye', name_en: 'Books & Stationery', icon: 'book', color: '#EC4899' }
    ];

    for (const cat of categories) {
      await Category.findOrCreate({ where: { name: cat.name }, defaults: cat });
    }
    console.log('✅ Kategoriler oluşturuldu');

    // Create units
    const units = [
      { name: 'Adet', name_en: 'Piece', abbreviation: 'AD', type: 'quantity' },
      { name: 'Kilogram', name_en: 'Kilogram', abbreviation: 'KG', type: 'weight' },
      { name: 'Litre', name_en: 'Liter', abbreviation: 'LT', type: 'volume' },
      { name: 'Metre', name_en: 'Meter', abbreviation: 'M', type: 'length' },
      { name: 'Paket', name_en: 'Package', abbreviation: 'PKT', type: 'quantity' },
      { name: 'Kutu', name_en: 'Box', abbreviation: 'KT', type: 'quantity' }
    ];

    for (const unit of units) {
      await Unit.findOrCreate({ where: { name: unit.name }, defaults: unit });
    }
    console.log('✅ Birimler oluşturuldu');

    // Create warehouses
    const warehouses = [
      {
        name: 'Ana Depo',
        code: 'ANA-001',
        description: 'Merkez ana depo',
        address: 'Merkez Mah. Ana Cad. No:1',
        city: 'İstanbul',
        country: 'Türkiye',
        phone: '0212 555 0001',
        is_main: true,
        is_active: true
      },
      {
        name: 'İkinci Depo',
        code: 'IKI-001',
        description: 'Yedek depo',
        address: 'İkinci Mah. Yan Cad. No:10',
        city: 'Ankara',
        country: 'Türkiye',
        phone: '0312 555 0001',
        is_main: false,
        is_active: true
      }
    ];

    for (const warehouse of warehouses) {
      await Warehouse.findOrCreate({ where: { code: warehouse.code }, defaults: warehouse });
    }
    console.log('✅ Depolar oluşturuldu');

    console.log('✅ Seed işlemi tamamlandı!');
    console.log('\n📌 Giriş Bilgileri:');
    console.log('   Email: admin@stok.com');
    console.log('   Şifre: admin123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed hatası:', error);
    process.exit(1);
  }
};

seed();


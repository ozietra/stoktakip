const { sequelize } = require('../config/database');
const models = require('../models');

const migrate = async () => {
  try {
    console.log('🔄 Veritabanı migration başlıyor...');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Veritabanı bağlantısı başarılı');

    // Sync all models
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Tüm tablolar oluşturuldu/güncellendi');

    console.log('✅ Migration tamamlandı!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration hatası:', error);
    process.exit(1);
  }
};

migrate();


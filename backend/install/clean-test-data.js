const { sequelize } = require('../config/database');

async function cleanTestData() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  🧹 TEST VERİLERİNİ TEMİZLE');
  console.log('════════════════════════════════════════════════════════\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Veritabanına bağlanıldı\n');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      readline.question('⚠️  TÜM TEST VERİLERİ SİLİNECEK! Devam etmek istiyor musunuz? (evet/hayır): ', resolve);
    });
    readline.close();

    if (answer.toLowerCase() !== 'evet') {
      console.log('\n❌ İşlem iptal edildi.');
      process.exit(0);
    }

    console.log('\n🗑️  Veriler siliniyor...\n');

    // Sıralı silme (foreign key hatalarını önlemek için)
    const models = [
      'SaleItem',
      'PurchaseOrderItem', 
      'StockMovement',
      'Stock',
      'Sale',
      'PurchaseOrder',
      'Invoice',
      'Campaign',
      'Notification',
      'Product',
      'Customer',
      'Supplier',
      'Location',
      'Warehouse',
      'Category',
      'Unit'
    ];

    for (const model of models) {
      try {
        const result = await sequelize.query(`DELETE FROM ${model.toLowerCase()}s WHERE 1=1`);
        console.log(`✅ ${model} - ${result[0].affectedRows || 0} kayıt silindi`);
      } catch (error) {
        // Tablo yoksa devam et
        if (!error.message.includes("doesn't exist")) {
          console.log(`⚠️  ${model} temizlenirken hata: ${error.message}`);
        }
      }
    }

    // Admin dışındaki kullanıcıları sil
    const { User } = require('../models');
    const deleted = await User.destroy({
      where: {
        role: ['staff', 'manager']
      }
    });
    console.log(`✅ User - ${deleted} test kullanıcısı silindi (Admin korundu)`);

    console.log('\n════════════════════════════════════════════════════════');
    console.log('  ✅ TEMİZLEME TAMAMLANDI!');
    console.log('════════════════════════════════════════════════════════\n');
    console.log('💡 Şimdi varsayılan verileri yüklemek için:');
    console.log('   node install/setup-database.js\n');

  } catch (error) {
    console.error('\n❌ HATA:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  cleanTestData();
}

module.exports = { cleanTestData };


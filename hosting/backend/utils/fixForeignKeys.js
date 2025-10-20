const { sequelize } = require('../config/database');

const fixForeignKeys = async () => {
  try {
    console.log('Foreign key constraint\'leri düzeltiliyor...');
    
    // Sales tablosundaki customer_id constraint'ini kaldır ve yeniden ekle
    await sequelize.query(`
      ALTER TABLE sales 
      DROP FOREIGN KEY sales_ibfk_1
    `);
    
    await sequelize.query(`
      ALTER TABLE sales
      ADD CONSTRAINT sales_ibfk_1 
      FOREIGN KEY (customer_id) 
      REFERENCES customers(id) 
      ON DELETE SET NULL 
      ON UPDATE CASCADE
    `);
    
    console.log('✅ Sales tablosu foreign key düzeltildi');
    
    // Purchase orders için de kontrol
    await sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'purchase_orders' 
      AND COLUMN_NAME = 'supplier_id' 
      AND TABLE_SCHEMA = DATABASE()
    `).then(async ([results]) => {
      if (results.length > 0) {
        const constraintName = results[0].CONSTRAINT_NAME;
        await sequelize.query(`ALTER TABLE purchase_orders DROP FOREIGN KEY ${constraintName}`);
        await sequelize.query(`
          ALTER TABLE purchase_orders
          ADD CONSTRAINT purchase_orders_supplier_fk 
          FOREIGN KEY (supplier_id) 
          REFERENCES suppliers(id) 
          ON DELETE RESTRICT 
          ON UPDATE CASCADE
        `);
        console.log('✅ Purchase orders supplier foreign key düzeltildi');
      }
    });
    
    console.log('\n✅ Tüm foreign key constraint\'leri başarıyla düzeltildi!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
};

fixForeignKeys();


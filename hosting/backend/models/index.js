const { sequelize, dbDialect } = require('../config/database');
const Sequelize = require('sequelize');

// Modelleri içe aktar
const User = require('./User');
const Category = require('./Category');
const Unit = require('./Unit');
const Warehouse = require('./Warehouse');
const Location = require('./Location');
const Product = require('./Product');
const Stock = require('./Stock');
const StockMovement = require('./StockMovement');
const Supplier = require('./Supplier');
const Customer = require('./Customer');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderItem = require('./PurchaseOrderItem');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const Campaign = require('./Campaign');
const Notification = require('./Notification');

const db = {
  User,
  Category,
  Unit,
  Warehouse,
  Location,
  Product,
  Stock,
  StockMovement,
  Supplier,
  Customer,
  PurchaseOrder,
  PurchaseOrderItem,
  Sale,
  SaleItem,
  Campaign,
  Notification,
  sequelize,
  Sequelize
};

// İlişkilendirmeleri kur
const setupAssociations = () => {
  try {
    console.log('🔗 Model ilişkilendirmeleri kuruluyor...');

    // Product relationships
    Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
    Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

    Product.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });
    Unit.hasMany(Product, { foreignKey: 'unit_id', as: 'products' });

    Product.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
    User.hasMany(Product, { foreignKey: 'created_by', as: 'createdProducts' });

    // Location relationships
    Location.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });
    Warehouse.hasMany(Location, { foreignKey: 'warehouse_id', as: 'locations' });

    // Stock relationships
    Stock.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
    Product.hasMany(Stock, { foreignKey: 'product_id', as: 'stocks' });

    Stock.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });
    Warehouse.hasMany(Stock, { foreignKey: 'warehouse_id', as: 'stocks' });

    Stock.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });
    Location.hasMany(Stock, { foreignKey: 'location_id', as: 'stocks' });

    // StockMovement relationships
    StockMovement.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
    Product.hasMany(StockMovement, { foreignKey: 'product_id', as: 'movements' });

    StockMovement.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });
    Warehouse.hasMany(StockMovement, { foreignKey: 'warehouse_id', as: 'movements' });

    StockMovement.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });
    Location.hasMany(StockMovement, { foreignKey: 'location_id', as: 'movements' });

    StockMovement.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
    User.hasMany(StockMovement, { foreignKey: 'created_by', as: 'stockMovements' });

    StockMovement.belongsTo(Warehouse, { foreignKey: 'from_warehouse_id', as: 'fromWarehouse' });
    StockMovement.belongsTo(Warehouse, { foreignKey: 'to_warehouse_id', as: 'toWarehouse' });

    // PurchaseOrder relationships
    PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
    Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplier_id', as: 'purchaseOrders' });

    PurchaseOrder.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });
    Warehouse.hasMany(PurchaseOrder, { foreignKey: 'warehouse_id', as: 'purchaseOrders' });

    PurchaseOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
    User.hasMany(PurchaseOrder, { foreignKey: 'created_by', as: 'createdPurchaseOrders' });

    PurchaseOrder.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });
    User.hasMany(PurchaseOrder, { foreignKey: 'approved_by', as: 'approvedPurchaseOrders' });

    PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchase_order_id', as: 'items' });
    PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });

    PurchaseOrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
    Product.hasMany(PurchaseOrderItem, { foreignKey: 'product_id', as: 'purchaseOrderItems' });

    // Sale relationships
    Sale.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
    Customer.hasMany(Sale, { foreignKey: 'customer_id', as: 'sales' });

    Sale.belongsTo(Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse' });
    Warehouse.hasMany(Sale, { foreignKey: 'warehouse_id', as: 'sales' });

    Sale.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
    User.hasMany(Sale, { foreignKey: 'created_by', as: 'createdSales' });

    Sale.belongsTo(Campaign, { foreignKey: 'campaign_id', as: 'campaign' });
    Campaign.hasMany(Sale, { foreignKey: 'campaign_id', as: 'sales' });

    Sale.hasMany(SaleItem, { foreignKey: 'sale_id', as: 'items' });
    SaleItem.belongsTo(Sale, { foreignKey: 'sale_id', as: 'sale' });

    SaleItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
    Product.hasMany(SaleItem, { foreignKey: 'product_id', as: 'saleItems' });

    // Campaign relationships
    Campaign.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
    User.hasMany(Campaign, { foreignKey: 'created_by', as: 'campaigns' });

    // Notification relationships
    Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

    console.log('✅ Model ilişkilendirmeleri kuruldu');
  } catch (error) {
    console.error('❌ Model ilişkilendirme hatası:', error);
    throw error;
  }
};

// Veritabanı senkronizasyon fonksiyonu
db.syncDatabase = async (options = {}) => {
  try {
    const { force = false, alter = true } = options;
    
    console.log('\n════════════════════════════════════════════════════════');
    console.log('🔄 VERİTABANI SENKRONİZASYONU BAŞLIYOR');
    console.log('════════════════════════════════════════════════════════');
    console.log(`📋 Mod: ${force ? 'FORCE (tablolar silinip yeniden oluşturulacak)' : alter ? 'ALTER (tablolar güncellenecek)' : 'NORMAL'}`);
    console.log(`📅 Zaman: ${new Date().toLocaleString('tr-TR')}`);
    
    // Foreign key kontrollerini geçici olarak kapat (sadece MySQL için)
    if (dbDialect === 'mysql') {
      console.log('\n🔓 Foreign key kontrolleri kapatılıyor...');
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      console.log('✅ Foreign key kontrolleri kapatıldı');
    } else {
      console.log('\n📝 SQLite modu - Foreign key ayarları varsayılan');
    }
    
    // Modelleri bağımlılık sırasına göre senkronize et
    const syncOrder = [
      'User',
      'Category',
      'Unit',
      'Warehouse',
      'Location',
      'Supplier',
      'Customer',
      'Campaign',
      'Product',
      'Stock',
      'StockMovement',
      'PurchaseOrder',
      'PurchaseOrderItem',
      'Sale',
      'SaleItem',
      'Notification'
    ];

    console.log(`\n📦 ${syncOrder.length} model senkronize edilecek...\n`);
    
    for (const modelName of syncOrder) {
      if (db[modelName]) {
        try {
          console.log(`  🔄 ${modelName} senkronize ediliyor...`);
          const startTime = Date.now();
          
          await db[modelName].sync({ alter, force });
          
          const duration = Date.now() - startTime;
          console.log(`  ✅ ${modelName} senkronize edildi (${duration}ms)`);
        } catch (syncError) {
          console.error(`  ❌ ${modelName} senkronizasyon hatası:`, syncError.message);
          console.error(`  🔍 Hata kodu: ${syncError.code || 'N/A'}`);
          console.error(`  📝 SQL: ${syncError.sql || 'N/A'}`);
          // Devam et, critical olmayabilir
        }
      } else {
        console.warn(`  ⚠️ ${modelName} modeli bulunamadı!`);
      }
    }
    
    // Foreign key kontrollerini tekrar aç (sadece MySQL için)
    if (dbDialect === 'mysql') {
      console.log('\n🔒 Foreign key kontrolleri açılıyor...');
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('✅ Foreign key kontrolleri açıldı');
    }
    
    console.log('\n════════════════════════════════════════════════════════');
    console.log('✅ VERİTABANI SENKRONİZASYONU TAMAMLANDI');
    console.log('════════════════════════════════════════════════════════\n');
    return true;
  } catch (error) {
    console.error('\n❌❌❌ VERİTABANI SENKRONİZASYON HATASI ❌❌❌');
    console.error('Hata mesajı:', error.message);
    console.error('Hata stack:', error.stack);
    
    // Foreign key kontrollerini tekrar aç (hata durumunda, sadece MySQL için)
    if (dbDialect === 'mysql') {
      try {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      } catch (e) {
        console.error('Foreign key kontrolleri açılamadı:', e.message);
      }
    }
    throw error;
  }
};

// İlişkilendirmeleri hemen kur
setupAssociations();

module.exports = db;

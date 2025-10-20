// Sistemdeki kullanıcıları listeler
const { sequelize } = require('../config/database');

const listUsers = async () => {
  try {
    console.log('\n👥 Sistemdeki Kullanıcılar\n');
    console.log('─'.repeat(80));

    await sequelize.authenticate();
    
    const [users] = await sequelize.query(
      'SELECT id, email, first_name, last_name, role, is_active FROM users ORDER BY id'
    );

    if (users.length === 0) {
      console.log('❌ Sistemde kayıtlı kullanıcı bulunamadı!');
      process.exit(1);
    }

    console.log(`\nToplam ${users.length} kullanıcı bulundu:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Durum: ${user.is_active ? '✅ Aktif' : '❌ Pasif'}`);
      console.log('');
    });

    console.log('─'.repeat(80));
    console.log('\n💡 Şifre sıfırlamak için: node utils/quickResetPassword.js <email>\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Hata oluştu:', error.message);
    process.exit(1);
  }
};

listUsers();


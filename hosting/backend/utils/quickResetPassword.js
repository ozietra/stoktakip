// Hızlı şifre sıfırlama (komut satırından email ve şifre alır)
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const quickResetPassword = async () => {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3] || 'admin123'; // Varsayılan şifre

    if (!email) {
      console.log('\n❌ Kullanım: node utils/quickResetPassword.js <email> [yeni-şifre]');
      console.log('\nÖrnek:');
      console.log('  node utils/quickResetPassword.js admin@stok.com yenisifre123');
      console.log('  node utils/quickResetPassword.js admin@stok.com (varsayılan: admin123)\n');
      process.exit(1);
    }

    console.log('\n🔐 Şifre Sıfırlanıyor...\n');

    await sequelize.authenticate();

    // Kullanıcıyı bul
    const [users] = await sequelize.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE email = ?',
      { replacements: [email] }
    );

    if (users.length === 0) {
      console.log(`❌ "${email}" adresiyle kayıtlı kullanıcı bulunamadı!`);
      console.log('\n💡 Mevcut kullanıcıları görmek için: node utils/listUsers.js\n');
      process.exit(1);
    }

    const user = users[0];
    console.log('✅ Kullanıcı bulundu:');
    console.log(`   Ad Soyad: ${user.first_name} ${user.last_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol: ${user.role}\n`);

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Veritabanında güncelle
    await sequelize.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      { replacements: [hashedPassword, user.id] }
    );

    console.log('✅ Şifre başarıyla sıfırlandı!\n');
    console.log('📝 YENİ GİRİŞ BİLGİLERİNİZ:');
    console.log('─'.repeat(50));
    console.log(`   Email: ${user.email}`);
    console.log(`   Şifre: ${newPassword}`);
    console.log('─'.repeat(50));
    console.log('\n💡 Bu bilgileri güvenli bir yerde saklayın!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Hata oluştu:', error.message);
    process.exit(1);
  }
};

quickResetPassword();


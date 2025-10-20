// Kullanıcı şifresini sıfırlamak için kullanılır
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const resetPassword = async () => {
  try {
    console.log('\n🔐 Kullanıcı Şifre Sıfırlama Aracı\n');
    console.log('─'.repeat(50));

    // Veritabanı bağlantısını test et
    await sequelize.authenticate();
    console.log('✅ Veritabanı bağlantısı başarılı!\n');

    // Email al
    const email = await question('Kullanıcı Email: ');
    
    if (!email) {
      console.log('❌ Email adresi gerekli!');
      rl.close();
      process.exit(1);
    }

    // Kullanıcıyı bul
    const [users] = await sequelize.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE email = ?',
      { replacements: [email] }
    );

    if (users.length === 0) {
      console.log('❌ Bu email adresiyle kayıtlı kullanıcı bulunamadı!');
      rl.close();
      process.exit(1);
    }

    const user = users[0];
    console.log('\n✅ Kullanıcı bulundu:');
    console.log(`   Ad Soyad: ${user.first_name} ${user.last_name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol: ${user.role}\n`);

    // Yeni şifre al
    const newPassword = await question('Yeni Şifre (en az 6 karakter): ');
    
    if (!newPassword || newPassword.length < 6) {
      console.log('❌ Şifre en az 6 karakter olmalı!');
      rl.close();
      process.exit(1);
    }

    const confirmPassword = await question('Yeni Şifre (Tekrar): ');

    if (newPassword !== confirmPassword) {
      console.log('❌ Şifreler eşleşmiyor!');
      rl.close();
      process.exit(1);
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Veritabanında güncelle
    await sequelize.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      { replacements: [hashedPassword, user.id] }
    );

    console.log('\n✅ Şifre başarıyla sıfırlandı!');
    console.log('\n📝 Giriş Bilgileriniz:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Şifre: ${newPassword}`);
    console.log('\n💡 Bu bilgileri güvenli bir yerde saklayın!\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Hata oluştu:', error.message);
    rl.close();
    process.exit(1);
  }
};

// Script'i çalıştır
resetPassword();


const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function fixAdminPassword() {
  try {
    console.log('🔧 Admin şifresi düzeltiliyor...\n');

    // Admin kullanıcısını bul
    const admin = await User.findOne({ where: { email: 'admin@stok.com' } });

    if (!admin) {
      console.log('❌ Admin kullanıcısı bulunamadı!');
      process.exit(1);
    }

    // Yeni şifre hash'i oluştur
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log('📝 Yeni hash oluşturuldu:', hashedPassword.substring(0, 20) + '...\n');

    // Şifreyi güncelle (direkt SQL ile, hook'ları atla)
    await admin.update({ password: hashedPassword }, { hooks: false });

    // Test et
    const testAdmin = await User.findOne({ where: { email: 'admin@stok.com' } });
    const isValid = await bcrypt.compare(newPassword, testAdmin.password);

    console.log('✅ Şifre güncellendi!');
    console.log('✅ Test:', isValid ? 'BAŞARILI' : 'BAŞARISIZ');
    console.log('\n📝 Giriş Bilgileri:');
    console.log('   Email: admin@stok.com');
    console.log('   Şifre: admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

fixAdminPassword();


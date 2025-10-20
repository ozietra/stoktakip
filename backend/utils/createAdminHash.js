// Admin şifresi hash'i oluşturmak için kullanılır
const bcrypt = require('bcryptjs');

const password = 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Hata:', err);
    return;
  }
  console.log('Şifre:', password);
  console.log('Hash:', hash);
  console.log('\nDatabase.sql\'de kullanmak için:');
  console.log(`'${hash}'`);
});


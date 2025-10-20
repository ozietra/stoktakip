# 📦 Stok Yönetim Sistemi - Web Kurulum Kılavuzu

## 🚀 Otomatik Kurulum (Önerilen)

### Adım 1: Dosyaları Sunucuya Yükleyin

Tüm proje dosyalarını web sunucunuzun root dizinine yükleyin (örn: `/public_html`, `/www`, vb.)

### Adım 2: Gereksinimleri Kontrol Edin

Sunucunuzda şunların kurulu olduğundan emin olun:

- **PHP >= 7.4**
- **Node.js >= 14.x**
- **NPM >= 6.x**
- **MySQL >= 5.7** veya **MariaDB >= 10.2**
- **PHP Extensions:**
  - PDO
  - PDO MySQL
  - JSON
  - Mbstring
  - cURL
  - OpenSSL

### Adım 3: Otomatik Kurulumu Başlatın

Tarayıcınızda şu adresi açın:

```
http://yourdomain.com/install.php
```

### Adım 4: Kurulum Sihirbazını Takip Edin

Kurulum sihirbazı sizi 4 adımda yönlendirecek:

1. **Sistem Gereksinimleri Kontrolü**
   - Otomatik olarak sunucu gereksinimlerini kontrol eder
   - Tüm gereksinimler yeşil olmalı

2. **Veritabanı Yapılandırması**
   - MySQL bağlantı bilgilerinizi girin
   - Sistem otomatik olarak:
     - Veritabanını oluşturur
     - Tabloları kurar
     - `.env` dosyasını yapılandırır

3. **Yönetici Hesabı**
   - Admin kullanıcı bilgilerinizi girin
   - Bu bilgileri güvenli bir yerde saklayın!

4. **Tamamlandı & Backend Başlat**
   - "Backend'i Başlat" butonuna tıklayın
   - Sistem otomatik olarak PM2 ile backend'i başlatacak
   - Backend başarıyla başladığında "Giriş Sayfasına Git" butonu görünecek

### Adım 5: Uygulamayı Kullanın

Kurulum tamamlandığında:

1. Ana sayfaya gidin: `http://yourdomain.com`
2. Kurulum sırasında oluşturduğunuz admin bilgileriyle giriş yapın
3. Sistemi kullanmaya başlayın!

---

## 🔧 Manuel Kurulum (SSH Erişimi Gerekli)

### 1. Dosyaları Yükleyin

```bash
cd /var/www/html
# veya sunucunuzun root dizini
```

### 2. Backend Bağımlılıklarını Kurun

```bash
cd backend
npm install --production
```

### 3. Veritabanını Oluşturun

MySQL'e bağlanın ve veritabanını oluşturun:

```sql
CREATE DATABASE stok_yonetim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Tabloları oluşturun:

```bash
mysql -u root -p stok_yonetim < database.sql
```

### 4. .env Dosyasını Yapılandırın

`backend/.env` dosyasını oluşturun:

```env
NODE_ENV=production
PORT=5001

DB_HOST=localhost
DB_PORT=3306
DB_NAME=stok_yonetim
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_random_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

FRONTEND_URL=http://yourdomain.com
```

### 5. Backend'i PM2 ile Başlatın

```bash
cd backend

# PM2 kurulu değilse global olarak kurun
npm install -g pm2

# Backend'i başlatın
pm2 start ecosystem.config.js

# PM2'yi kaydedin (sunucu yeniden başladığında otomatik başlasın)
pm2 save
pm2 startup
```

### 6. Admin Kullanıcısı Oluşturun

```bash
cd backend
node -e "
const bcrypt = require('bcryptjs');
const password = bcrypt.hashSync('admin123', 10);
console.log('Hashed password:', password);
"
```

MySQL'e girin ve admin kullanıcısını ekleyin:

```sql
INSERT INTO users (username, email, password, first_name, last_name, role, is_active, createdAt, updatedAt)
VALUES ('admin', 'admin@example.com', 'HASHED_PASSWORD_HERE', 'Admin', 'User', 'admin', 1, NOW(), NOW());
```

---

## 🔐 Güvenlik

### Kurulum Sonrası Yapılması Gerekenler:

1. **install.php dosyasını silin:**
   ```bash
   rm install.php
   ```

2. **start-backend.php dosyasını silin (opsiyonel):**
   ```bash
   rm start-backend.php
   ```

3. **Dosya izinlerini kontrol edin:**
   ```bash
   chmod 755 backend
   chmod 644 backend/.env
   chmod 755 backend/uploads
   ```

4. **Firewall yapılandırması:**
   - Port 5001'i harici erişime kapatın (sadece localhost)
   - Sadece port 80/443'ü açık bırakın

---

## 📊 PM2 Komutları

Backend'i yönetmek için yararlı PM2 komutları:

```bash
# Backend durumunu kontrol et
pm2 status

# Backend loglarını görüntüle
pm2 logs stok-yonetim-backend

# Backend'i yeniden başlat
pm2 restart stok-yonetim-backend

# Backend'i durdur
pm2 stop stok-yonetim-backend

# Backend'i kaldır
pm2 delete stok-yonetim-backend

# PM2 process listesini kaydet
pm2 save
```

---

## 🐛 Sorun Giderme

### Backend Başlamıyor

1. Logları kontrol edin:
   ```bash
   pm2 logs stok-yonetim-backend
   ```

2. Manuel başlatmayı deneyin:
   ```bash
   cd backend
   node server.js
   ```

3. Port kontrolü:
   ```bash
   netstat -tlnp | grep 5001
   ```

### Veritabanı Bağlantı Hatası

1. MySQL'in çalıştığını kontrol edin:
   ```bash
   systemctl status mysql
   ```

2. .env dosyasındaki bilgileri kontrol edin

3. MySQL kullanıcı izinlerini kontrol edin:
   ```sql
   GRANT ALL PRIVILEGES ON stok_yonetim.* TO 'user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### PM2 Kurulu Değil

Global olarak kurun:
```bash
npm install -g pm2
```

Eğer izin hatası alırsanız (Linux/Mac):
```bash
sudo npm install -g pm2
```

---

## 📞 Destek

Sorun yaşıyorsanız:

1. Backend loglarını kontrol edin: `pm2 logs`
2. Browser console'u kontrol edin (F12)
3. `backend/logs/` dizinindeki log dosyalarını inceleyin

---

## 🎉 Kurulum Tamamlandı!

Artık Stok Yönetim Sistemi kullanıma hazır!

**Varsayılan Giriş Bilgileri:**
- **Kullanıcı Adı:** Kurulum sırasında belirlediğiniz
- **Şifre:** Kurulum sırasında belirlediğiniz

İyi kullanımlar! 🚀

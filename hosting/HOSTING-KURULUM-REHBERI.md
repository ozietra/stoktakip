# 🚀 Stok Yönetim Sistemi - Hosting Kurulum Rehberi

## 📋 Genel Bakış

Bu rehber, Stok Yönetim Sistemi'ni hosting sağlayıcınızda nasıl kuracağınızı adım adım açıklar.

### ✨ Özellikler:
- ✅ **SQLite Veritabanı** - MySQL kurulumu gerekmez
- ✅ **Otomatik Kurulum** - Tek tıkla kurulum
- ✅ **Demo Kullanıcı** - Hazır giriş bilgileri
- ✅ **Node.js Backend** - Modern teknoloji
- ✅ **Responsive Tasarım** - Mobil uyumlu

## 🔧 Hosting Gereksinimleri

### Minimum Gereksinimler:
- **PHP**: 7.4 veya üzeri
- **Node.js**: 14.0 veya üzeri
- **NPM**: Package manager
- **SQLite**: PDO SQLite desteği
- **Disk Alanı**: 100 MB
- **RAM**: 512 MB (önerilen: 1 GB)

### Desteklenen Hosting Türleri:
- ✅ **VPS/Cloud Server** (önerilen)
- ✅ **Shared Hosting** (Node.js destekli)
- ❌ **Sadece PHP Hosting** (Node.js gerekli)

## 📁 Kurulum Adımları

### 1. Dosyaları Yükleyin
1. **hosting** klasöründeki tüm dosyaları hosting'inizin ana dizinine yükleyin
2. Dosya yapısı şu şekilde olmalı:
   ```
   public_html/
   ├── install.php
   ├── install-backend.php
   ├── start-backend.php
   ├── database.sqlite
   ├── index.html
   └── backend/
       ├── server.js
       ├── package.json
       └── ...
   ```

### 2. Kurulum Sihirbazını Çalıştırın
1. Web tarayıcınızda `https://yourdomain.com/install.php` adresine gidin
2. **Sistem Gereksinimleri** kontrol edilecek
3. **Kuruluma Başla** butonuna tıklayın
4. **Otomatik kurulum** tamamlanacak
5. **Backend'i Başlat** butonuna tıklayın

### 3. Sistemi Kullanmaya Başlayın
- **Giriş Sayfası**: `https://yourdomain.com`
- **Demo Kullanıcı**: 
  - **E-posta**: admin@stok.com
  - **Şifre**: admin123

## 🔑 Demo Giriş Bilgileri

Sistem kurulduktan sonra aşağıdaki demo hesabı ile giriş yapabilirsiniz:

```
E-posta: admin@stok.com
Şifre: admin123
```

⚠️ **Güvenlik**: İlk girişten sonra şifrenizi mutlaka değiştirin!

## 🛠️ Sorun Giderme

### Node.js Kurulu Değil
**Hata**: "Node.js kurulu değil"
**Çözüm**: 
1. Hosting sağlayıcınızdan Node.js kurulumu isteyin
2. Veya Node.js destekli hosting'e geçin

### PM2 Kurulum Hatası
**Hata**: "PM2 kurulumu başarısız"
**Çözüm**:
```bash
# SSH ile bağlanın ve manuel kurun:
npm install -g pm2
```

### Backend Başlamıyor
**Hata**: "Backend başlatma hatası"
**Çözüm**:
```bash
# Manuel başlatma:
cd backend
npm install
pm2 start ecosystem.config.js
```

### Port Sorunu
**Hata**: "Port 5001 kullanımda"
**Çözüm**:
```bash
# Çalışan process'leri kontrol edin:
pm2 list
pm2 delete all
```

## 📞 Hosting Sağlayıcı Önerileri

### VPS/Cloud (Önerilen):
- **DigitalOcean** - $5/ay
- **Linode** - $5/ay  
- **Vultr** - $3.50/ay
- **AWS Lightsail** - $3.50/ay

### Shared Hosting (Node.js Destekli):
- **A2 Hosting** - Node.js desteği
- **HostGator** - Node.js desteği
- **Bluehost** - Node.js desteği

## 🔒 Güvenlik Önerileri

### Kurulum Sonrası:
1. **install.php dosyasını silin**
2. **Admin şifresini değiştirin**
3. **SSL sertifikası kurun**
4. **Düzenli yedek alın**

### Dosya İzinleri:
```bash
chmod 755 backend/
chmod 644 backend/*.js
chmod 600 backend/.env
chmod 666 database.sqlite
```

## 📊 Performans Optimizasyonu

### PM2 Ayarları:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'stok-yonetim',
    script: 'server.js',
    instances: 1,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    }
  }]
}
```

### SQLite Optimizasyonu:
- Düzenli VACUUM çalıştırın
- Index'leri kontrol edin
- Büyük veriler için MySQL'e geçin

## 🔄 Güncelleme

### Yeni Versiyon Kurulumu:
1. Mevcut `database.sqlite` dosyasını yedekleyin
2. Yeni dosyaları yükleyin (database.sqlite hariç)
3. Backend'i yeniden başlatın:
   ```bash
   pm2 restart stok-yonetim
   ```

## 📋 Kontrol Listesi

Kurulum öncesi kontrol edin:

- [ ] Hosting Node.js destekliyor mu?
- [ ] PHP 7.4+ kurulu mu?
- [ ] SQLite PDO extension var mı?
- [ ] Yeterli disk alanı var mı? (100MB+)
- [ ] SSH erişimi var mı? (önerilen)

## 🆘 Destek

### Sorun yaşıyorsanız:
1. **Hata loglarını** kontrol edin: `backend/logs/`
2. **PM2 loglarını** kontrol edin: `pm2 logs`
3. **PHP error loglarını** kontrol edin
4. **Hosting sağlayıcı desteği** ile iletişime geçin

### Yaygın Hatalar:
- **500 Internal Server Error**: PHP hataları, dosya izinleri
- **502 Bad Gateway**: Backend çalışmıyor
- **Connection Refused**: Port sorunu
- **Database Locked**: SQLite dosya izinleri

## 🎉 Başarılı Kurulum

Kurulum başarılı olduğunda:
- ✅ Ana sayfa açılıyor
- ✅ Demo kullanıcı ile giriş yapılabiliyor
- ✅ Tüm menüler çalışıyor
- ✅ Ürün ekleme/düzenleme çalışıyor

**Tebrikler! Stok Yönetim Sistemi başarıyla kuruldu! 🎊**

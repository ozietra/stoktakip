# Stok Yönetim Sistemi - Hosting Kurulum Kılavuzu

Bu klasördeki dosyalar web hostinge yüklenmek üzere hazırlanmıştır.

## 📦 Hosting Gereksinimleri

- **PHP**: 7.4 veya üzeri
- **Node.js**: 18.x veya üzeri
- **MySQL**: 5.7 veya üzeri
- **PHP Extensions**:
  - PDO
  - PDO MySQL
  - JSON
  - Mbstring
  - cURL
  - OpenSSL

## 🚀 Kurulum Adımları

### 1. Dosyaları Yükleyin
Bu klasördeki **TÜM DOSYALARI** FTP/cPanel ile hostinginizin public_html (veya www) klasörüne yükleyin.

```
public_html/
├── install.php          ⭐ Kurulum dosyası
├── database.sql
├── start-backend.php
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── public/         (Frontend dosyaları)
│   └── uploads/
└── HOSTING-KURULUM.md
```

### 2. Otomatik Kurulumu Başlatın

Tarayıcınızda aşağıdaki adresi açın:
```
https://yourdomain.com/install.php
```

### 3. Kurulum Sihirbazını Takip Edin

#### Adım 1: Sistem Gereksinimleri
- Tüm gereksinimler otomatik kontrol edilir
- Yeşil ✓ işaretlerini gördükten sonra devam edin

#### Adım 2: Veritabanı Yapılandırması

**ÖNEMLİ:** Kurulum başlamadan ÖNCE cPanel/Hosting Panelinizden:
1. Yeni bir MySQL veritabanı oluşturun (Örn: `kullaniciadi_stokyonetim`)
2. Yeni bir MySQL kullanıcısı oluşturun (Örn: `kullaniciadi_stokuser`)
3. Kullanıcıya veritabanı üzerinde TÜM YETKİLER verin

Kurulum formunda aşağıdaki bilgileri girin:
- **MySQL Sunucu Adresi**: `localhost` (genellikle)
- **MySQL Port**: `3306` (varsayılan)
- **Veritabanı Adı**: Oluşturduğunuz veritabanı adı (Örn: `kullaniciadi_stokyonetim`)
- **Kullanıcı Adı**: Oluşturduğunuz MySQL kullanıcı adı (Örn: `kullaniciadi_stokuser`)
- **Şifre**: MySQL kullanıcısının şifresi

**Otomatik Yapılacaklar**:
- ✅ Veritabanına bağlanılır (zaten oluşturulmuş olmalı)
- ✅ Tablolar kurulur
- ✅ `.env` dosyası oluşturulur
- ✅ Güvenlik anahtarları otomatik üretilir

**NOT:** Çoğu hosting sağlayıcı (özellikle paylaşımlı hostingler) veritabanı oluşturma iznini kısıtlar. Bu nedenle veritabanını mutlaka hosting panelinizden manuel olarak oluşturun.

#### Adım 3: Admin Kullanıcısı Oluştur
- Kullanıcı adı, şifre ve e-posta bilgilerinizi girin
- Bu bilgileri güvenli bir yerde saklayın!

#### Adım 4: Backend'i Başlatın
- "Backend'i Başlat" butonuna tıklayın
- Backend otomatik olarak başlatılacak

### 4. Giriş Yapın
Kurulum tamamlandıktan sonra:
```
https://yourdomain.com
```
adresinden sisteme giriş yapabilirsiniz.

## 🔧 Manuel Backend Başlatma (Gerekirse)

Eğer otomatik başlatma çalışmazsa, SSH ile bağlanıp şu komutları çalıştırın:

```bash
cd backend
npm install --production
pm2 start ecosystem.config.js
# veya
node server.js
```

## ⚠️ Önemli Güvenlik Notları

### Kurulum Sonrası Yapılacaklar:

1. **install.php dosyasını silin** (güvenlik için):
   ```bash
   rm install.php
   ```

2. **Backend klasörüne .htaccess ekleyin** (Apache için):
   ```apache
   # backend/.htaccess
   Order Deny,Allow
   Deny from all
   ```

3. **.env dosyasını koruyun** (zaten korumalı olmalı):
   ```apache
   # .htaccess
   <Files ".env">
       Order allow,deny
       Deny from all
   </Files>
   ```

## 🌐 cPanel/Plesk Özel Ayarlar

### cPanel Node.js Uygulaması Kurulumu:

1. cPanel > Setup Node.js App
2. Node.js Sürümü: 18.x
3. Uygulama Kök Dizini: `/home/username/public_html/backend`
4. Uygulama URL'si: Ana domain
5. Başlangıç Dosyası: `server.js`
6. "Create" butonuna tıklayın

### Environment Variables (cPanel'de):
```
NODE_ENV=production
PORT=5001
```

## 📝 Port Yapılandırması

Bazı hosting sağlayıcıları özel port kullanımına izin vermez. Bu durumda:

1. Backend'in çalışacağı portu hosting sağlayıcınızdan öğrenin
2. `backend/.env` dosyasındaki `PORT` değerini güncelleyin
3. Backend'i yeniden başlatın

## 🔍 Sorun Giderme

### "Veritabanına bağlanılamıyor" Hatası:
- MySQL bilgilerini kontrol edin
- Veritabanı kullanıcısının ilgili veritabanına erişim izni olduğundan emin olun
- cPanel > MySQL Databases bölümünden kullanıcıyı veritabanına ekleyin

### "Backend başlatılamıyor" Hatası:
- SSH erişiminiz var mı kontrol edin
- Manuel başlatma komutlarını deneyin
- Hosting sağlayıcınızın Node.js desteği olduğundan emin olun

### "500 Internal Server Error":
- PHP error_log dosyasını kontrol edin
- Klasör izinlerini kontrol edin (755 olmalı)
- `.htaccess` dosyasını kontrol edin

## 📞 Destek

Kurulum ile ilgili sorun yaşıyorsanız:
1. Hosting sağlayıcınızın Node.js desteğini kontrol edin
2. Error loglarını inceleyin (cPanel > Error Logs)
3. PHP ve Node.js sürümlerini kontrol edin

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**NOT**: Bu klasörde `node_modules` klasörü YOK. Hosting'de `npm install` komutuyla otomatik yüklenecektir.

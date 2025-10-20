# 🎉 Stok Yönetim Sistemi - Hosting Paketi

## 📦 Bu Pakette Neler Var?

Bu hosting paketi, müşterilerinizin Stok Yönetim Sistemi'ni kendi hosting'lerinde kolayca kurabilmeleri için hazırlanmıştır.

### ✅ Hazır Dosyalar:
- ✅ **SQLite Veritabanı** (demo veriler dahil)
- ✅ **Otomatik Kurulum** (install.php)
- ✅ **Backend Başlatma** (start-backend.php)
- ✅ **Frontend Dosyları** (React build)
- ✅ **Detaylı Rehber** (HOSTING-KURULUM-REHBERI.md)

### 🔑 Demo Giriş Bilgileri:
```
E-posta: admin@stok.com
Şifre: admin123
```

## 🚀 Hızlı Kurulum (3 Adım)

### 1. Dosyaları Yükle
Bu klasördeki tüm dosyaları hosting'in ana dizinine yükleyin.

### 2. Kurulum Çalıştır
`https://yourdomain.com/install.php` adresine gidin ve kurulum sihirbazını takip edin.

### 3. Sistemi Kullan
`https://yourdomain.com` adresinden demo kullanıcı ile giriş yapın.

## 📁 Dosya Yapısı

```
hosting/
├── 📄 install.php              # Kurulum sihirbazı
├── 📄 install-backend.php      # Backend kurulum helper
├── 📄 start-backend.php        # Backend başlatma
├── 🗄️ database.sqlite          # SQLite veritabanı (demo veriler)
├── 📄 index.html               # Ana sayfa
├── 📄 manifest.json            # PWA manifest
├── 📁 static/                  # CSS/JS dosyaları
├── 📁 backend/                 # Node.js backend
│   ├── 📄 server.js            # Ana server dosyası
│   ├── 📄 package.json         # NPM dependencies
│   ├── 📄 ecosystem.config.js  # PM2 config
│   ├── 📁 config/              # Yapılandırma
│   ├── 📁 controllers/         # API controllers
│   ├── 📁 models/              # Database models
│   ├── 📁 routes/              # API routes
│   └── 📁 middleware/          # Express middleware
└── 📄 HOSTING-KURULUM-REHBERI.md # Detaylı rehber
```

## 🔧 Hosting Gereksinimleri

### Minimum:
- **PHP**: 7.4+
- **Node.js**: 14.0+
- **NPM**: Package manager
- **SQLite**: PDO desteği
- **Disk**: 100 MB
- **RAM**: 512 MB

### Önerilen Hosting Türleri:
- ✅ **VPS/Cloud Server** (en iyi)
- ✅ **Shared Hosting** (Node.js destekli)
- ❌ **Sadece PHP Hosting** (çalışmaz)

## 🎯 Müşteri Avantajları

### Kolay Kurulum:
- ❌ MySQL kurulumu gerekmez
- ❌ Karmaşık yapılandırma yok
- ✅ 3 adımda kurulum
- ✅ Demo veriler hazır

### Modern Teknoloji:
- ✅ **React Frontend** - Hızlı ve responsive
- ✅ **Node.js Backend** - Modern API
- ✅ **SQLite Database** - Hafif ve hızlı
- ✅ **PM2 Process Manager** - Stabil çalışma

### Tam Özellikli:
- ✅ Stok yönetimi
- ✅ Satış takibi
- ✅ Raporlama
- ✅ Kullanıcı yönetimi
- ✅ Mobil uyumlu

## 🛠️ Sorun Giderme

### Yaygın Sorunlar:

#### "Node.js kurulu değil"
**Çözüm**: Hosting sağlayıcıdan Node.js kurulumu isteyin

#### "Backend başlamıyor"
**Çözüm**: SSH ile bağlanıp manuel başlatın:
```bash
cd backend
npm install
pm2 start ecosystem.config.js
```

#### "Database hatası"
**Çözüm**: SQLite dosya izinlerini kontrol edin:
```bash
chmod 666 database.sqlite
```

## 📞 Hosting Önerileri

### VPS/Cloud (Önerilen):
- **DigitalOcean** - $5/ay
- **Linode** - $5/ay
- **Vultr** - $3.50/ay

### Shared Hosting:
- **A2 Hosting** - Node.js desteği
- **HostGator** - Node.js desteği

## 🔒 Güvenlik

### Kurulum Sonrası:
1. ⚠️ **install.php dosyasını silin**
2. 🔑 **Admin şifresini değiştirin**
3. 🔐 **SSL sertifikası kurun**
4. 💾 **Düzenli yedek alın**

## 📈 Performans

### Beklenen Performans:
- **Eşzamanlı Kullanıcı**: 10-50
- **Günlük İşlem**: 1000+
- **Response Time**: <200ms
- **Uptime**: %99.9

### Optimizasyon:
- PM2 cluster mode
- SQLite WAL mode
- Gzip compression
- Static file caching

## 🎊 Başarılı Kurulum Kontrolü

Kurulum başarılı ise:
- ✅ `https://yourdomain.com` açılıyor
- ✅ Demo kullanıcı ile giriş yapılabiliyor
- ✅ Dashboard görünüyor
- ✅ Ürün ekleme çalışıyor
- ✅ Raporlar açılıyor

## 📚 Ek Kaynaklar

- **Detaylı Rehber**: `HOSTING-KURULUM-REHBERI.md`
- **API Dokümantasyonu**: Backend'de swagger
- **Kullanıcı Kılavuzu**: Sistem içinde help bölümü

---

**🚀 Müşterileriniz için hazır, profesyonel stok yönetim sistemi!**

*Bu paket ile müşterileriniz dakikalar içinde kendi hosting'lerinde profesyonel bir stok yönetim sistemine sahip olabilirler.*

# 📦 Portable MySQL Kurulum Rehberi

## 🎯 Amaç

Electron uygulamasına paketlenebilir, sıfır konfigürasyon gerektiren MySQL kurulumu.

---

## 📥 İndirme

### MariaDB Portable (Yüklü)

1. **İndirme Linki:** https://downloads.mariadb.org/
2. **Versiyon:** MariaDB 11.8.3 ✅
3. **Platform:** Windows x64 ZIP
4. **Boyut:** ~150MB

### Not:
Proje şu anda **MariaDB 11.8.3** versiyonu ile yapılandırılmıştır.

---

## 🔧 Hazırlık

### 1. MariaDB'yi İndirin ve Çıkarın

```bash
# portable-mysql klasörüne çıkarın
stok/
├── portable-mysql/
│   ├── mariadb-11.8.3-winx64/
│   │   ├── bin/
│   │   ├── data/
│   │   ├── lib/
│   │   └── ...
```

### 2. Konfigürasyon Dosyası Oluşturun

`portable-mysql/my.ini` dosyası:

```ini
[mysqld]
# Port
port=3306

# Karakter seti
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# Data dizini (runtime'da ayarlanacak)
# datadir will be set by electron

# Performans
max_connections=100
innodb_buffer_pool_size=256M
innodb_log_file_size=64M

# Güvenlik
skip-grant-tables=0

# Log
log-error=mysql_error.log

[client]
port=3306
default-character-set=utf8mb4
```

### 3. İlk Kurulum Script'i

`portable-mysql/init.sql`:

```sql
-- Veritabanı oluştur
CREATE DATABASE IF NOT EXISTS stok_yonetim 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Root şifresini ayarla (opsiyonel, varsayılan şifresiz)
-- ALTER USER 'root'@'localhost' IDENTIFIED BY 'your-password';
```

---

## 🚀 Electron Entegrasyonu

Electron main.js'de MySQL'i şu şekilde başlatacağız:

1. Uygulama başlarken MySQL'i arka planda başlat
2. MySQL hazır olana kadar bekle
3. İlk açılışta veritabanını kur
4. Frontend'i başlat
5. Uygulama kapanırken MySQL'i düzgün kapat

---

## 📂 Dizin Yapısı (Production)

```
StokYonetim/
├── StokYonetim.exe
├── resources/
│   ├── app.asar (Frontend + Backend)
│   └── mysql/
│       ├── bin/
│       │   ├── mysqld.exe
│       │   └── mysql.exe
│       ├── data/ (runtime'da oluşur)
│       ├── my.ini
│       └── init.sql
└── data/ (user data - AppData/Roaming)
    └── mysql-data/
```

---

## ⚙️ Build Konfigürasyonu

`package.json` electron-builder ayarları:

```json
"build": {
  "extraResources": [
    {
      "from": "portable-mysql/mariadb-10.11.8-winx64",
      "to": "mysql",
      "filter": ["**/*"]
    }
  ],
  "files": [
    "!portable-mysql/mariadb-10.11.8-winx64/**/*"
  ]
}
```

---

## 🧪 Test Adımları

### Development Modda:

```bash
# 1. MySQL'i manuel başlat (WAMP veya local)
# 2. Backend'i başlat
cd backend
npm start

# 3. Frontend'i başlat
cd frontend
npm start

# 4. Electron'u başlat
npm run electron-dev
```

### Production Build:

```bash
# 1. Frontend build
cd frontend
npm run build

# 2. Electron build
npm run build:win

# 3. Test
dist/StokYonetim.exe
```

---

## 🔍 Sorun Giderme

### MySQL Başlamıyor:

1. Port 3306 kullanımda mı kontrol edin
2. Antivirus'ü devre dışı bırakın
3. Yönetici olarak çalıştırın

### Veritabanı Oluşmuyor:

1. `mysql-data` klasörü oluştu mu?
2. Log dosyalarını kontrol edin
3. Elle initialize edin:
   ```bash
   mysqld --initialize-insecure --datadir=./data
   ```

### Bağlantı Hatası:

1. MySQL başladı mı? (Task Manager)
2. Port doğru mu? (3306)
3. Host doğru mu? (localhost)

---

## 📊 Performans

- **İlk Başlatma:** ~15 saniye (MySQL initialize)
- **Sonraki Başlatmalar:** ~5 saniye
- **Bellek Kullanımı:** ~100-200MB (MySQL)
- **Disk Kullanımı:** ~200MB (boş veritabanı)

---

## ✅ Avantajlar

- ✅ Sıfır manuel konfigürasyon
- ✅ Tam MySQL performansı
- ✅ Güvenilir ve stabil
- ✅ Yedekleme kolay (data klasörü)
- ✅ Ağ desteği (opsiyonel)

---

## 📝 Notlar

1. İlk çalıştırmada MySQL initialize edilir (~10 saniye)
2. Veritabanı `AppData/Roaming/stok-yonetim-sistemi/mysql-data`'da
3. Yedekleme için sadece `mysql-data` klasörünü kopyalayın
4. Port değiştirmek isterseniz `my.ini` düzenleyin

---

**Hazır! Portable MySQL sisteminiz kurulmaya hazır! 🎉**


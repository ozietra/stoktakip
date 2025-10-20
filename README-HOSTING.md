# 📦 Stok Yönetim Sistemi - Web Hosting Paketi

Bu klasör, sisteminizi web hostinge (cPanel, Plesk, vb.) kurmak için gerekli tüm dosyaları içerir.

## 🚀 Hızlı Başlangıç

### 1️⃣ Veritabanını Hazırlayın
**ÖNEMLİ:** İlk önce cPanel/Plesk panelinden veritabanını oluşturun!

📖 **Detaylı Rehber:** [CPANEL-VERİTABANI-KURULUM.md](CPANEL-VERİTABANI-KURULUM.md)

Özetle:
- Yeni MySQL veritabanı oluşturun
- Yeni MySQL kullanıcısı oluşturun
- Kullanıcıya veritabanı üzerinde TÜM YETKİLER verin

### 2️⃣ Dosyaları Yükleyin
Bu klasördeki **TÜM DOSYALARI** FTP veya cPanel File Manager ile `public_html` klasörüne yükleyin.

### 3️⃣ Kurulum Sihirbazını Çalıştırın
Tarayıcınızda açın:
```
https://sitenizinadi.com/install.php
```

### 4️⃣ Adımları Takip Edin
- ✅ Sistem gereksinimleri kontrolü
- ✅ Veritabanı bilgilerini girin
- ✅ Admin kullanıcısı oluşturun
- ✅ Backend'i başlatın

### 5️⃣ Sisteme Giriş Yapın
```
https://sitenizinadi.com
```

---

## 📚 Dokümantasyon

- **[HOSTING-KURULUM.md](HOSTING-KURULUM.md)** - Detaylı kurulum kılavuzu
- **[CPANEL-VERİTABANI-KURULUM.md](CPANEL-VERİTABANI-KURULUM.md)** - cPanel veritabanı kurulum rehberi

---

## ⚠️ Önemli Notlar

### Veritabanı İsimlendirme
Hosting sağlayıcılar genellikle veritabanı ve kullanıcı adlarına prefix ekler:

Siz oluşturursunuz:
```
Veritabanı: stokyonetim
Kullanıcı: stokuser
```

Hosting oluşturur:
```
Veritabanı: kullaniciadi_stokyonetim
Kullanıcı: kullaniciadi_stokuser
```

### Güvenlik
Kurulum tamamlandıktan sonra:
1. ✅ `install.php` dosyasını silin
2. ✅ Güçlü şifreler kullanın
3. ✅ Düzenli yedek alın

---

## 🔧 Sistem Gereksinimleri

- **PHP:** 7.4 veya üzeri
- **Node.js:** 18.x veya üzeri
- **MySQL:** 5.7 veya üzeri
- **PHP Extensions:** PDO, PDO_MySQL, JSON, Mbstring, cURL, OpenSSL

---

## 🆘 Yardım

### Sık Karşılaşılan Sorunlar

**"Access Denied" Hatası:**
- Veritabanı kullanıcısına TÜM YETKİLER verildiğinden emin olun
- Kullanıcı adı ve şifrenin doğru olduğunu kontrol edin

**"Backend başlatılamıyor":**
- Hosting sağlayıcınızın Node.js desteği var mı kontrol edin
- cPanel > Setup Node.js App bölümüne bakın

**"Database does not exist":**
- Veritabanı adını TAM olarak yazın (prefix ile birlikte)
- Örnek: `rea340stinfo_stokyonetim`

### Destek

1. Dokümantasyonu okuyun
2. Hosting sağlayıcınızın desteğine başvurun
3. Error logları kontrol edin (cPanel > Error Logs)

---

## 📦 Paket İçeriği

```
hosting/
├── README.md                          ← Bu dosya
├── HOSTING-KURULUM.md                 ← Detaylı kurulum rehberi
├── CPANEL-VERİTABANI-KURULUM.md      ← Veritabanı kurulum rehberi
├── install.php                        ← Kurulum sihirbazı
├── database.sql                       ← Veritabanı şeması
├── start-backend.php                  ← Backend başlatma script'i
└── backend/                           ← Backend dosyaları
    ├── server.js
    ├── package.json
    ├── config/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    ├── utils/
    ├── public/                        ← Frontend dosyaları
    └── uploads/
```

---

## 📄 Lisans

MIT License - Ticari ve kişisel kullanım için uygundur.

---

## 🎉 İyi Çalışmalar!

Başarılı kurulum dileklerimizle...

**Stok Yönetim Sistemi Ekibi**

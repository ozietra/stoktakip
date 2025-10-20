# cPanel MySQL Veritabanı Kurulum Rehberi

Bu rehber, Stok Yönetim Sistemi için cPanel üzerinden MySQL veritabanı oluşturma adımlarını açıklar.

## 📋 Kurulum Öncesi Hazırlık

Kurulum sihirbazını (`install.php`) çalıştırmadan ÖNCE aşağıdaki adımları tamamlamalısınız.

---

## 🔧 Adım Adım Kurulum

### 1. cPanel'e Giriş Yapın

Hosting sağlayıcınızın size verdiği cPanel adresine gidin:
```
https://yourdomain.com:2083
veya
https://yourdomain.com/cpanel
```

Kullanıcı adı ve şifrenizle giriş yapın.

---

### 2. MySQL Veritabanı Oluşturun

1. **cPanel ana sayfasında** "Databases" (Veritabanları) bölümünü bulun
2. **"MySQL Databases"** (MySQL Veritabanları) seçeneğine tıklayın
3. **"Create New Database"** (Yeni Veritabanı Oluştur) bölümüne gidin

#### Veritabanı Adı:
```
stokyonetim
```
veya istediğiniz herhangi bir ad

**ÖNEMLİ:** cPanel otomatik olarak kullanıcı adınızı ekleyecektir:
- Siz yazarsanız: `stokyonetim`
- cPanel oluşturur: `kullaniciadi_stokyonetim`

4. **"Create Database"** butonuna tıklayın
5. ✅ Oluşturulan tam veritabanı adını not edin (Örn: `rea340stinfo_stokyonetim`)

---

### 3. MySQL Kullanıcısı Oluşturun

Aynı sayfada aşağı inin, **"Create New User"** (Yeni Kullanıcı Oluştur) bölümüne gidin:

1. **Kullanıcı Adı:**
   ```
   stokuser
   ```
   (cPanel ekleyecek → `kullaniciadi_stokuser`)

2. **Şifre:** Güçlü bir şifre oluşturun
   - **"Password Generator"** butonunu kullanabilirsiniz
   - Şifreyi güvenli bir yerde saklayın!

3. **"Create User"** butonuna tıklayın
4. ✅ Oluşturulan kullanıcı adını ve şifreyi not edin

---

### 4. Kullanıcıyı Veritabanına Ekleyin

Aynı sayfada aşağı inin, **"Add User To Database"** bölümüne gidin:

1. **User:** Oluşturduğunuz kullanıcıyı seçin (`kullaniciadi_stokuser`)
2. **Database:** Oluşturduğunuz veritabanını seçin (`kullaniciadi_stokyonetim`)
3. **"Add"** butonuna tıklayın

#### Yetkilendirme Ekranı:
4. **"ALL PRIVILEGES"** (Tüm Yetkiler) kutucuğunu işaretleyin
   - Bu otomatik olarak tüm yetkileri seçer
5. **"Make Changes"** butonuna tıklayın

---

### 5. Bilgileri Kaydedin

Kurulum için ihtiyacınız olan bilgiler:

```
MySQL Sunucu: localhost
MySQL Port: 3306
Veritabanı Adı: rea340stinfo_stokyonetim (sizinki farklı olacak)
Kullanıcı Adı: rea340stinfo_stokuser (sizinki farklı olacak)
Şifre: [oluşturduğunuz güçlü şifre]
```

**Bu bilgileri güvenli bir yerde saklayın!**

---

## ✅ Sonraki Adım

Veritabanı hazır! Artık kurulum sihirbazını çalıştırabilirsiniz:

```
https://yourdomain.com/install.php
```

Kurulum formunda yukarıda kaydettiğiniz bilgileri girin.

---

## 🔍 Sorun Giderme

### "Access Denied" Hatası:
- Kullanıcının veritabanına erişim yetkisi olduğundan emin olun
- cPanel > MySQL Databases > Current Databases bölümünden kontrol edin
- Kullanıcı adı ve şifrenin doğru olduğundan emin olun

### "Database does not exist" Hatası:
- Veritabanı adını eksiksiz yazdığınızdan emin olun
- Tam adı kontrol edin (Örn: `kullaniciadi_stokyonetim`)

### Şifreyi Unuttum:
1. cPanel > MySQL Databases
2. "Current Users" bölümünde kullanıcınızı bulun
3. "Change Password" linkine tıklayın
4. Yeni şifre oluşturun

---

## 📱 Mobil cPanel

Mobil cihazdan yapıyorsanız:
- Menü düzeni farklı olabilir
- "Databases" veya "MySQL" kategorisini arayın
- Adımlar aynıdır

---

## ⚠️ Önemli Notlar

1. **Güvenlik:** Asla basit şifreler kullanmayın (123456, admin123, vb.)
2. **Yedekleme:** cPanel'den düzenli veritabanı yedekleri alın
3. **İzinler:** Sadece gerekli yetkileri verin (Kurulum için ALL PRIVILEGES gerekli)
4. **Prefix:** cPanel kullanıcı adınızı her veritabanı ve kullanıcı adının başına ekler

---

## 📞 Yardım

Eğer cPanel'de bu ayarları bulamıyorsanız:
- Hosting sağlayıcınızın destek ekibine başvurun
- "MySQL veritabanı nasıl oluştururum?" diye sorun
- Bu rehberi destek ekibiyle paylaşabilirsiniz

---

**Hazırlayan:** Stok Yönetim Sistemi Kurulum Ekibi

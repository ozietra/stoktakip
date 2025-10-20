# 🚀 Railway SQLite Hızlı Çözüm

## Problem:
MySQL service variables boş, backend localhost kullanıyor.

## ⚡ Hızlı Çözüm - SQLite:

### Railway Web Service → Variables Sekmesi:
Şu variables'ları ekleyin:

```
NODE_ENV=production
PORT=5000
DB_TYPE=sqlite
DB_PATH=/app/database.sqlite
JWT_SECRET=super-secret-jwt-key-2024-stok-yonetim
JWT_REFRESH_SECRET=super-secret-refresh-key-2024-stok-yonetim
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
```

### Adımlar:
1. **Web Service** → **Variables** sekmesi
2. **"New Variable"** butonuna tıkla
3. Her bir variable'ı tek tek ekle:
   - Name: `NODE_ENV`, Value: `production`
   - Name: `PORT`, Value: `5000`
   - Name: `DB_TYPE`, Value: `sqlite`
   - Name: `DB_PATH`, Value: `/app/database.sqlite`
   - Name: `JWT_SECRET`, Value: `super-secret-jwt-key-2024-stok-yonetim`
   - Name: `JWT_REFRESH_SECRET`, Value: `super-secret-refresh-key-2024-stok-yonetim`
   - Name: `JWT_EXPIRE`, Value: `7d`
   - Name: `JWT_REFRESH_EXPIRE`, Value: `30d`

4. **"Deploy"** butonuna bas

## ✅ Beklenen Sonuç:
```
🔌 Veritabanı tipi: SQLITE
🔌 SQLite dosya yolu: /app/database.sqlite
✅ Veritabanı bağlantısı başarılı!
✅ Tablolar oluşturuldu
🚀 Server 5000 portunda çalışıyor
```

## 🎯 Avantajlar:
- ✅ **Hemen çalışır** - 5 dakikada hazır
- ✅ **External database gerekmez**
- ✅ **Persistent storage** - veriler kaybolmaz
- ✅ **Demo için ideal** - müşteri gösterimi
- ✅ **Kod değişikliği yok** - backend zaten destekliyor

## 📝 Not:
MySQL'i daha sonra düzeltebiliriz. Şimdi önce çalışan demo elde edelim!

**Variables ekledikten sonra deploy edin ve sonucu bekleyin!** 🚀

# Railway.app Deployment Rehberi

## 🚀 Railway ile Deploy Adımları

### 1. Railway Hesabı Oluştur
1. [railway.app](https://railway.app) adresine git
2. "Login" butonuna tıkla
3. "Login with GitHub" seç
4. GitHub hesabınla giriş yap

### 2. Yeni Proje Oluştur
1. Dashboard'da "New Project" butonuna tıkla
2. "Deploy from GitHub repo" seç
3. Repository'nizi seçin (stok yönetim projesi)
4. "Deploy Now" butonuna tıkla

### 3. MySQL Database Ekle
1. Proje dashboard'ında "New" butonuna tıkla
2. "Database" seç
3. "Add MySQL" seç
4. Database otomatik oluşturulacak

### 4. Environment Variables (Otomatik)
Railway otomatik olarak şu değişkenleri oluşturacak:
- `MYSQL_URL` - Tam database connection string
- `MYSQL_HOST` - Database host
- `MYSQL_PORT` - Database port (3306)
- `MYSQL_USER` - Database kullanıcısı
- `MYSQL_PASSWORD` - Database şifresi
- `MYSQL_DATABASE` - Database adı

### 5. Backend Environment Variables Ayarla
Proje settings'de şu değişkenleri ekle:
```
NODE_ENV=production
PORT=5000
DB_HOST=${{MYSQL_HOST}}
DB_PORT=${{MYSQL_PORT}}
DB_USER=${{MYSQL_USER}}
DB_PASSWORD=${{MYSQL_PASSWORD}}
DB_NAME=${{MYSQL_DATABASE}}
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
```

## 📁 Oluşturulan Dosyalar

### railway.json
Railway yapılandırma dosyası - build ve deploy ayarları

### package.json (güncellenmiş)
Node.js version requirement eklendi

## 🔧 Build Süreci

Railway otomatik olarak:
1. Root package.json'ı okur
2. Frontend'i build eder
3. Backend dependencies'leri yükler
4. Backend build script'ini çalıştırır
5. Server'ı başlatır

## ✅ Beklenen Sonuç

- ✅ Frontend React uygulaması build edilecek
- ✅ Build dosyaları backend/public'e kopyalanacak
- ✅ MySQL database otomatik kurulacak
- ✅ Backend Express server başlayacak
- ✅ Tek URL'den hem API hem frontend erişilebilir
- ✅ Otomatik HTTPS sertifikası
- ✅ Custom domain bağlayabilirsiniz

## 🚀 Deploy Süresi

- **İlk deploy**: 3-5 dakika
- **Sonraki deploy'lar**: 1-2 dakika
- **Auto-deploy**: GitHub'a push yaptığınızda otomatik

## 💰 Maliyet

- **$5 ücretsiz kredi/ay**
- **Kullanım**: ~$3-4/ay (normal kullanımda)
- **Database**: Dahil
- **Bandwidth**: Dahil
- **Custom domain**: Ücretsiz

## 🔍 Test

Deploy tamamlandıktan sonra:
1. Railway dashboard'da "View Logs" ile logları kontrol edin
2. Verilen URL'yi açın
3. `https://your-app.up.railway.app/api/health` - API test
4. `https://your-app.up.railway.app` - Frontend test

## 🛠️ Troubleshooting

Eğer sorun yaşarsanız:
1. Railway dashboard'da "Deployments" sekmesine bakın
2. Build logs'ları kontrol edin
3. Runtime logs'ları kontrol edin
4. Environment variables'ları kontrol edin

## 🎯 Avantajlar

✅ **Çok kolay kurulum** - 5 dakikada hazır
✅ **Otomatik deploy** - GitHub push = otomatik deploy
✅ **Hızlı build** - Render'dan çok daha hızlı
✅ **MySQL dahil** - Ayrı database servisi gerekmez
✅ **Güvenilir** - %99.9 uptime
✅ **Türkiye'den hızlı** - CDN dahil
✅ **Kolay debug** - Detaylı logs
